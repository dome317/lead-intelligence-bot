"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient, AnamEvent, MessageRole } from "@anam-ai/js-sdk";
import type { AnamClient } from "@anam-ai/js-sdk";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  Send,
  Check,
  User,
  Mail,
} from "lucide-react";

interface AnamMessage {
  role: MessageRole;
  content: string;
}

export default function AnamAvatar() {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [messages, setMessages] = useState<AnamMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const clientRef = useRef<AnamClient | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Contact capture states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [leadExtracted, setLeadExtracted] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const cleanup = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.stopStreaming();
      } catch {
        // ignore cleanup errors
      }
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Detect when Alex asks for name or email
  useEffect(() => {
    if (messages.length === 0) return;

    const lastAssistantMsg = [...messages]
      .reverse()
      .find((m) => m.role === MessageRole.PERSONA);
    if (!lastAssistantMsg) return;

    const text = lastAssistantMsg.content.toLowerCase();

    if (
      !nameSubmitted &&
      !showNameInput &&
      (text.includes("your name") ||
        text.includes("who am i speaking") ||
        text.includes("call you") ||
        text.includes("field below"))
    ) {
      setShowNameInput(true);
    }

    if (
      nameSubmitted &&
      !emailSubmitted &&
      !showEmailInput &&
      (text.includes("e-mail") ||
        text.includes("email") ||
        text.includes("mail address"))
    ) {
      setShowEmailInput(true);
    }
  }, [messages, nameSubmitted, emailSubmitted, showNameInput, showEmailInput]);

  // Also show contact fields after enough messages as fallback
  useEffect(() => {
    if (messages.length >= 10 && !nameSubmitted && !showNameInput) {
      setShowNameInput(true);
    }
  }, [messages.length, nameSubmitted, showNameInput]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = async () => {
    setStatus("connecting");
    setMessages([]);
    setContactName("");
    setContactEmail("");
    setShowNameInput(false);
    setShowEmailInput(false);
    setNameSubmitted(false);
    setEmailSubmitted(false);
    setLeadExtracted(false);

    try {
      const res = await fetch("/api/anam-session", { method: "POST" });
      if (!res.ok) throw new Error("Failed to get session token");

      const { sessionToken } = await res.json();

      const client = createClient(sessionToken);
      clientRef.current = client;

      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        setStatus("connected");
      });

      client.addListener(
        AnamEvent.MESSAGE_HISTORY_UPDATED,
        (history: AnamMessage[]) => {
          setMessages([...history]);
        }
      );

      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        setStatus("idle");
      });

      await client.streamToVideoElement("anam-video");
    } catch (error) {
      console.error("Anam connection error:", error);
      setStatus("error");
    }
  };

  const endSession = () => {
    cleanup();
    setStatus("idle");
  };

  const toggleMute = () => {
    if (!clientRef.current) return;
    if (isMuted) {
      clientRef.current.unmuteInputAudio();
    } else {
      clientRef.current.muteInputAudio();
    }
    setIsMuted(!isMuted);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    setNameSubmitted(true);
    setShowNameInput(false);

    if (clientRef.current) {
      try {
        clientRef.current.sendUserMessage(
          `My name is ${contactName.trim()}.`
        );
      } catch {
        // Session might have ended
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) return;
    setEmailSubmitted(true);
    setShowEmailInput(false);

    if (clientRef.current) {
      try {
        clientRef.current.sendUserMessage(
          `My email address is ${contactEmail.trim()}.`
        );
      } catch {
        // Session might have ended
      }
    }

    extractLead();
  };

  const extractLead = async () => {
    if (leadExtracted || extracting) return;
    setExtracting(true);

    try {
      const transcriptMessages = messages.map((msg) => ({
        role: msg.role === MessageRole.USER ? "user" : "assistant",
        content: msg.content,
      }));

      transcriptMessages.push({
        role: "user",
        content: `My name is ${contactName.trim()}. My email is ${contactEmail.trim()}.`,
      });

      const res = await fetch("/api/extract-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: transcriptMessages }),
      });

      if (res.ok) {
        setLeadExtracted(true);
      }
    } catch (error) {
      console.error("Lead extraction error:", error);
    } finally {
      setExtracting(false);
    }
  };

  const showContactForm = showNameInput || showEmailInput;
  const contactComplete = nameSubmitted && emailSubmitted;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-foreground px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                Alex
                <span className="font-normal text-zinc-400 text-xs ml-2">
                  Video
                </span>
              </h3>
              <p className="text-zinc-400 text-xs">AI Sales Assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {status === "connected" && (
                <>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-zinc-400 text-xs">Live</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-dark-bg aspect-video">
          <video
            id="anam-video"
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${status !== "connected" ? "hidden" : ""}`}
          />

          {status === "idle" && !leadExtracted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Volume2 className="w-7 h-7 text-zinc-400" />
              </div>
              <div className="text-center px-6">
                <p className="text-white font-semibold text-lg mb-1">
                  Talk to Alex
                </p>
                <p className="text-zinc-500 text-sm">
                  AI video avatar with real-time voice
                </p>
              </div>
              <button
                onClick={startSession}
                className="bg-accent hover:bg-accent/80 text-white font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                Start conversation
              </button>
            </div>
          )}

          {status === "idle" && leadExtracted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg mb-1">
                  Conversation complete
                </p>
                <p className="text-zinc-500 text-sm">
                  A scheduling email will be sent shortly
                </p>
              </div>
            </div>
          )}

          {status === "connecting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">
                Connecting...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
              <p className="text-zinc-400 text-sm text-center">
                Connection failed.
              </p>
              <button
                onClick={startSession}
                className="bg-accent hover:bg-accent/80 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Controls */}
          {status === "connected" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={toggleMute}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/15 hover:bg-white/25 backdrop-blur-sm"
                }`}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={endSession}
                className="w-11 h-11 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer"
                title="End conversation"
              >
                <PhoneOff className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Contact Input Fields */}
        {showContactForm && status === "connected" && (
          <div className="border-t border-border bg-surface px-4 py-3">
            {showNameInput && !nameSubmitted && (
              <form onSubmit={handleNameSubmit} className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent">
                  <User className="w-4 h-4 text-muted shrink-0" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!contactName.trim()}
                  className="bg-foreground hover:bg-foreground/80 disabled:bg-zinc-300 text-white rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {showEmailInput && !emailSubmitted && (
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 border border-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent">
                  <Mail className="w-4 h-4 text-muted shrink-0" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your email address"
                    autoFocus
                    className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!contactEmail.trim()}
                  className="bg-foreground hover:bg-foreground/80 disabled:bg-zinc-300 text-white rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {nameSubmitted && !showEmailInput && !emailSubmitted && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Check className="w-4 h-4 text-green-500" />
                <span>
                  Name saved: <strong className="text-foreground">{contactName}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Customer-facing confirmation */}
        {contactComplete && leadExtracted && (
          <div className="border-t border-border bg-muted-light px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  All set, {contactName}!
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  You&apos;ll receive an email shortly with a time for your
                  free consultation.
                </p>
              </div>
            </div>
          </div>
        )}
        {contactComplete && extracting && (
          <div className="border-t border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
              <span>One moment...</span>
            </div>
          </div>
        )}

        {/* Transcript */}
        {messages.length > 0 && (
          <div
            ref={transcriptRef}
            className="max-h-[180px] overflow-y-auto px-4 py-3 space-y-2 bg-muted-light border-t border-border"
          >
            <p className="text-[10px] text-muted font-medium uppercase tracking-widest mb-1">
              Transcript
            </p>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm ${
                  msg.role === MessageRole.USER
                    ? "text-foreground"
                    : "text-muted"
                }`}
              >
                <span className="font-semibold">
                  {msg.role === MessageRole.USER ? "You" : "Alex"}:
                </span>{" "}
                {msg.content}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border px-4 py-3 bg-surface">
          <p className="text-xs text-muted text-center">
            {status === "connected"
              ? "Just speak \u2014 Alex responds in real-time"
              : "Start a conversation with the video avatar"}
          </p>
        </div>
      </div>
    </div>
  );
}
