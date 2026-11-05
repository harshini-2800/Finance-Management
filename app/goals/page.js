"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  Trash2,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Goal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "0",
    deadline: "",
  });

  // Add Funds Modal
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState("");

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (err) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("New wealth vault initialized!");
        setIsModalOpen(false);
        setFormData({ title: "", targetAmount: "", savedAmount: "0", deadline: "" });
        fetchGoals();
      }
    } catch (err) {
      toast.error("Error creating goal");
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!fundAmount || Number(fundAmount) <= 0) return;

    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeGoal._id,
          addAmount: Number(fundAmount),
        }),
      });

      if (res.ok) {
        toast.success(`Deposited ₹${Number(fundAmount).toLocaleString()} into ${activeGoal.title}`);
        setFundModalOpen(false);
        setFundAmount("");
        fetchGoals();
      }
    } catch (err) {
      toast.error("Deposit failed");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to retire this vault?")) return;
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Vault closed");
        setGoals(goals.filter((g) => g._id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Vaults & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compound capital toward dedicated objectives with automated weekly velocity pacing
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2 shadow-glass-glow hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Vault</span>
        </button>
      </div>

      {/* Vault Grid */}
      {loading ? (
        <div className="glass-panel p-16 rounded-3xl text-center text-slate-500 border border-white/5">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your wealth vaults...
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center text-slate-500 border border-white/5">
          No active vaults initialized yet. Click &quot;New Vault&quot; above to forge your first financial milestone!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.percentage >= 100;
            return (
              <div
                key={goal._id}
                className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/30 transition duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-gold/20 border border-gold/30 flex items-center justify-center text-gold">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">{goal.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition"
                      title="Delete Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-3 mb-2">
                    <div>
                      <p className="text-xs text-slate-400">Vault Balance</p>
                      <p className="font-numbers text-2xl font-bold text-white">
                        ₹{goal.savedAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Target Ceiling</p>
                      <p className="font-numbers text-lg font-semibold text-slate-300">
                        ₹{goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden my-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-accent h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-numbers font-semibold text-gold">{goal.percentage}% Met</span>
                    <span>₹{goal.remainingAmount.toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* AI Weekly Pacing Recommendation */}
                <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-cyan-accent shrink-0" />
                    <span>
                      Pacing:{" "}
                      <strong className="text-cyan-accent font-numbers">
                        ₹{goal.weeklySuggestion.toLocaleString()}
                      </strong>
                      /week for {goal.diffWeeks} weeks
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveGoal(goal);
                      setFundModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Vault Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Create New Vault Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Switzerland Ski Expedition or Tesla Fund"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="200000"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Deposit (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.savedAmount}
                  onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-glass-glow"
                >
                  Create Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Deposit to {activeGoal.title}</h3>
              <button onClick={() => setFundModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-black text-xs font-bold shadow-gold-glow"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

