import { Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type ViewerState =
  | { status: "closed" }
  | { status: "loading" }
  | { status: "ready"; url: string; kind: "image" | "voice" }
  | { status: "unavailable"; reason: string };

interface Props {
  state: ViewerState;
  onClose: () => void;
}

export function ViewOnceViewer({ state, onClose }: Props) {
  return (
    <Dialog open={state.status !== "closed"} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card max-w-md rounded-3xl border-border p-6 text-center">
        <DialogTitle className="sr-only">View-once message</DialogTitle>
        {state.status === "ready" ? (
          <div className="space-y-3">
            {state.kind === "voice" ? (
              <audio src={state.url} controls autoPlay className="w-full" />
            ) : (
              <img
                src={state.url}
                alt="View-once image"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="mx-auto max-h-[70dvh] select-none rounded-xl print:hidden [-webkit-touch-callout:none]"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {state.kind === "voice"
                ? "Closing this removes the voice message for good. It can only be listened to once."
                : "Closing this removes the image for good. Screenshot protection is limited by your device and browser."}
            </p>
          </div>
        ) : state.status === "loading" ? (
          <div className="grid place-items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary-glow" />
          </div>
        ) : state.status === "unavailable" ? (
          <div className="grid place-items-center gap-3 py-10">
            <Eye className="h-10 w-10 text-primary-glow" />
            <p className="text-sm text-muted-foreground">{state.reason}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
