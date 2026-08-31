export type MessageType = "text" | "image" | "voice";
export type MessageState = "sent" | "delivered" | "viewed";
export type MessageAuthor = "self" | "stranger" | "system";

export interface BaseMessage {
  id: string;
  chatId: string;
  author: MessageAuthor;
  state: MessageState;
  createdAt: string;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  body: string;
}

export interface ImageMessage extends BaseMessage {
  type: "image";
  url: string;
  caption?: string;
  isViewOnce: boolean;
  viewedAt: string | null;
  expiresAt: string | null;
}

export interface VoiceMessage extends BaseMessage {
  type: "voice";
  url: string;
  durationSeconds: number;
}

export type Message = TextMessage | ImageMessage | VoiceMessage;

export interface Interest {
  id: string;
  label: string;
  icon: string;
}

export type MatchingMode = "random" | "interests";

export interface UserSession {
  /** Anonymous session id — later replaced by Supabase anonymous auth uid. */
  id: string;
  createdAt: string;
  isPremium: boolean;
  interests: string[];
  matchingMode: MatchingMode;
  preferences: {
    region: string;
    matchLanguage: string;
    showMe: string;
    notifications: boolean;
    sound: boolean;
  };
}

export type ChatStatus = "idle" | "searching" | "active" | "ended";

export interface ChatSession {
  id: string;
  status: ChatStatus;
  startedAt: string | null;
  endedAt: string | null;
  strangerAlias: string;
  strangerOnline: boolean;
  messages: Message[];
  strangerTyping: boolean;
}

export type PremiumPlanId = "week" | "month" | "year";

export interface PremiumPlan {
  id: PremiumPlanId;
  name: string;
  price: number;
  currency: string;
  cadence: string;
  billingNote: string;
  badge?: string;
  popular?: boolean;
}

export type PremiumFeatureKey =
  | "view-once-images"
  | "voice-messages"
  | "priority-matching"
  | "region-preference"
  | "advanced-matching"
  | "ad-free";
