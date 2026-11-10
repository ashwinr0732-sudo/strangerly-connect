import { Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { VoiceMessage as VoiceMessageType } from "@/types";

const BARS = Array.from({ length: 24 }, (_, i) => 30 + ((i * 37) % 70));

export type VoicePlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

function fmt(s: number) {
  const n = Math.max(0, Math.round(s));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}

interface VoicePlayerFrameProps {
  status: VoicePlayerStatus;
  progress: number;
  durationLabel: string;
  ariaLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}

export function VoicePlayerFrame({
  status,
  progress,
  durationLabel,
  ariaLabel,
  onToggle,
  disabled = false,
}: VoicePlayerFrameProps) {
  const Icon = status === "loading" ? Loader2 : status === "playing" ? Pause : status === "error" ? RotateCcw : Play;
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-voice-accent/25 bg-surface px-2.5 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        disabled={disabled || status === "loading"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-voice-accent/15 text-voice-accent transition-colors hover:bg-voice-accent/25 disabled:opacity-50"
      >
        <Icon className={cn("h-4 w-4", status === "loading" && "animate-spin")} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-center gap-[2px] overflow-hidden" aria-hidden="true">
          {BARS.map((height, index) => (
            <span
              key={index}
              className={cn(
                "w-[2px] shrink-0 rounded-full",
                index / BARS.length < safeProgress ? "bg-voice-accent" : "bg-voice-accent/30",
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-voice-accent/15">
          <span
            className="block h-full rounded-full bg-voice-accent transition-[width] duration-150"
            style={{ width: `${safeProgress * 100}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-voice-accent">
        {durationLabel}
      </span>
    </div>
  );
}

export function VoiceMessage({ message, mine }: { message: VoiceMessageType; mine: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<VoicePlayerStatus>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = async () => {
    const existing = audioRef.current;
    if (existing && status === "playing") {
      existing.pause();
      return;
    }
    if (existing && status === "paused") {
      void existing.play().catch(() => setStatus("error"));
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

  return (
    <VoicePlayerFrame
      status={status}
      progress={progress}
      durationLabel={status === "error" ? "Retry" : `${fmt(progress * message.durationSeconds)} / ${fmt(message.durationSeconds)}`}
      ariaLabel={
        status === "playing" ? "Pause voice message" : status === "error" ? "Retry voice message" : "Play voice message"
      }
      onToggle={toggle}
    />
  );
}
