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
  content: string;
  created_at: string;
}

function toMessage(row: MessageRow, userId: string | null): Message {
  return {
    id: row.id,
    chatId: row.session_id,
    author: row.sender_id === userId ? "self" : "stranger",
    type: "text",
    state: "delivered",
    createdAt: row.created_at,
    body: row.content,
  };
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
  premiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;
  openPremiumModal: () => void;
  toggleInterest: (id: string) => void;
  addInterest: (id: string) => void;
  removeInterest: (id: string) => void;
  clearInterests: () => void;
  setMatchingMode: (mode: MatchingMode) => void;
  updatePreferences: (patch: Partial<UserSession["preferences"]>) => void;
  setPremium: (value: boolean) => void;
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

  /* ---------------- anonymous auth ---------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        let uid = data.session?.user.id ?? null;
        if (!uid) {
          const { data: anon, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          uid = anon.user?.id ?? null;
        }
        if (cancelled) return;
        setUserId(uid);
        setAuthStatus(uid ? "ready" : "error");
      } catch {
        if (!cancelled) setAuthStatus("error");
      }
    })();
    return () => {
      cancelled = true;
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

    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, session_id, sender_id, content, created_at")
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
        (payload) => appendRow(payload.new as MessageRow),
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
    return () => {
      stopped = true;
      window.clearInterval(timer);
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
        .select("id, session_id, sender_id, content, created_at")
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

  const value = useMemo<AppStateValue>(
    () => ({
      session,
      userId,
      authStatus,
      chat,
      matchState,
      connection,
      hasActiveChat: Boolean(activeSessionId),
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
      setPremium: (isPremium) => persist({ ...session, isPremium }),
      startMatching,
      cancelMatching,
      sendMessage,
      nextStranger,
      endChat,
    }),
    [
      session,
      userId,
      authStatus,
      chat,
      matchState,
      connection,
      activeSessionId,
      premiumModalOpen,
      persist,
      startMatching,
      cancelMatching,
      sendMessage,
      nextStranger,
      endChat,
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
