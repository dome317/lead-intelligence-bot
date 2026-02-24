"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadData {
  name: string | null;
  email: string | null;
  goal: string;
  obstacle: string;
  readiness: string;
  score: number;
  score_label: "HOT" | "WARM" | "COLD";
  conversation_summary: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Alex, your AI sales assistant. What brings you here today? Happy to help with any questions you might have.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [leadExtracted, setLeadExtracted] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [showLeadSuccess, setShowLeadSuccess] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length >= 8 && !leadExtracted && !isStreaming && !extracting) {
      handleExtractLead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was a technical error. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleExtractLead = async () => {
    if (leadExtracted || extracting) return;
    setExtracting(true);
    setLeadExtracted(true);

    try {
      const response = await fetch("/api/extract-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error("Lead extraction failed");

      const data = await response.json();
      setLeadData(data.lead);
      setShowLeadSuccess(true);

      setWorkflowStep(1);
      setTimeout(() => setWorkflowStep(2), 600);
      setTimeout(() => setWorkflowStep(3), 1200);
    } catch (error) {
      console.error("Lead extraction error:", error);
      setLeadExtracted(false);
    } finally {
      setExtracting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const scoreColor = (label: string) => {
    switch (label) {
      case "HOT":
        return "bg-red-50 text-red-700 border-red-200";
      case "WARM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "COLD":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

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
              <h3 className="text-white font-semibold text-sm">Alex</h3>
              <p className="text-zinc-400 text-xs">AI Sales Assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-zinc-400 text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="h-[420px] overflow-y-auto px-4 py-4 space-y-3 bg-muted-light"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-white rounded-br-sm"
                    : "bg-surface text-foreground border border-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full typing-dot" />
                </div>
                <span className="text-xs text-muted">Alex is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Customer-facing confirmation */}
        {showLeadSuccess && leadData && (
          <div className="mx-4 mb-3 p-4 rounded-lg bg-muted-light border border-border">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  All set{leadData.name ? `, ${leadData.name}` : ""}!
                </p>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  You&apos;ll receive an email shortly with a time for your
                  free consultation.
                </p>
                <div className="flex gap-1.5 mt-2.5">
                  {[
                    { label: "Conversation analyzed", step: 1 },
                    { label: "Scheduling call", step: 2 },
                    { label: "Email sent", step: 3 },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={`flex items-center gap-1 text-[10px] transition-all duration-300 ${
                        workflowStep >= item.step
                          ? "text-foreground"
                          : "text-zinc-300"
                      }`}
                    >
                      {workflowStep >= item.step && (
                        <Check className="w-2.5 h-2.5" />
                      )}
                      {item.label}
                      {item.step < 3 && (
                        <span className="text-zinc-300 ml-1">&middot;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extracting Indicator */}
        {extracting && !showLeadSuccess && (
          <div className="mx-4 mb-3 p-4 rounded-lg bg-muted-light border border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              <span className="text-foreground text-sm font-medium">
                Analyzing lead...
              </span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4 bg-surface">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:bg-muted-light"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="bg-foreground hover:bg-foreground/80 disabled:bg-zinc-300 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
