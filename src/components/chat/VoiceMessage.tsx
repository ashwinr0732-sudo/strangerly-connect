import { Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { VoiceMessage as VoiceMessageType } from "@/types";

const BARS = Array.from({ length: 28 }, (_, i) => 30 + ((i * 37) % 70));

function fmt(s: number) {
  const n = Math.max(0, Math.round(s));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}

export function VoiceMessage({ message, mine }: { message: VoiceMessageType; mine: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused" | "error">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = async () => {
    const existing = audioRef.current;
    if (existing && status === "playing") {
      existing.pause();
      return;
    }
    if (existing && status === "paused") {
      void existing.play();
      return;
    }
    setStatus("loading");
    // Short-lived signed URL; storage policy only signs for this chat's participants.
    const { data, error } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(message.mediaPath, 300);
    if (error || !data) {
      setStatus("error");
      return;
    }
    const audio = new Audio(data.signedUrl);
    audioRef.current = audio;
    audio.onplay = () => setStatus("playing");
    audio.onpause = () => setStatus((s) => (s === "error" ? s : "paused"));
    audio.ontimeupdate = () =>
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    audio.onended = () => {
      setStatus("idle");
      setProgress(0);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setStatus("error");
      audioRef.current = null;
    };
    audio.play().catch(() => {
      setStatus("error");
      audioRef.current = null;
    });
  };

  const Icon =
    status === "loading" ? Loader2 : status === "playing" ? Pause : status === "error" ? RotateCcw : Play;

  return (
    <div className="flex min-w-52 items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={
          status === "playing" ? "Pause voice message" : status === "error" ? "Retry voice message" : "Play voice message"
        }
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          mine ? "bg-primary-foreground/20" : "bg-gradient-primary",
        )}
      >
        <Icon className={cn("h-4 w-4 text-primary-foreground", status === "loading" && "animate-spin")} />
      </button>
      <div className="flex h-8 flex-1 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-full",
              i / BARS.length < progress
                ? mine ? "bg-primary-foreground" : "bg-primary-glow"
                : mine ? "bg-primary-foreground/50" : "bg-primary-glow/50",
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {status === "error" ? "Couldn't play — tap to retry" : fmt(message.durationSeconds)}
      </span>
    </div>
  );
}
