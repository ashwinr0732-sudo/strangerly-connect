import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Context,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatSession, Message, MatchingMode, UserSession } from "@/types";
import { MAX_INTERESTS } from "@/lib/interests";

/**
 * Local preferences (interests, premium UI flags) live in localStorage.
 * Identity, matchmaking, chat sessions and messages live in the backend.
 */

const SESSION_KEY = "slypp.session";
const MAX_MESSAGE_LENGTH = 2000;

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createLocalSession(): UserSession {
  return {
    id: `anon_${createId()}`,
    createdAt: new Date().toISOString(),
    isPremium: false,
    interests: [],
    matchingMode: "random",
    preferences: {
      region: "Worldwide",
      matchLanguage: "English",
      showMe: "Everyone",
      notifications: true,
      sound: true,
    },
  };
}

function loadSession(): UserSession {
  if (typeof window === "undefined") return createLocalSession();
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw)
      return { ...createLocalSession(), ...(JSON.parse(raw) as UserSession) };
  } catch {
    /* ignore */
  }
  return createLocalSession();
}

function emptyChat(): ChatSession {
  return {
    id: "",
    status: "idle",
    startedAt: null,
    endedAt: null,
    strangerAlias: "Anonymous Stranger",
    strangerOnline: true,
    strangerTyping: false,
    messages: [],
  };
}

const INTRO_MESSAGE_ID = "system-intro";

function introMessage(sessionId: string): Message {
  return {
    id: INTRO_MESSAGE_ID,
    chatId: sessionId,
    author: "system",
    type: "text",
    state: "delivered",
    createdAt: new Date().toISOString(),
    body: "You're now chatting anonymously. Be kind and respect others.",
  };
}

interface MessageRow {
  id: string;
  session_id: string;
  sender_id: string;
  type?: string;
  content: string;
  created_at: string;
  media_path?: string | null;
  duration_seconds?: number | null;
  viewed_at?: string | null;
}

const MSG_COLS =
  "id, session_id, sender_id, type, content, created_at, media_path, duration_seconds, viewed_at";
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

function toMessage(row: MessageRow, userId: string | null): Message {
  const base = {
    id: row.id,
    chatId: row.session_id,
    author: (row.sender_id === userId ? "self" : "stranger") as "self" | "stranger",
    state: (row.viewed_at ? "viewed" : "delivered") as "viewed" | "delivered",
    createdAt: row.created_at,
  };
  if (row.type === "voice" && row.media_path)
    return { ...base, type: "voice", mediaPath: row.media_path, durationSeconds: row.duration_seconds ?? 0 };
  if (row.type === "image" && row.media_path)
    return {
      ...base,
      type: "image",
      mediaPath: row.media_path,
      isViewOnce: true,
      viewedAt: row.viewed_at ?? null,
      expiresAt: null,
    };
  return { ...base, type: "text", body: row.content };
}

/** Short in-app chime via Web Audio (no asset, no network). Silently ignored if autoplay is blocked. */
let audioCtx: AudioContext | null = null;
function playChime() {
  try {
    const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return;
    audioCtx ??= new Ctor();
    const ctx = audioCtx!;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    /* ignore */
  }
}

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "ready"
  | "error";
export type MatchState = "idle" | "finding" | "matched" | "cancelled" | "error";
export type ConnectionState = "online" | "reconnecting";

interface AppStateValue {
  session: UserSession;
  userId: string | null;
  authStatus: AuthStatus;
  chat: ChatSession;
  matchState: MatchState;
  connection: ConnectionState;
  hasActiveChat: boolean;
  sharedInterests: string[];
  premiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;
  openPremiumModal: () => void;
  toggleInterest: (id: string) => void;
  addInterest: (id: string) => void;
  removeInterest: (id: string) => void;
  clearInterests: () => void;
  setMatchingMode: (mode: MatchingMode) => void;
  updatePreferences: (patch: Partial<UserSession["preferences"]>) => void;
  /** Re-reads the backend Premium entitlement (the only source of truth). */
  refreshPremium: () => Promise<void>;
  sendMedia: (kind: "voice" | "image", blob: Blob, durationSeconds?: number) => Promise<string | null>;
  markImageViewed: (id: string) => void;
  startMatching: () => void;
  cancelMatching: () => Promise<void>;
  sendMessage: (text: string) => Promise<string | null>;
  nextStranger: () => Promise<void>;
  endChat: () => Promise<void>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
}

