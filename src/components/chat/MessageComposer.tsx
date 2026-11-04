import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Mic,
  Send,
  Smile,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PremiumFeatureLock } from "@/components/premium/PremiumFeatureLock";
import { MAX_MEDIA_BYTES, MAX_MESSAGE_LENGTH, useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const MAX_RECORD_SECONDS = 60;

type Voice =
  | { step: "idle" }
  | { step: "recording"; seconds: number }
  | { step: "preview"; blob: Blob; url: string; seconds: number }
  | { step: "sending"; blob: Blob; url: string; seconds: number };

function pickMime() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"].find((t) =>
    MediaRecorder.isTypeSupported(t),
  );
}

export function MessageComposer() {
  const { chat, session, sendMessage, sendMedia, connection } = useAppState();
  const [value, setValue] = useState("");
  const [voice, setVoice] = useState<Voice>({ step: "idle" });
  const [voiceViewOnce, setVoiceViewOnce] = useState(false);
  const [image, setImage] = useState<{ file: File; url: string; sending: boolean } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const disabled = chat.status !== "active";

  const stopTracks = () => {
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };
  useEffect(() => () => stopTracks(), []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = value.trim();
    if (!body || disabled) return;
    setValue("");
    const error = await sendMessage(body);
    if (error) {
      setValue((current) => (current ? current : body));
      toast.error(error);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording isn't supported in this browser.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      toast.error(
        (e as DOMException)?.name === "NotAllowedError"
          ? "Microphone access was denied. Allow it in your browser settings to record."
          : "No microphone available.",
      );
      return;
    }
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stopTracks();
      const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
      if (!blob.size) {
        setVoice({ step: "idle" });
        toast.error("Recording failed. Please try again.");
        return;
      }
      setVoice({ step: "preview", blob, url: URL.createObjectURL(blob), seconds });
    };
    recorderRef.current = rec;
    startRef.current = Date.now();
    rec.start();
    setVoice({ step: "recording", seconds: 0 });
    timerRef.current = window.setInterval(() => {
      const s = Math.floor((Date.now() - startRef.current) / 1000);
      if (s >= MAX_RECORD_SECONDS) rec.state === "recording" && rec.stop();
      else setVoice((v) => (v.step === "recording" ? { step: "recording", seconds: s } : v));
    }, 250);
  };

  const discardVoice = () => {
    if (voice.step === "recording") {
      const rec = recorderRef.current;
      if (rec) rec.onstop = () => stopTracks();
      rec?.stop();
    }
    if (voice.step === "preview" || voice.step === "sending") URL.revokeObjectURL(voice.url);
    setVoice({ step: "idle" });
  };

  const sendVoice = async () => {
    if (voice.step !== "preview") return;
    setVoice({ ...voice, step: "sending" });
    const err = await sendMedia("voice", voice.blob, voice.seconds, voiceViewOnce);
    if (err) {
      toast.error(err);
      setVoice({ ...voice, step: "preview" });
    } else {
      URL.revokeObjectURL(voice.url);
      setVoice({ step: "idle" });
      setVoiceViewOnce(false);
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    setImage({ file, url: URL.createObjectURL(file), sending: false });
  };

  const sendImage = async () => {
    if (!image) return;
    setImage({ ...image, sending: true });
    const err = await sendMedia("image", image.file);
    if (err) {
      toast.error(err);
      setImage({ ...image, sending: false });
    } else {
      URL.revokeObjectURL(image.url);
      setImage(null);
    }
  };

  const iconButton =
    "grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50";

  return (
    <div className="shrink-0 border-t border-border bg-background/80 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      {connection === "reconnecting" && (
        <p className="mx-auto mb-2 max-w-3xl text-center text-xs text-muted-foreground">Reconnecting...</p>
      )}

      {image && (
        <div className="mx-auto mb-3 flex max-w-3xl items-center gap-3 rounded-2xl border border-border bg-surface/60 p-3">
          <img src={image.url} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
          <p className="flex-1 text-xs text-muted-foreground">
            View-once image. The stranger can open it a single time.
          </p>
          <button type="button" aria-label="Cancel image" onClick={() => { URL.revokeObjectURL(image.url); setImage(null); }} disabled={image.sending} className={iconButton}>
            <X className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Send image" onClick={sendImage} disabled={image.sending || disabled} className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-50">
            {image.sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}

      {voice.step !== "idle" ? (
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button type="button" aria-label="Discard voice message" onClick={discardVoice} disabled={voice.step === "sending"} className={iconButton}>
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={voiceViewOnce ? "View-once is on — tap to allow replay" : "Allow replay — tap for view-once"}
            title={voiceViewOnce ? "View-once: the stranger can listen only once" : "The stranger can replay this message"}
            aria-pressed={voiceViewOnce}
            onClick={() => setVoiceViewOnce((v) => !v)}
            disabled={voice.step === "sending"}
            className={cn(iconButton, voiceViewOnce && "border-primary/60 text-primary-glow")}
          >
            {voiceViewOnce ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-border bg-surface/60 px-4 text-sm">
            {voice.step === "recording" ? (
              <>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
                Recording 0:{String(voice.seconds).padStart(2, "0")} / 1:00
              </>
            ) : (
              <audio src={voice.url} controls className="h-9 w-full" />
            )}
          </div>
          {voice.step === "recording" ? (
            <button type="button" aria-label="Stop recording" onClick={() => recorderRef.current?.stop()} className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" aria-label="Send voice message" onClick={sendVoice} disabled={voice.step === "sending" || disabled} className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground disabled:opacity-50">
              {voice.step === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
          <PremiumFeatureLock label="Send an image">
            <button type="button" aria-label="Send an image" className={iconButton} disabled={!session.isPremium || disabled} onClick={() => fileRef.current?.click()}>
              <ImageIcon className="h-4.5 w-4.5" />
            </button>
          </PremiumFeatureLock>

          <PremiumFeatureLock label="Send a voice message">
            <button type="button" aria-label="Record a voice message" className={iconButton} disabled={!session.isPremium || disabled} onClick={startRecording}>
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

          <button type="submit" aria-label="Send message" disabled={disabled || !value.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground glow transition-all hover:brightness-110 disabled:opacity-50">
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      )}
    </div>
  );
}
