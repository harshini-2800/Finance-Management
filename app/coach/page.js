"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const QUICK_PROMPTS = [
  "What is my monthly cashflow breakdown?",
  "How can I cut ₹10,000 from my monthly burn?",
  "Can I afford a ₹1,50,000 vacation next May?",
  "Review my recurring subscriptions for waste",
];

export default function CoachPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChatHistory = async () => {
    try {
      const res = await fetch("/api/coach");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      _id: "temp_" + Date.now(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate reply");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          _id: "ai_" + Date.now(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      toast.error("Copilot connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AURUM AI Wealth Advisor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">
              Live Real-Data Context
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded in your real cash flows, active vaults, and category budgets
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[72vh] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m._id}
                className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? "bg-gradient-to-tr from-purple-500 to-indigo-500 text-white"
                      : "bg-gradient-to-tr from-purple-900 to-slate-900 border border-gold/40 text-gold shadow-gold-glow"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tr-none shadow-glass-glow"
                      : "glass-panel border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-900 to-slate-900 border border-gold/40 text-gold flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-panel border border-white/10 rounded-2xl rounded-tl-none px-5 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-gold animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-300">Synthesizing live ledger context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold pl-2 shrink-0">
            Suggested:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl glass-panel-interactive border border-white/10 text-[11px] text-slate-300 hover:text-white shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#090A12] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AURUM about your spending velocity, budget adherence, or investment timeline..."
              className="flex-1 bg-[#121422] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glass-glow disabled:opacity-40 hover:scale-105 active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

