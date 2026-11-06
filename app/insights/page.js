"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  Repeat,
  Sliders,
  DollarSign,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [aiAdvice, setAiAdvice] = useState([]);

  // Spending Time Machine Simulator State
  const [sliderReductions, setSliderReductions] = useState({
    Dining: 25,
    Shopping: 20,
    Subscriptions: 30,
    Groceries: 10,
    Transport: 15,
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setAiAdvice(data.aiAdvice || []);
      }
    } catch (err) {
      toast.error("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (reductions = sliderReductions) => {
    try {
      setSimulating(true);
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adjustments: reductions,
          currentSavings: metrics?.netSavings || 25000,
          expectedAnnualReturn: 10, // 10% annual equity index benchmark
        }),
      });
      const data = await res.json();
      if (data.timeline) {
        setSimulationResult(data);
      }
    } catch (err) {
      toast.error("Simulation update failed");
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    if (metrics) {
      runSimulation(sliderReductions);
    }
  }, [metrics]);

  const handleSliderChange = (cat, val) => {
    const updated = { ...sliderReductions, [cat]: Number(val) };
    setSliderReductions(updated);
    runSimulation(updated);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Intelligence & Diagnostics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Gemini 1.5 Flash
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Money personality profiling, recurring subscription radar, anomaly detection & spending time machine
          </p>
        </div>
      </div>

      {/* Row 1: Money Personality & Recurring Subscription Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Money Personality Card */}
        <div className="glass-panel p-6 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/5 via-transparent to-purple-600/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4" />
              <span>Financial Personality Archetype</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {metrics?.personality?.type || "The Balanced Strategist"}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {metrics?.personality?.desc ||
                "Your behavioral spending pattern exhibits calculated capital accumulation paired with controlled luxury lifestyle allocations."}
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5">
              <span className="text-slate-400 block text-[11px]">Savings Rate</span>
              <span className="font-numbers text-lg font-bold text-emerald-accent">
                {metrics?.savingsRate || 35}%
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5">
              <span className="text-slate-400 block text-[11px]">Monthly Surplus</span>
              <span className="font-numbers text-lg font-bold text-gold">
                ₹{metrics?.netSavings?.toLocaleString() || "44,000"}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Radar */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-cyan-accent" />
                <h3 className="text-base font-bold text-white">Subscription Radar</h3>
              </div>
              <span className="text-xs font-semibold text-cyan-accent bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                ₹{metrics?.monthlySubscriptionBurn?.toLocaleString() || 0}/mo
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {!metrics?.subscriptions || metrics.subscriptions.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No active subscriptions detected in current history.
                </p>
              ) : (
                metrics.subscriptions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white truncate max-w-[150px]">{sub.title}</p>
                      <span className="text-[10px] text-slate-400">{sub.frequency} renewal</span>
                    </div>
                    <span className="font-numbers font-bold text-slate-200">
                      ₹{sub.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 border-t border-white/10 pt-3">
            Subscriptions consume{" "}
            <strong className="text-white">
              {metrics?.totalIncome
                ? Math.round(((metrics.monthlySubscriptionBurn || 0) / metrics.totalIncome) * 100)
                : 2}
              %
            </strong>{" "}
            of your monthly income.
          </p>
        </div>

        {/* Anomaly Alerts */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/15 via-transparent to-surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 mb-4">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-base font-bold text-white">Outlier Anomaly Flags</h3>
            </div>

            <div className="space-y-3">
              {!metrics?.anomalies || metrics.anomalies.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-accent text-center">
                  <ShieldCheck className="w-6 h-6 mx-auto mb-1 text-emerald-accent" />
                  Zero abnormal spending spikes detected this cycle. Baseline remains pristine.
                </div>
              ) : (
                metrics.anomalies.map((anom, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-rose-300">
                      <span>{anom.category} Spike</span>
                      <span className="font-numbers">₹{anom.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{anom.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 border-t border-white/10 pt-3">
            Anomalies trigger automatically when expenses deviate &gt;180% from category baselines.
          </p>
        </div>
      </div>

      {/* Section 2: Spending Time Machine Simulator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Spending Time Machine Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Slide category spending cuts to project 12-month compounding growth in equity index reserves
            </p>
          </div>

          {simulationResult && (
            <div className="flex items-center gap-4">
              <div className="glass-panel px-4 py-2 rounded-2xl border border-emerald-500/30 text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  Extra 12M Wealth Gained
                </span>
                <span className="font-numbers text-xl font-bold text-emerald-accent">
                  +₹{simulationResult.totalExtraSavedAfter1Year?.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Sliders Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Category Reduction Triggers
            </h4>

            {Object.entries(sliderReductions).map(([cat, val]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat}</span>
                  <span className="font-numbers font-semibold text-gold">-{val}% cut</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={val}
                  onChange={(e) => handleSliderChange(cat, e.target.value)}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Monthly Freed Capital:</span>
                <strong className="text-emerald-accent font-numbers">
                  +₹{simulationResult?.monthlyFreedCapital?.toLocaleString()}/mo
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Monthly Savings:</span>
                <strong className="text-white font-numbers">
                  ₹{simulationResult?.newMonthlySavings?.toLocaleString()}/mo
                </strong>
              </div>
            </div>
          </div>

          {/* 12-Month Projected Growth Chart */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="font-semibold text-slate-300">
                12-Month Compounding Trajectory (10% APR)
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  Baseline
                </span>
                <span className="flex items-center gap-1.5 text-emerald-accent">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-accent" />
                  Optimized
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={simulationResult?.timeline || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0D0F1A",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "14px",
                      fontSize: "12px",
                    }}
                    formatter={(val) => `₹${val.toLocaleString()}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="optimized"
                    stroke="#34D399"
                    strokeWidth={2.5}
                    fill="url(#optGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

