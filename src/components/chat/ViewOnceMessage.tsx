import { Eye, ImageOff, Lock } from "lucide-react";
import type { ImageMessage } from "@/types";

interface Props {
  message: ImageMessage;
  onOpen: (message: ImageMessage) => void;
}

export function ViewOnceMessage({ message, onOpen }: Props) {
  const consumed = Boolean(message.viewedAt);

  return (
    <div className="w-60 rounded-2xl border border-border bg-surface/60 p-4 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
        {consumed ? (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Lock className="h-6 w-6 text-primary-glow" />
        )}
      </span>
      <p className="mt-3 text-sm font-semibold">View-once image</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {consumed ? "Already viewed." : "This image can only be viewed once."}
      </p>
      <button
        type="button"
        disabled={consumed}
        onClick={() => onOpen(message)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        <Eye className="h-4 w-4" /> {consumed ? "Unavailable" : "Tap to view"}
      </button>
    </div>
  );
}