// Keep a single context instance across HMR updates.
const globalStore = globalThis as unknown as {
  __slyppAppStateContext?: Context<AppStateValue | null>;
};

const AppStateContext =
  globalStore.__slyppAppStateContext ??
  (globalStore.__slyppAppStateContext = createContext<AppStateValue | null>(
    null,
  ));

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(loadSession);
  const [chat, setChat] = useState<ChatSession>(emptyChat);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [connection, setConnection] = useState<ConnectionState>("online");
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  const prefsRef = useRef(session.preferences);
  prefsRef.current = session.preferences;
  const alertedRef = useRef(new Set<string>());

  const notifyIncoming = useCallback((row: MessageRow, uid: string) => {
    if (row.sender_id === uid || alertedRef.current.has(row.id)) return;
    alertedRef.current.add(row.id);
    const prefs = prefsRef.current;
    if (prefs.sound) playChime();
    if (
      prefs.notifications &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      document.visibilityState === "hidden"
    ) {
      try {
        // Never include message content or any identity — only a generic alert.
        new Notification("Slypp", { body: "New message from Anonymous Stranger", tag: row.id });
      } catch {
        /* some mobile browsers only allow notifications from a service worker */
      }
    }
  }, []);

  const refreshPremium = useCallback(async () => {
    if (!userId) {
      setIsPremium(false);
      return;
    }
    const { data } = await supabase.rpc("is_premium", { p_user: userId });
    setIsPremium(data === true);
  }, [userId]);

  useEffect(() => {
    void refreshPremium();
  }, [refreshPremium]);

  const matchPrefs = useRef({ mode: session.matchingMode, interests: session.interests });
  matchPrefs.current = { mode: session.matchingMode, interests: session.interests };

  const persist = useCallback((next: UserSession) => {
    setSession(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, []);

  /* ---------------- google account session ----------------
   * The Google account is the private Slypp account identity only.
   * Nothing from it is ever surfaced to the other chat participant. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;
        // Anonymous sessions are not valid accounts — Google sign-in only.
        const user = error ? null : (data.user ?? null);
        const uid = user && !user.is_anonymous ? user.id : null;
        setUserId(uid);
        setAuthStatus(uid ? "authenticated" : "unauthenticated");
      } catch {
        if (!cancelled) setAuthStatus("unauthenticated");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED")
        return;
      const uid = sess?.user && !sess.user.is_anonymous ? sess.user.id : null;
      setUserId(uid);
      setAuthStatus(uid ? "authenticated" : "unauthenticated");
      if (!uid) {
        setActiveSessionId(null);
        setChat(emptyChat());
        setMatchState("idle");
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* ---------------- resume an active chat ---------------- */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_sessions")
        .select("id, created_at")
        .eq("status", "active")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(1);
      const row = data?.[0];
      if (!cancelled && row) {
        setActiveSessionId(row.id);
        setMatchState("matched");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ---------------- load + subscribe to the active session ---------------- */
  useEffect(() => {
    if (!activeSessionId || !userId) return;
    let cancelled = false;

    setChat({
      ...emptyChat(),
      id: activeSessionId,
      status: "active",
      startedAt: new Date().toISOString(),
      messages: [introMessage(activeSessionId)],
    });

    const appendRow = (row: MessageRow) => {
      setChat((prev) => {
        if (prev.messages.some((m) => m.id === row.id)) return prev;
        return { ...prev, messages: [...prev.messages, toMessage(row, userId)] };
      });
    };

    setSharedInterests([]);
    (async () => {
      const { data: sess } = await (supabase as any)
        .from("chat_sessions")
        .select("shared_interests, status")
        .eq("id", activeSessionId)
        .maybeSingle();
      if (!cancelled && sess) {
        setSharedInterests((sess.shared_interests as string[] | null) ?? []);
        if (sess.status === "ended")
          setChat((prev) => ({ ...prev, status: "ended", strangerOnline: false }));
      }
    })();

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select(MSG_COLS)
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });
      if (cancelled || !data) return;
      setChat((prev) => ({
        ...prev,
        messages: [
          introMessage(activeSessionId),
          ...(data as MessageRow[]).map((row) => toMessage(row, userId)),
        ],
      }));
    })();

    const channel = supabase
      .channel(`chat:${activeSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          appendRow(row);
          notifyIncoming(row, userId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setChat((prev) => ({
            ...prev,
            messages: prev.messages.map((m) => (m.id === row.id ? toMessage(row, userId) : m)),
          }));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
          filter: `id=eq.${activeSessionId}`,
        },
        (payload) => {
          const next = payload.new as { status: string; ended_at: string | null };
          if (next.status === "ended") {
            setChat((prev) => ({
              ...prev,
              status: "ended",
              strangerOnline: false,
              strangerTyping: false,
              endedAt: next.ended_at ?? new Date().toISOString(),
            }));
          }
        },
      )
      .subscribe((status) => {
        setConnection(status === "SUBSCRIBED" ? "online" : "reconnecting");
      });

    return () => {
      cancelled = true;
      setConnection("online");
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, userId]);

  /* ---------------- matchmaking polling ---------------- */
  useEffect(() => {
    if (matchState !== "finding" || !userId) return;
    let stopped = false;

    const tick = async () => {
      const { data, error } = await supabase.rpc("request_match", {
        p_mode: matchPrefs.current.mode,
        p_interests: matchPrefs.current.interests,
      });
      if (stopped) return;
      if (error) {
        // Make failures visible (message only — never tokens or account data).
        console.warn("[slypp] matchmaking request failed:", error.message);
        setMatchState("error");
        return;
      }
      if (data) {
        setActiveSessionId(data as string);
        setMatchState("matched");
      }
    };

    void tick();
    const timer = window.setInterval(() => void tick(), 2000);
    // Mobile browsers pause timers in background tabs, which lets the queue
    // heartbeat expire and other users drop us as stale. Refresh instantly
    // when the page becomes visible again.
    const onVisibility = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [matchState, userId]);

  /* ---------------- actions ---------------- */
  const startMatching = useCallback(() => {
    setActiveSessionId(null);
    setChat(emptyChat());
    setMatchState("finding");
  }, []);

  const cancelMatching = useCallback(async () => {
    setMatchState("cancelled");
    await supabase.rpc("leave_queue");
  }, []);

  const endChat = useCallback(async () => {
    const current = activeSessionId;
    setActiveSessionId(null);
    setChat(emptyChat());
    setMatchState("idle");
    if (current) await supabase.rpc("end_chat_session", { p_session: current });
    await supabase.rpc("leave_queue");
  }, [activeSessionId]);

  const nextStranger = useCallback(async () => {
    const current = activeSessionId;
    setActiveSessionId(null);
    setChat(emptyChat());
    if (current) await supabase.rpc("end_chat_session", { p_session: current });
    setMatchState("finding");
  }, [activeSessionId]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) return "Couldn't sign in with Google. Please try again.";
      return null;
    } catch {
      return "Couldn't sign in with Google. Please try again.";
    }
  }, []);

  const signOut = useCallback(async () => {
    const current = activeSessionId;
    setActiveSessionId(null);
    setChat(emptyChat());
    setMatchState("idle");
    try {
      if (current) await supabase.rpc("end_chat_session", { p_session: current });
      await supabase.rpc("leave_queue");
    } catch {
      /* ignore — signing out regardless */
    }
    await supabase.auth.signOut();
    setUserId(null);
    setAuthStatus("unauthenticated");
  }, [activeSessionId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content) return "Message can't be empty.";
      if (content.length > MAX_MESSAGE_LENGTH)
        return `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`;
      if (!activeSessionId || !userId) return "This chat is no longer active.";

      const { data, error } = await supabase
        .from("messages")
        .insert({ session_id: activeSessionId, sender_id: userId, content, type: "text" })
        .select(MSG_COLS)
        .single();

      if (error || !data) return "Something went wrong. Try again.";

      setChat((prev) =>
        prev.messages.some((m) => m.id === data.id)
          ? prev
          : { ...prev, messages: [...prev.messages, toMessage(data as MessageRow, userId)] },
      );
      return null;
    },
    [activeSessionId, userId],
  );

  const sendMedia = useCallback(
    async (kind: "voice" | "image", blob: Blob, durationSeconds?: number) => {
      if (!activeSessionId || !userId) return "This chat is no longer active.";
      if (!isPremium) return "This is a Premium feature.";
      if (blob.size === 0) return "Nothing to send.";
      if (blob.size > MAX_MEDIA_BYTES) return "File is too large (max 5 MB).";
      const ext =
        kind === "image"
          ? (blob.type.split("/")[1] ?? "jpg").replace("jpeg", "jpg")
          : blob.type.includes("mp4")
            ? "m4a"
            : blob.type.includes("ogg")
              ? "ogg"
              : "webm";
      const path = `${activeSessionId}/${userId}/${kind}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("chat-media")
        .upload(path, blob, { contentType: blob.type || "application/octet-stream", upsert: false });
      if (up.error) return "Upload failed. Check your connection and try again.";
      const { data, error } = await supabase
        .from("messages")
        .insert({
          session_id: activeSessionId,
          sender_id: userId,
          type: kind,
          content: "",
          media_path: path,
          duration_seconds: durationSeconds ? Math.round(durationSeconds) : null,
        })
        .select(MSG_COLS)
        .single();
      if (error || !data) {
        void supabase.storage.from("chat-media").remove([path]);
        return error?.message.includes("Premium")
          ? "Premium is required to send this."
          : "Couldn't send. Try again.";
      }
      setChat((prev) =>
        prev.messages.some((m) => m.id === data.id)
          ? prev
          : { ...prev, messages: [...prev.messages, toMessage(data as MessageRow, userId)] },
      );
      return null;
    },
    [activeSessionId, userId, isPremium],
  );

  const markImageViewed = useCallback((id: string) => {
    setChat((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === id && m.type === "image"
          ? { ...m, viewedAt: m.viewedAt ?? new Date().toISOString(), state: "viewed" }
          : m,
      ),
    }));
  }, []);

  const sessionView = useMemo(() => ({ ...session, isPremium }), [session, isPremium]);

  const value = useMemo<AppStateValue>(
    () => ({
      session: sessionView,
      userId,
      authStatus,
      chat,
      matchState,
      connection,
      hasActiveChat: Boolean(activeSessionId),
      sharedInterests,
      premiumModalOpen,
      setPremiumModalOpen,
      openPremiumModal: () => setPremiumModalOpen(true),
      toggleInterest: (id) =>
        persist({
          ...session,
          interests: session.interests.includes(id)
            ? session.interests.filter((i) => i !== id)
            : session.interests.length >= MAX_INTERESTS
              ? session.interests
              : [...session.interests, id],
        }),
      addInterest: (id) =>
        session.interests.includes(id) || session.interests.length >= MAX_INTERESTS
          ? undefined
          : persist({ ...session, interests: [...session.interests, id] }),
      removeInterest: (id) =>
        persist({ ...session, interests: session.interests.filter((i) => i !== id) }),
      clearInterests: () => persist({ ...session, interests: [] }),
      setMatchingMode: (matchingMode) => persist({ ...session, matchingMode }),
      updatePreferences: (patch) =>
        persist({ ...session, preferences: { ...session.preferences, ...patch } }),
      refreshPremium,
      sendMedia,
      markImageViewed,
      startMatching,
      cancelMatching,
      sendMessage,
      nextStranger,
      endChat,
      signInWithGoogle,
      signOut,
    }),
    [
      session,
      userId,
      authStatus,
      chat,
      matchState,
      connection,
      activeSessionId,
      sharedInterests,
      premiumModalOpen,
      persist,
      startMatching,
      cancelMatching,
      sendMessage,
      sessionView,
      refreshPremium,
      sendMedia,
      markImageViewed,
      nextStranger,
      endChat,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export { createId, MAX_MESSAGE_LENGTH };
