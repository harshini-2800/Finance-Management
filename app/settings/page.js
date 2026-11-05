"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  User,
  DollarSign,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currency: "INR",
    monthlyIncome: 75000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoActionLoading, setDemoActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            currency: data.user.currency || "INR",
            monthlyIncome: data.user.monthlyIncome || 75000,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile preferences saved");
      } else {
        toast.error("Failed to update preferences");
      }
    } catch (err) {
      toast.error("Error updating settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDemoAction = async (action) => {
    const confirmText =
      action === "clear"
        ? "This will wipe all transactions, budgets, and vaults. Proceed?"
        : "This will reset all records back to clean 3-month demo data. Proceed?";
    if (!confirm(confirmText)) return;

    setDemoActionLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(
          action === "clear" ? "Demo data cleared successfully" : "Demo data refreshed"
        );
      } else {
        toast.error("Demo reset failed");
      }
    } catch (err) {
      toast.error("Reset error");
    } finally {
      setDemoActionLoading(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Terminal Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure currency parameters, baseline monthly income & data lifecycle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile & Financial Settings */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <span>Profile & Capital Baseline</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full bg-[#0D0F1A]/40 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Primary Ledger Currency
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Monthly Baseline Inflow
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={0}
                    value={profile.monthlyIncome}
                    onChange={(e) => setProfile({ ...profile, monthlyIncome: e.target.value })}
                    className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/60 font-numbers"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-glass-glow hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Data Management */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Demo Data Sandbox</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              AURUM automatically seeds realistic transactions, recurring charges, and vaults so you can test features without manual onboarding.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleDemoAction("reseed")}
                disabled={demoActionLoading}
                className="w-full py-3 px-4 rounded-2xl glass-panel-interactive border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Fresh 3M Demo Data</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoAction("clear")}
                disabled={demoActionLoading}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe All Records (Empty State)</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 text-[11px] text-slate-500">
            Current Environment: <span className="text-slate-300">Next.js 14 App Router</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

