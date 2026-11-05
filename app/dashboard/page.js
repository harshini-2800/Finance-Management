"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

const COLORS = ["#7C5CFF", "#22D3EE", "#34D399", "#F5C26B", "#FB7185", "#A78BFA", "#F472B6"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    user: null,
    metrics: null,
    aiAdvice: [],
    transactions: [],
    trendData: [],
    categoryBreakdown: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, insightsRes, txRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/insights"),
        fetch("/api/transactions?limit=6"),
      ]);

      const userData = await userRes.json();
      const insightsData = await insightsRes.json();
      const txData = await txRes.json();

      const txs = txData.transactions || [];

      // Compute category breakdown from expenses
      const catMap = {};
      txs.forEach((t) => {
        if (t.type === "expense") {
          catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        }
      });
      const categoryBreakdown = Object.entries(catMap).map(([name, value]) => ({
        name,
        value,
      }));

      // 6-month historical trend mock + real
      const trendData = [
        { month: "Jun", income: 75000, expense: 51000 },
        { month: "Jul", income: 78000, expense: 48000 },
        { month: "Aug", income: 75000, expense: 53000 },
        { month: "Sep", income: 82000, expense: 46000 },
        { month: "Oct", income: 75000, expense: 44000 },
        {
          month: "Nov",
          income: insightsData.metrics?.totalIncome || 75000,
          expense: insightsData.metrics?.totalExpense || 42000,
        },
      ];

      setData({
        user: userData.user,
        metrics: insightsData.metrics,
        aiAdvice: insightsData.aiAdvice || [],
        transactions: txs,
        trendData,
        categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : [{ name: "General", value: 100 }],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = data.metrics || {
    healthScore: 84,
    tier: "Elite",
    tierColor: "#F5C26B",
    summary: "Strong capital velocity with pristine savings ratios.",
    savingsRate: 35,
    totalIncome: 83500,
    totalExpense: 39500,
    netSavings: 44000,
    forecast: {
      dailyBurnRate: 1316,
      forecastedExpense: 40800,
      projectedSurplus: 42700,
      daysRemaining: 18,
    },
    subscriptions: [],
  };

  const currencySymbol = data.user?.currency === "USD" ? "$" : data.user?.currency === "EUR" ? "€" : "₹";

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">
              AURUM 2.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time capital flows, health scoring & automated forecasting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel-interactive border border-purple-500/30 text-white flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-accent" />
            <span>Smart Quick Add</span>
          </Link>
          <Link
            href="/coach"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2 shadow-glass-glow hover:scale-105 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Consult Copilot</span>
          </Link>
        </div>
      </div>

      {/* Grid: 3 Metric Cards + Financial Health Ring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Net Savings & Inflow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-5 rounded-3xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Monthly Inflow</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-accent">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numbers text-3xl font-bold text-white mt-2">
            {currencySymbol}{metrics.totalIncome.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
            <span className="text-emerald-accent font-semibold">+6.2%</span>
            <span>vs previous cycle</span>
          </div>
        </motion.div>

        {/* Monthly Expense */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-panel p-5 rounded-3xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Outflow</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numbers text-3xl font-bold text-white mt-2">
            {currencySymbol}{metrics.totalExpense.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
            <span className="text-emerald-accent font-semibold">Under control</span>
            <span>({metrics.savingsRate}% saved)</span>
          </div>
        </motion.div>

        {/* Month-End Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel p-5 rounded-3xl border border-white/10 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Projected Month-End Reserve</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-accent">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numbers text-3xl font-bold text-cyan-accent mt-2">
            {currencySymbol}{metrics.forecast.projectedSurplus.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
            <span>Burn: </span>
            <span className="font-numbers text-slate-200">
              {currencySymbol}{metrics.forecast.dailyBurnRate}/day
            </span>
            <span>({metrics.forecast.daysRemaining}d left)</span>
          </div>
        </motion.div>

        {/* Financial Health Score Ring */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-panel p-5 rounded-3xl border border-gold/30 shadow-gold-glow relative flex items-center justify-between bg-gradient-to-br from-gold/5 via-transparent to-purple-600/10"
        >
          <div>
            <div className="flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Health Score</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-numbers text-3xl font-extrabold text-white">
                {metrics.healthScore}
              </span>
              <span className="text-xs text-slate-400 font-numbers">/100</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-accent mt-1">
              Tier: {metrics.tier}
            </p>
          </div>

          {/* SVG Animated Circular Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-gold transition-all duration-1000 ease-out"
                strokeDasharray={`${metrics.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-numbers text-xs font-bold text-white">
              {metrics.healthScore}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Row: 6-Month Cashflow Area + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 6-Month Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                6-Month Capital Flow Matrix
              </h2>
              <p className="text-xs text-slate-400">Inflow velocity vs expenditure burn</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-cyan-accent">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-accent" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0F1A",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#7C5CFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#22D3EE"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Allocation Donut */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Category Outflow</h2>
            <p className="text-xs text-slate-400">Current cycle distribution</p>
          </div>

          <div className="h-48 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D0F1A",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {data.categoryBreakdown.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-numbers text-white font-semibold">
                  {currencySymbol}{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Insights Action Cards & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight Cards */}
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 via-transparent to-surface-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h2 className="text-base font-bold text-white tracking-wide">
                AURUM Copilot Briefing
              </h2>
            </div>
            <Link
              href="/insights"
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-medium transition"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {((data.aiAdvice && data.aiAdvice.length > 0)
              ? data.aiAdvice
              : [
                  "High savings velocity detected (35%). Deploy excess liquid surplus to your active Japan Expedition vault.",
                  "2 recurring subscriptions detected. Audit quarterly to maintain peak capital efficiency.",
                  "Daily burn rate is steady at ₹1,316/day. On track for positive month-end accumulation.",
                ]
            ).map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass-panel border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Live Transaction Ledger
              </h2>
              <p className="text-xs text-slate-400">Latest activity across connected accounts</p>
            </div>
            <Link
              href="/transactions"
              className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!data.transactions || data.transactions.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded yet.</p>
            ) : (
              data.transactions.map((tx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx._id}
                    className="p-3.5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between hover:border-white/15 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-accent border border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{tx.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                          {tx.source === "ai" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-accent border border-cyan-500/30">
                              AI Added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`font-numbers text-sm font-bold ${
                        isIncome ? "text-emerald-accent" : "text-slate-100"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {currencySymbol}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
