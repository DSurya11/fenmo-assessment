"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchExpenses,
  formatCurrency,
  logoutRequest,
  type Expense,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import ExpenseChart from "@/components/ExpenseChart";
import { LogOut, WalletCards, ArrowDownUp, Filter } from "lucide-react";

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-sm font-semibold transition-all duration-300 ${
        active
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
          : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setEmail(session.user.email ?? null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setEmail(session.user.email ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchExpenses({ category, sortDesc });
      setExpenses(data);
    } catch {
      setLoadError("Failed to load expenses. Please refresh.");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [category, sortDesc]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) load();
  }, [email, load]);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const categorySummary = useMemo(() => {
    const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
      const expenseCategory = expense.category || "Other";
      acc[expenseCategory] = (acc[expenseCategory] ?? 0) + Number(expense.amount || 0);
      return acc;
    }, {});

    return Object.entries(totals)
      .filter(([, amount]) => amount > 0)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [expenses]);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutRequest().catch(() => {});
    } finally {
      router.push("/login");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
              <WalletCards className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">
              ExpenseTracker
            </span>
          </div>

          {/* Center: email (desktop) */}
          <span className="hidden md:block text-sm font-medium text-slate-500 bg-slate-100/50 px-3 py-1 rounded-full border border-slate-200/50">
            {email}
          </span>

          {/* Right: logout */}
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="flex items-center space-x-2 h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{loggingOut ? "Logging out…" : "Logout"}</span>
          </button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col space-y-6">
        {/* Mobile email */}
        <p className="md:hidden text-sm font-medium text-slate-500 text-center mb-2">
          {email}
        </p>

        {/* Add Expense */}
        <ExpenseForm onAdded={load} />

        {/* Category Summary */}
        {categorySummary.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Spending by Category</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {categorySummary.map(([expenseCategory, amount]) => (
                <div key={expenseCategory} className="bg-white/60 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm">
                  <span className="font-medium text-slate-600">{expenseCategory}</span>
                  <span className="text-slate-300">|</span>
                  <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <ExpenseChart expenses={expenses} />

        {/* Filter & Sort & Total Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col space-y-2 flex-1 max-w-xs">
              <label className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span>Filter by Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center space-x-1.5">
                <ArrowDownUp className="w-4 h-4 text-indigo-500" />
                <span>Sort Order</span>
              </span>
              <div className="flex space-x-2">
                <SortButton active={sortDesc} onClick={() => setSortDesc(true)}>
                  Newest
                </SortButton>
                <SortButton active={!sortDesc} onClick={() => setSortDesc(false)}>
                  Oldest
                </SortButton>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
            <span className="text-sm font-medium text-slate-500 mb-1 relative z-10">Total Spent</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight relative z-10">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Error */}
        {loadError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center justify-center">
            {loadError}
          </div>
        )}

        {/* Expenses Table */}
        <div className="pt-2">
          <ExpenseList expenses={expenses} loading={loading} />
        </div>
      </main>
    </div>
  );
}
