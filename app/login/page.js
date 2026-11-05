"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail("demo@aurum.ai");
    setPassword("aurum123");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alexander Vance",
          email: "demo@aurum.ai",
          password: "aurum123",
          currency: "INR",
          monthlyIncome: 85000,
        }),
      });

      if (res.ok || res.status === 409) {
        // If already exists, log in
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "demo@aurum.ai", password: "aurum123" }),
        });
        if (loginRes.ok) {
          toast.success("Loaded demo account with 3 months of data!");
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }
      toast.error("Demo login error");
    } catch (e) {
      toast.error("Demo failed to load");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-purple-500/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-gold flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform">
              <span className="font-numbers text-2xl font-black text-black">A</span>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-4 tracking-wide">Sign in to AURUM</h2>
          <p className="text-sm text-slate-400 mt-1">Access your AI Wealth Intelligence terminal</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexander@aurum.ai"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glass-glow transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl glass-panel-interactive border border-gold/30 text-gold text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gold/10 transition"
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span>One-Click Instant Demo Experience</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            New to AURUM?{" "}
            <Link href="/signup" className="text-gold font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

