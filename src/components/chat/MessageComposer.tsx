import { Image as ImageIcon, Mic, Send, Smile } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PremiumFeatureLock } from "@/components/premium/PremiumFeatureLock";
import { createId, useAppState } from "@/lib/app-state";
import type { ImageMessage, VoiceMessage } from "@/types";

export function MessageComposer() {
  const { chat, session, addMessage } = useAppState();
  const [value, setValue] = useState("");
  const disabled = chat.status !== "active";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = value.trim();
    if (!body || disabled) return;
    addMessage({
      id: createId(),
      chatId: chat.id,
      author: "self",
      type: "text",
      state: "sent",
      createdAt: new Date().toISOString(),
      body,
    });
    setValue("");
  };

  const sendViewOnceImage = () => {
    const now = new Date();
    const message: ImageMessage = {
      id: createId(),
      chatId: chat.id,
      author: "self",
      type: "image",
      state: "sent",
      createdAt: now.toISOString(),
      url: "",
      isViewOnce: true,
      viewedAt: null,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
    addMessage(message);
  };

  const sendVoice = () => {
    const message: VoiceMessage = {
      id: createId(),
      chatId: chat.id,
      author: "self",
      type: "voice",
      state: "sent",
      createdAt: new Date().toISOString(),
      url: "",
      durationSeconds: 12,
    };
    addMessage(message);
  };

  const iconButton =
    "grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="shrink-0 border-t border-border bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-2">
        <PremiumFeatureLock label="Send an image">
          <button
            type="button"
            aria-label="Send an image"
            onClick={sendViewOnceImage}
            className={iconButton}
            disabled={!session.isPremium}
          >
            <ImageIcon className="h-4.5 w-4.5" />
          </button>
        </PremiumFeatureLock>

        <PremiumFeatureLock label="Send a voice message">
          <button
            type="button"
            aria-label="Send a voice message"
            onClick={sendVoice}
            className={iconButton}
            disabled={!session.isPremium}
          >
            <Mic className="h-4.5 w-4.5" />
          </button>
        </PremiumFeatureLock>

        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={disabled ? "Chat ended" : "Type a message..."}
            className="h-12 w-full rounded-2xl border border-border bg-surface/60 pl-4 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          />
          <Smile className="pointer-events-none absolute right-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground glow transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
