import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ImageMessage } from "@/types";

interface Props {
  message: ImageMessage | null;
  onOpenChange: (open: boolean) => void;
}

export function ViewOnceViewer({ message, onOpenChange }: Props) {
  return (
    <Dialog open={Boolean(message)} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md rounded-3xl border-border p-6 text-center">
        <DialogTitle className="sr-only">View-once image</DialogTitle>
        {message?.url ? (
          <img
            src={message.url}
            alt={message.caption ?? "View-once image"}
            className="mx-auto max-h-[70dvh] rounded-2xl"
          />
        ) : (
          <div className="grid place-items-center gap-3 py-10">
            <Eye className="h-10 w-10 text-primary-glow" />
            <p className="text-sm text-muted-foreground">
              This image has already been viewed and is no longer available.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
