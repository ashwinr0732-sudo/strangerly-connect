import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageComposer } from "@/components/chat/MessageComposer";
import { MessageList } from "@/components/chat/MessageList";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { GlassCard } from "@/components/common/GlassCard";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/lib/app-state";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Anonymous chat — slypp" },
      {
        name: "description",
        content: "Chat anonymously with a stranger. Be kind and respect others.",
      },
      { property: "og:title", content: "Anonymous chat — slypp" },
      {
        property: "og:description",
        content: "Your anonymous conversation on slypp.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { chat, hasActiveChat, authStatus, nextStranger, endChat, startMatching } =
    useAppState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // No conversation to show — send the visitor back to the start of the flow.
  useEffect(() => {
    if (authStatus === "ready" && !hasActiveChat && chat.status === "idle") {
      navigate({ to: "/interests" });
    }
  }, [authStatus, hasActiveChat, chat.status, navigate]);

  const handleNext = async () => {
    if (busy) return;
    setBusy(true);
    await nextStranger();
    setBusy(false);
    navigate({ to: "/matching" });
  };

  const handleEnd = async () => {
    if (busy) return;
    setBusy(true);
    await endChat();
    setBusy(false);
    navigate({ to: "/" });
  };

  const findSomeoneNew = async () => {
    if (busy) return;
    setBusy(true);
    await endChat();
    startMatching();
    setBusy(false);
    navigate({ to: "/matching" });
  };

  return (
    <div className="flex h-dvh bg-background">
      <Sidebar className="hidden lg:flex" />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-space" aria-hidden />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <ChatHeader onNext={handleNext} onOpenMenu={() => setDrawerOpen(true)} />
          <MessageList />

          {chat.status === "ended" ? (
            <div className="shrink-0 border-t border-border bg-background/80 px-3 py-5 backdrop-blur-xl sm:px-6">
              <GlassCard className="mx-auto max-w-md p-5 text-center">
                <p className="text-sm font-semibold">Stranger disconnected</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This conversation has ended.
                </p>
                <PrimaryButton block className="mt-4" onClick={findSomeoneNew}>
                  Find someone new
                </PrimaryButton>
              </GlassCard>
            </div>
          ) : (
            <>
              <MessageComposer />
              <div className="border-t border-border bg-background/80 px-3 py-2 text-center lg:hidden">
                <PrimaryButton variant="danger" size="sm" onClick={handleEnd}>
                  End Chat
                </PrimaryButton>
              </div>
            </>
          )}
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
