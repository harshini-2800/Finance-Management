"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Brain,
  Zap,
  ChevronRight,
  PieChart,
  Lock,
} from "lucide-react";
import SetupBanner from "@/components/SetupBanner";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-purple-500/30">
      <SetupBanner />

      {/* Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-gold flex items-center justify-center shadow-gold-glow">
            <span className="font-numbers text-xl font-black text-black">A</span>
          </div>
          <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-slate-100 to-gold bg-clip-text text-transparent">
            AURUM
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-glass-glow hover:shadow-purple-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Copilot
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 flex-1 flex flex-col items-center text-center relative z-10">
        {/* Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-purple-500/30 text-xs font-medium text-gold mb-8 shadow-glass-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold animate-spin [animation-duration:8s]" />
          <span>Next-Generation AI Wealth Intelligence</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6"
        >
          Your personal wealth, elevated by{" "}
          <span className="bg-gradient-to-r from-purple-400 via-cyan-accent to-gold bg-clip-text text-transparent">
            autonomous intelligence
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-normal"
        >
          Experience midnight-luxury finance. Real-time health scores, natural language Talk-to-Add, subscription radar, and predictive spending simulations powered by Gemini AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-semibold text-base shadow-glass-glow hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Start Free Experience</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-base transition-all border border-white/10"
          >
            <span>Explore Demo Data</span>
          </Link>
        </motion.div>

        {/* Glassmorphism Interactive Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-3xl glass-panel p-4 sm:p-6 border border-white/10 shadow-2xl relative group overflow-hidden"
        >
          {/* Subtle Glow Behind Preview */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-gold/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000 -z-10" />

          {/* Mock Dashboard Topbar */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 text-left">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">aurum-app.finance/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gold font-medium px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Sparkles className="w-3 h-3" />
              Copilot Active
            </div>
          </div>

          {/* Mock Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 font-medium">Net Liquidity</p>
              <p className="font-numbers text-3xl font-bold text-white mt-1">₹3,42,850</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-accent mt-2 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.4% this quarter</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 font-medium">Financial Health Ring</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-numbers text-3xl font-bold text-gold">88 / 100</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 font-medium">
                  Elite Tier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Capital accumulation velocity 94th percentile</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 font-medium">AI Vaults (Savings)</p>
              <p className="font-numbers text-3xl font-bold text-cyan-accent mt-1">₹4,65,000</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-accent h-1.5 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-24 text-left">
          <div className="glass-panel-interactive p-6 rounded-3xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Gemini 1.5 Wealth Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Synthesizes real transaction patterns into high-impact personalized tactics, spending time-travel simulations, and anomaly flags.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-accent mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Talk-to-Add Voice & Text</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Simply state &quot;Spent 450 at Starbucks on iced latte&quot;. AURUM parses category, amount, timestamp, and recurring status automatically.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Deterministic Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hardened math calculations run locally for absolute predictability. Bank-grade JWT cookies with zero data brokerage.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 AURUM Technologies Inc. Crafted for modern financial autonomy.</p>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-slate-300 transition">Sign In</Link>
          <Link href="/signup" className="hover:text-slate-300 transition">Register</Link>
          <span className="text-slate-600">Built with Next.js 14 & Gemini Flash</span>
        </div>
      </footer>
    </div>
  );
}

