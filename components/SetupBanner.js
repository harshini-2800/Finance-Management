"use client";

import { useState, useEffect } from "react";
import { Sparkles, Database, ShieldAlert, X } from "lucide-react";

export default function SetupBanner() {
  const [status, setStatus] = useState({
    checked: false,
    hasMongo: true,
    hasGemini: true,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed for this session
    const isDismissed = sessionStorage.getItem("aurum_banner_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }

    // Ping /api/insights or check client presence
    // We can infer status gracefully
    fetch("/api/auth/me")
      .then(() => {
        // If loaded, mark checked
        setStatus({
          checked: true,
          hasMongo: true, // Will still operate smoothly in memory mode if unset
          hasGemini: false, // Informs user about optional AI enhancement
        });
      })
      .catch(() => {});
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative z-30 bg-gradient-to-r from-purple-900/30 via-surface-card to-cyan-900/20 border-b border-purple-500/20 backdrop-blur-md px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium border border-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            AURUM Active Mode
          </span>
          <span className="text-slate-300">
            App is operating in <strong className="text-white">Zero-Config Safe Mode</strong> with in-memory persistence & deterministic rule-based algorithms.
          </span>
          <span className="hidden md:inline text-slate-400">
            To unlock permanent cloud Atlas storage & live Gemini 1.5 Flash models, specify <code className="text-cyan-accent bg-black/40 px-1 py-0.5 rounded">MONGODB_URI</code> & <code className="text-purple-300 bg-black/40 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in <code className="text-slate-200">.env.local</code>.
          </span>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem("aurum_banner_dismissed", "true");
          }}
          className="text-slate-400 hover:text-white p-1 transition"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

