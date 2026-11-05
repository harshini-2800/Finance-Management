"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  Bot,
  Settings,
  LogOut,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/goals", label: "Vaults", icon: Target },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
  { href: "/coach", label: "AI Coach", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Desktop Floating Pill Navigation */}
      <aside className="hidden lg:flex fixed left-6 top-8 bottom-8 w-64 flex-col justify-between p-5 rounded-3xl glass-panel border border-white/10 z-40 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-6">
          {/* Logo Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-gold flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
              <span className="font-numbers text-xl font-black text-black">A</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-slate-100 to-gold bg-clip-text text-transparent">
                AURUM
              </span>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase font-medium">
                AI Wealth Copilot
              </p>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/30 to-purple-500/10 text-white border border-purple-500/40 shadow-glass-glow"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-gold" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Member"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "active"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 glass-panel rounded-2xl border border-white/10 shadow-2xl p-2 backdrop-blur-xl">
        <nav className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                  isActive ? "text-gold bg-white/5" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/coach"
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
              pathname === "/coach" ? "text-gold bg-white/5" : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] font-medium">Coach</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

