import { Check, CheckCheck } from "lucide-react";
import { VoiceMessage } from "@/components/chat/VoiceMessage";
import { ViewOnceMessage } from "@/components/chat/ViewOnceMessage";
import { cn } from "@/lib/utils";
import type { ImageMessage, Message } from "@/types";

interface Props {
  message: Message;
  onOpenViewOnce: (message: ImageMessage) => void;
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({ message, onOpenViewOnce }: Props) {
  if (message.author === "system") {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-surface/60 px-4 py-3 text-center text-xs text-muted-foreground">
        {message.type === "text" ? message.body : "System message"}
      </div>
    );
  }

  const mine = message.author === "self";

  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[70%]",
          mine
            ? "bg-gradient-primary text-primary-foreground rounded-br-md"
            : "border border-border bg-surface/70 rounded-bl-md",
        )}
      >
        {message.type === "text" && <p className="leading-relaxed">{message.body}</p>}
        {message.type === "voice" && <VoiceMessage message={message} mine={mine} />}
        {message.type === "image" &&
          (message.isViewOnce ? (
            <ViewOnceMessage message={message} onOpen={onOpenViewOnce} />
          ) : (
            <img
              src={message.url}
              alt={message.caption ?? "Shared image"}
              className="max-h-64 rounded-xl"
            />
          ))}
      </div>
      <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
        {timeOf(message.createdAt)}
        {mine &&
          (message.state === "sent" ? (
            <Check className="h-3 w-3" />
          ) : (
            <CheckCheck
              className={cn("h-3 w-3", message.state === "viewed" && "text-primary-glow")}
            />
          ))}
      </span>
    </div>
  );
}
