import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  BrainCircuit,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const DEFAULT_PROMPTS = [
  "🔥 Best ChatGPT prompts for marketing",
  "💰 How do I sell a prompt on Paste Prompts?",
  "✨ Prompt engineering tips for Claude & Gemini",
  "👑 What are the benefits of Pro membership?",
];

type GeminiModel = "gemini-3.8-flash" | "gemini-3.1-flash-lite" | "gemini-4-argon";

const INITIAL_MESSAGE: Message = {
  id: "welcome-msg",
  role: "model",
  text: "Hi there! 👋 I'm your **Paste Prompts AI assistant**. Ask me anything about finding high-quality prompts, selling your own creations, Pro membership, or prompt engineering tips!",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export function HelpChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>("gemini-3.8-flash");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Send conversation history to the server endpoint
      const payloadMessages = newHistory
        .filter((m) => m.id !== "welcome-msg" || m.role === "user")
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Ensure at least one message is sent
      if (payloadMessages.length === 0) {
        payloadMessages.push({ role: "user", text });
      }

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const modelMessage: Message = {
        id: "msg-" + Date.now() + "-ai",
        role: "model",
        text: data.reply || "I didn't receive an answer. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while communicating with Gemini.";

      const failureMessage: Message = {
        id: "msg-" + Date.now() + "-err",
        role: "model",
        text: `⚠️ **Error:** ${errorMessage}\n\nPlease try again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, failureMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside aria-label="Paste Prompts AI Assistant" className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="group relative flex h-14 items-center gap-2.5 rounded-full bg-gradient-primary px-5 shadow-2xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open AI Assistant Chat"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
          <Sparkles className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-semibold text-primary-foreground">Ask AI</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <section
          aria-label="AI Chat Session"
          className="flex h-[560px] max-h-[85vh] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-primary/25 bg-card/95 shadow-2xl backdrop-blur-2xl sm:w-[420px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-foreground">Paste Prompts AI</h2>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-bold text-primary">
                    Gemini
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Marketplace & Prompt Engineering Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={clearChat}
                title="Restart conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Model Selector Bar */}
          <div className="flex items-center justify-between border-b border-border/30 bg-background/50 px-3 py-1.5 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground">Model:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSelectedModel("gemini-3.8-flash")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  selectedModel === "gemini-3.8-flash"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Gemini 3.8 Flash (General Tasks)"
              >
                <Sparkles className="h-3 w-3" />
                Flash
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("gemini-3.1-flash-lite")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  selectedModel === "gemini-3.1-flash-lite"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Gemini 3.1 Flash Lite (High Speed)"
              >
                <Zap className="h-3 w-3" />
                Fast
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel("gemini-4-argon")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                  selectedModel === "gemini-4-argon"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="Gemini 4 Argon (Advanced Reasoning)"
              >
                <BrainCircuit className="h-3 w-3" />
                Argon
              </button>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}
                >
                  <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                    {isUser ? (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{message.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 text-primary" />
                        <span>Paste Prompts AI</span>
                        <span>•</span>
                        <span>{message.timestamp}</span>
                      </>
                    )}
                  </div>

                  <div
                    className={cn(
                      "relative group max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm",
                      isUser
                        ? "bg-gradient-primary text-primary-foreground rounded-br-none"
                        : "border border-border/50 bg-muted/60 text-foreground rounded-bl-none",
                    )}
                  >
                    <div className="whitespace-pre-wrap select-text">{message.text}</div>

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(message.text, message.id)}
                        className="absolute -bottom-3 right-2 flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-foreground"
                        title="Copy message"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Prompts on initial conversation */}
            {messages.length === 1 && (
              <div className="mt-2 space-y-1.5 pt-2">
                <p className="text-[11px] font-medium text-muted-foreground">Suggested questions:</p>
                <div className="flex flex-col gap-1.5">
                  {DEFAULT_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-left text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Sparkles className="h-3 w-3 animate-spin" />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-border/40 bg-muted/30 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about prompts, selling, or Pro..."
                rows={1}
                disabled={loading}
                className="max-h-24 min-h-[38px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading}
                className="h-[38px] w-[38px] shrink-0 rounded-xl bg-gradient-primary shadow-md hover:scale-105 transition-transform"
                title="Send message"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </Button>
            </form>
            <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-muted-foreground/80">
              <span>Enter to send · Shift+Enter for new line</span>
              <span>Gemini Powered</span>
            </div>
          </div>
        </section>
      )}
    </aside>
  );
}

export default HelpChatWidget;
