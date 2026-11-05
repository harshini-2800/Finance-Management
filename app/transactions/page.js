"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  Mic,
  Sparkles,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Housing",
  "Groceries",
  "Dining",
  "Subscriptions",
  "Transport",
  "Shopping",
  "Utilities",
  "Salary",
  "Investments",
  "Freelance",
  "Miscellaneous",
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Talk-to-Add Smart Bar state
  const [smartInput, setSmartInput] = useState("");
  const [parsingSmart, setParsingSmart] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Manual Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "Dining",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedType !== "all") params.set("type", selectedType);
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, selectedType, selectedCategory]);

  // Smart NL Add Handler
  const handleSmartAdd = async (e) => {
    e.preventDefault();
    if (!smartInput.trim()) return;

    setParsingSmart(true);
    try {
      const res = await fetch("/api/transactions/smart-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: smartInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to parse");
        return;
      }

      toast.success(
        `Smart Added: ${data.transaction.description} (${data.transaction.category}) ₹${data.transaction.amount}`
      );
      setSmartInput("");
      fetchTransactions();
    } catch (err) {
      toast.error("Smart add processing error");
    } finally {
      setParsingSmart(false);
    }
  };

  // Voice speech synthesis toggle (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice input is not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast("Listening... speak your expense", { icon: "🎙️" });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSmartInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // CSV Export Handler
  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["ID", "Type", "Category", "Description", "Amount", "Date", "Source", "Recurring"];
    const rows = transactions.map((t) => [
      t._id,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      new Date(t.date).toISOString().slice(0, 10),
      t.source || "manual",
      t.isRecurring ? "Yes" : "No",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AURUM_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded");
  };

  // Save or Update Modal
  const handleSaveModal = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch("/api/transactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (res.ok) {
          toast.success("Transaction updated");
          setIsModalOpen(false);
          fetchTransactions();
        }
      } else {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success("Transaction recorded");
          setIsModalOpen(false);
          fetchTransactions();
        }
      }
    } catch (err) {
      toast.error("Error saving entry");
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Transaction removed");
        setTransactions(transactions.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      type: "expense",
      amount: "",
      category: "Dining",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingId(tx._id);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      date: new Date(tx.date).toISOString().slice(0, 10),
      isRecurring: tx.isRecurring || false,
    });
    setIsModalOpen(true);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, export, and record transactions with natural language parsing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel-interactive border border-white/10 text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2 shadow-glass-glow hover:scale-105 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Talk-to-Add Smart Bar */}
      <div className="mb-6 p-4 rounded-3xl glass-panel border border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-surface-card to-cyan-900/20 shadow-glass-glow">
        <form onSubmit={handleSmartAdd} className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gold/15 text-gold border border-gold/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            placeholder='Talk-to-Add: "Spent 450 on artisan coffee at Starbucks" or "Received 15000 freelance design"'
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          />

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-2xl transition ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            title="Speech to Text"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={parsingSmart || !smartInput.trim()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-2 shadow-glass-glow disabled:opacity-50 hover:scale-105 transition"
          >
            {parsingSmart ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>AI Parse</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or category..."
            className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
          >
            <option value="all">All Types</option>
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Synchronizing ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions match your query criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-accent"
                                : "bg-purple-500/10 text-purple-300"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">
                              {tx.description}
                            </span>
                            {tx.isRecurring && (
                              <span className="text-[10px] text-gold uppercase tracking-wider font-medium">
                                • Recurring Monthly
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6">
                        {tx.source === "ai" ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-accent border border-cyan-500/30 text-[10px] font-semibold">
                            AI Smart Add
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px]">
                            Manual
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span
                          className={`font-numbers text-sm font-bold ${
                            isIncome ? "text-emerald-accent" : "text-slate-100"
                          }`}
                        >
                          {isIncome ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingId ? "Edit Transaction" : "Record New Transaction"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                    formData.type === "expense"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                    formData.type === "income"
                      ? "bg-emerald-500/20 text-emerald-accent border border-emerald-500/40"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Income Inflow
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="2500"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Weekly grocery stock or AWS bill"
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#0D0F1A]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="rounded bg-[#0D0F1A] border-white/20 text-purple-600 focus:ring-0"
                />
                <label htmlFor="modal-recurring" className="text-xs text-slate-300">
                  Recurring monthly commitment
                </label>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

