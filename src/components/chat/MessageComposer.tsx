import { Image as ImageIcon, Mic, Send, Smile } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PremiumFeatureLock } from "@/components/premium/PremiumFeatureLock";
import { MAX_MESSAGE_LENGTH, useAppState } from "@/lib/app-state";

export function MessageComposer() {
  const { chat, session, sendMessage, connection } = useAppState();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const disabled = chat.status !== "active";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = value.trim();
    if (!body || disabled || sending) return;
    setSending(true);
    const previous = value;
    setValue("");
    const error = await sendMessage(body);
    setSending(false);
    if (error) {
      setValue(previous);
      toast.error(error);
    }
  };

  const iconButton =
    "grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="shrink-0 border-t border-border bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      {connection === "reconnecting" && (
        <p className="mx-auto mb-2 max-w-3xl text-center text-xs text-muted-foreground">
          Reconnecting...
        </p>
      )}
      <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-2">
        <PremiumFeatureLock label="Send an image">
          <button
            type="button"
            aria-label="Send an image"
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
            className={iconButton}
            disabled={!session.isPremium}
          >
            <Mic className="h-4.5 w-4.5" />
          </button>
        </PremiumFeatureLock>

        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            disabled={disabled}
            placeholder={disabled ? "Chat ended" : "Type a message..."}
            className="h-12 w-full rounded-2xl border border-border bg-surface/60 pl-4 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          />
          <Smile className="pointer-events-none absolute right-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled || sending}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground glow transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
