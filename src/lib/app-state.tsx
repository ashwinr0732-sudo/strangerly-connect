import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ChatSession, Message, UserSession } from "@/types";
import { MAX_INTERESTS } from "@/lib/interests";

/**
 * Temporary frontend-only state layer.
 * Later this is swapped for Supabase anonymous auth + realtime chat.
 */

const SESSION_KEY = "strangerly.session";

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createSession(): UserSession {
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
  if (typeof window === "undefined") return createSession();
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) return { ...createSession(), ...(JSON.parse(raw) as UserSession) };
  } catch {
    /* ignore */
  }
  return createSession();
}

function emptyChat(): ChatSession {
  return {
    id: `chat_${createId()}`,
    status: "idle",
    startedAt: null,
    endedAt: null,
    strangerAlias: "Anonymous Stranger",
    strangerOnline: true,
    strangerTyping: false,
    messages: [],
  };
}

interface AppStateValue {
  session: UserSession;
  chat: ChatSession;
  premiumModalOpen: boolean;
  setPremiumModalOpen: (open: boolean) => void;
  openPremiumModal: () => void;
  toggleInterest: (id: string) => void;
  addInterest: (id: string) => void;
  removeInterest: (id: string) => void;
  clearInterests: () => void;
  setMatchingMode: (mode: UserSession["matchingMode"]) => void;
  updatePreferences: (patch: Partial<UserSession["preferences"]>) => void;
  setPremium: (value: boolean) => void;
  startChat: () => void;
  nextStranger: () => void;
  endChat: () => void;
  addMessage: (message: Message) => void;
  markMessage: (id: string, patch: Partial<Message>) => void;
}

// Keep a single context instance across HMR updates. Without this, reloading
// this module creates a fresh context while mounted providers still use the
// old one, which makes useAppState throw "must be used inside AppStateProvider".
const globalStore = globalThis as unknown as {
  __strangerlyAppStateContext?: React.Context<AppStateValue | null>;
};

const AppStateContext =
  globalStore.__strangerlyAppStateContext ??
  (globalStore.__strangerlyAppStateContext = createContext<AppStateValue | null>(null));

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession>(loadSession);
  const [chat, setChat] = useState<ChatSession>(emptyChat);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

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

  const value = useMemo<AppStateValue>(
    () => ({
      session,
      chat,
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
      startChat: () =>
        setChat({
          ...emptyChat(),
          status: "active",
          startedAt: new Date().toISOString(),
        }),
      nextStranger: () =>
        setChat({
          ...emptyChat(),
          status: "active",
          startedAt: new Date().toISOString(),
        }),
      endChat: () =>
        setChat((prev) => ({
          ...prev,
          status: "ended",
          endedAt: new Date().toISOString(),
          strangerOnline: false,
          strangerTyping: false,
        })),
      addMessage: (message) =>
        setChat((prev) => ({ ...prev, messages: [...prev.messages, message] })),
      markMessage: (id, patch) =>
        setChat((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === id ? ({ ...m, ...patch } as Message) : m,
          ),
        })),
    }),
    [session, chat, premiumModalOpen, persist],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export { createId };
