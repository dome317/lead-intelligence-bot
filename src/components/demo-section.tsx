"use client";

import { useState } from "react";
import { MessageCircle, Video } from "lucide-react";
import ChatWidget from "./chat-widget";
import AnamAvatar from "./anam-avatar";

export default function DemoSection() {
  const [mode, setMode] = useState<"chat" | "avatar">("avatar");

  return (
    <div>
      {/* Mode Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-muted-light rounded-lg p-1 border border-border">
          <button
            onClick={() => setMode("avatar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              mode === "avatar"
                ? "bg-foreground text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            Video Avatar
          </button>
          <button
            onClick={() => setMode("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              mode === "chat"
                ? "bg-foreground text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Text Chat
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-muted text-sm mb-8 max-w-md mx-auto">
        {mode === "avatar"
          ? "Talk directly with Alex \u2014 real-time video with voice."
          : "Ask about features, pricing, team size, or the onboarding process."}
      </p>

      {mode === "avatar" ? <AnamAvatar /> : <ChatWidget />}
    </div>
  );
}
