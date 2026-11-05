"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_CATEGORIES = [
  "Housing",
  "Groceries",
  "Dining",
  "Subscriptions",
  "Transport",
  "Shopping",
  "Utilities",
  "Miscellaneous",
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // Add / Edit Budget State
  const [newCategory, setNewCategory] = useState("Dining");
  const [newLimit, setNewLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/budgets?month=${month}`);
      const data = await res.json();
      if (data.budgets) {
        setBudgets(data.budgets);
      }
    } catch (err) {
      toast.error("Failed to load budget progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!newLimit || Number(newLimit) <= 0) {
      toast.error("Please enter a valid limit");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          limit: Number(newLimit),
          month,
        }),
      });

      if (res.ok) {
        toast.success(`Budget threshold set for ${newCategory}`);
        setNewLimit("");
        fetchBudgets();
      }
    } catch (err) {
      toast.error("Failed to set budget");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Budget rule removed");
        setBudgets(budgets.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Budget Limits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enforce spending discipline with dynamic threshold warnings and progress bars
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
          />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-panel p-5 rounded-3xl border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Total Budget Cap</p>
          <p className="font-numbers text-3xl font-bold text-white mt-1">
            ₹{totalAllocated.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">Active across {budgets.length} categories</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Total Spent</p>
          <p className="font-numbers text-3xl font-bold text-purple-300 mt-1">
            ₹{totalSpent.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-accent mt-2 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>
              {totalAllocated > 0
                ? `${Math.round((totalSpent / totalAllocated) * 100)}% of ceiling utilized`
                : "No ceiling"}
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10">
          <p className="text-xs text-slate-400 font-medium">Remaining Safe Buffer</p>
          <p className="font-numbers text-3xl font-bold text-emerald-accent mt-1">
            ₹{Math.max(0, totalAllocated - totalSpent).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">Available for remaining cycle days</p>
        </div>
      </div>

      {/* Grid: Create Budget Form + Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Set / Adjust Limit Form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gold" />
            <h3 className="text-base font-bold text-white">Set Category Ceiling</h3>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Monthly Spending Limit (₹)
              </label>
              <input
                type="number"
                required
                min={100}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="e.g. 8000"
                className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-glass-glow hover:scale-105 active:scale-95 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Lock Category Limit"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            AURUM monitors daily burn rates in background tasks. When consumption crosses 80%, you will receive automated alert notifications.
          </p>
        </div>

        {/* List of Active Category Progress Bars */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-500 border border-white/5">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Calculating real-time category burn...
            </div>
          ) : budgets.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-500 border border-white/5">
              No budget limits defined for this cycle yet. Set your first category ceiling on the left!
            </div>
          ) : (
            budgets.map((b) => {
              const isOver = b.status === "exceeded";
              const isWarning = b.status === "warning";

              let barColor = "bg-emerald-accent";
              let badgeColor = "bg-emerald-500/10 text-emerald-accent border-emerald-500/20";
              let badgeText = "On Track";

              if (isOver) {
                barColor = "bg-rose-500";
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                badgeText = "Over Limit!";
              } else if (isWarning) {
                barColor = "bg-amber-400";
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                badgeText = "80%+ Warning";
              }

              return (
                <div
                  key={b._id}
                  className={`glass-panel p-5 rounded-3xl border transition ${
                    isOver
                      ? "border-rose-500/30 bg-rose-950/10"
                      : isWarning
                      ? "border-amber-500/30 bg-amber-950/10"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{b.category}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                      >
                        {badgeText}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-numbers text-xs text-slate-400">
                        <strong className="text-white text-sm">₹{b.spent.toLocaleString()}</strong> /
                        ₹{b.limit.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                    <span>{b.percentage}% consumed</span>
                    <span>
                      {isOver
                        ? `Over by ₹${(b.spent - b.limit).toLocaleString()}`
                        : `₹${b.remaining.toLocaleString()} left`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}

