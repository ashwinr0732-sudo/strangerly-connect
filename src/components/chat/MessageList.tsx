import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ViewOnceViewer } from "@/components/chat/ViewOnceViewer";
import { useAppState } from "@/lib/app-state";
import type { ImageMessage } from "@/types";

export function MessageList() {
  const { chat, markMessage } = useAppState();
  const [viewing, setViewing] = useState<ImageMessage | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.strangerTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-center text-xs text-muted-foreground">Today</p>
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onOpenViewOnce={(m) => {
              setViewing(m);
              markMessage(m.id, {
                viewedAt: new Date().toISOString(),
                state: "viewed",
              } as Partial<ImageMessage>);
            }}
          />
        ))}
        {chat.strangerTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>
      <ViewOnceViewer message={viewing} onOpenChange={() => setViewing(null)} />
    </div>
  );
}
