import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ViewOnceViewer, type ViewerState } from "@/components/chat/ViewOnceViewer";
import type { ViewOnceMedia } from "@/components/chat/ViewOnceMessage";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/lib/app-state";

export function MessageList() {
  const { chat, markViewed } = useAppState();
  const [viewer, setViewer] = useState<ViewerState>({ status: "closed" });
  const openedPath = useRef<string | null>(null);
  const openedObjectUrl = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (openedObjectUrl.current) URL.revokeObjectURL(openedObjectUrl.current);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length, chat.strangerTyping]);

  const open = async (m: ViewOnceMedia) => {
    setViewer({ status: "loading" });
    // Backend records the single authorized open; returns nothing if already opened.
    const { data: path, error } = await supabase.rpc("open_view_once", { p_message: m.id });
    if (error) {
      setViewer({ status: "unavailable", reason: "Network error. Check your connection and try again." });
      return;
    }
    markViewed(m.id);
    if (!path) {
      setViewer({
        status: "unavailable",
        reason:
          m.type === "voice"
            ? "This voice message has already been listened to and is no longer available."
            : "This image has already been viewed and is no longer available.",
      });
      return;
    }
    // Short-lived signed URL; the storage policy only signs for the recipient's
    // single open window (60s for images, 5 minutes for voice playback).
    const { data, error: signErr } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path as string, m.type === "voice" ? 300 : 60);
    if (signErr || !data) {
      setViewer({
        status: "unavailable",
        reason:
          m.type === "voice"
            ? "This voice message couldn't be loaded and is no longer available."
            : "This image couldn't be loaded and is no longer available.",
      });
      return;
    }
    openedPath.current = path as string;
    if (m.type === "image") {
      try {
        const response = await fetch(data.signedUrl, {
          cache: "no-store",
          referrerPolicy: "no-referrer",
        });
        if (!response.ok) throw new Error("Image download failed");
        const localUrl = URL.createObjectURL(await response.blob());
        openedObjectUrl.current = localUrl;
        setViewer({ status: "ready", url: localUrl, kind: "image" });
      } catch {
        setViewer({
          status: "unavailable",
          reason: "This image couldn't be loaded and is no longer available.",
        });
      }
      return;
    }
    setViewer({ status: "ready", url: data.signedUrl, kind: m.type });
  };

  const close = () => {
    setViewer({ status: "closed" });
    if (openedObjectUrl.current) {
      URL.revokeObjectURL(openedObjectUrl.current);
      openedObjectUrl.current = null;
    }
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
