import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createId, useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Anonymous chat — strangerly" },
      {
        name: "description",
        content: "Chat anonymously with a stranger. Be kind and respect others.",
      },
      { property: "og:title", content: "Anonymous chat — strangerly" },
      {
        property: "og:description",
        content: "Your anonymous conversation on strangerly.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { chat, startChat, nextStranger, endChat, addMessage } = useAppState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (chat.status === "idle") startChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chat.status !== "active" || chat.messages.length > 0) return;
    addMessage({
      id: createId(),
      chatId: chat.id,
      author: "system",
      type: "text",
      state: "delivered",
      createdAt: new Date().toISOString(),
      body: "You're now chatting anonymously. Be kind and respect others.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.status, chat.id]);

  return (
    <div className="flex h-dvh bg-background">
      <Sidebar className="hidden lg:flex" />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-space" aria-hidden />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <ChatHeader
            onNext={nextStranger}
            onOpenMenu={() => setDrawerOpen(true)}
          />
          <MessageList />
          <MessageComposer />
          <div className="border-t border-border bg-background/80 px-3 py-2 text-center lg:hidden">
            <PrimaryButton
              variant="danger"
              size="sm"
              onClick={() => {
                endChat();
                navigate({ to: "/" });
              }}
            >
              End Chat
            </PrimaryButton>
          </div>
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 border-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Sidebar className="w-full border-r-0" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
