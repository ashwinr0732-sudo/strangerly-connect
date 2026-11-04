import { Eye, ImageOff, Lock, MicOff } from "lucide-react";
import type { ImageMessage, VoiceMessage } from "@/types";

export type ViewOnceMedia = ImageMessage | VoiceMessage;

interface Props {
  message: ViewOnceMedia;
  mine: boolean;
  onOpen: (message: ViewOnceMedia) => void;
}

export function ViewOnceMessage({ message, mine, onOpen }: Props) {
  const consumed = Boolean(message.viewedAt);
  const isVoice = message.type === "voice";

  return (
    <div className="w-60 rounded-2xl border border-border bg-surface/60 p-4 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
        {consumed ? (
          isVoice ? (
            <MicOff className="h-6 w-6 text-muted-foreground" />
          ) : (
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          )
        ) : (
          <Lock className="h-6 w-6 text-primary-glow" />
        )}
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">
        View-once {isVoice ? "voice" : "image"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {mine
          ? consumed
            ? "Opened by the stranger."
            : isVoice
              ? "Sent. The stranger can listen once."
              : "Sent. The stranger can open it once."
          : consumed
            ? isVoice
              ? "Already listened."
              : "Already viewed."
            : isVoice
              ? "This voice message can only be listened to once."
              : "This image can only be viewed once."}
      </p>
      {isVoice && !mine && !consumed && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {Math.round(message.durationSeconds)}s recording
        </p>
      )}
      {!mine && (
        <button
          type="button"
          disabled={consumed}
          onClick={() => onOpen(message)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Eye className="h-4 w-4" /> {consumed ? "Unavailable" : isVoice ? "Tap to listen" : "Tap to view"}
        </button>
      )}
    </div>
  );
}
