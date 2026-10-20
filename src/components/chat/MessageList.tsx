import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ViewOnceViewer, type ViewerState } from "@/components/chat/ViewOnceViewer";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/lib/app-state";
import type { ImageMessage } from "@/types";

export function MessageList() {
  const { chat, markImageViewed } = useAppState();
  const [viewer, setViewer] = useState<ViewerState>({ status: "closed" });
  const openedPath = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.strangerTyping]);

  const open = async (m: ImageMessage) => {
    setViewer({ status: "loading" });
    // Backend records the single authorized open; returns nothing if already opened.
    const { data: path, error } = await supabase.rpc("open_view_once", { p_message: m.id });
    if (error) {
      setViewer({ status: "unavailable", reason: "Network error. Check your connection and try again." });
      return;
    }
    markImageViewed(m.id);
    if (!path) {
      setViewer({ status: "unavailable", reason: "This image has already been viewed and is no longer available." });
      return;
    }
    const { data, error: signErr } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path as string, 60);
    if (signErr || !data) {
      setViewer({ status: "unavailable", reason: "This image couldn't be loaded and is no longer available." });
      return;
    }
    openedPath.current = path as string;
    setViewer({ status: "ready", url: data.signedUrl });
  };

  const close = () => {
    setViewer({ status: "closed" });
    const path = openedPath.current;
    openedPath.current = null;
    if (path) void supabase.storage.from("chat-media").remove([path]);
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-center text-xs text-muted-foreground">Today</p>
        {chat.messages.map((message) => (
          <MessageBubble key={message.id} message={message} onOpenViewOnce={open} />
        ))}
        {chat.strangerTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>
      <ViewOnceViewer state={viewer} onClose={close} />
    </div>
  );
}
