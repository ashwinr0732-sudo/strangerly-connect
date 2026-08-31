import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VoiceMessage as VoiceMessageType } from "@/types";

const BARS = Array.from({ length: 28 }, (_, i) => 30 + ((i * 37) % 70));

export function VoiceMessage({
  message,
  mine,
}: {
  message: VoiceMessageType;
  mine: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const seconds = message.durationSeconds;
  const label = `0:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          mine ? "bg-primary-foreground/20" : "bg-gradient-primary",
        )}
      >
        {playing ? (
          <Pause className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Play className="h-4 w-4 text-primary-foreground" />
        )}
      </button>
      <div className="flex h-8 flex-1 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-full",
              mine ? "bg-primary-foreground/70" : "bg-primary-glow/70",
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
