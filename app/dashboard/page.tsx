"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  fetchExpenses,
  formatCurrency,
  getSessionEmail,
  logoutRequest,
  type Expense,
} from "@/lib/api";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";

export default function DashboardPage() {
  const router = useRouter();
  const email = getSessionEmail();
  const [category, setCategory] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!email) {
      clearSession();
      router.push("/login");
    }
  }, [email, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchExpenses({ category, sortDesc });
      setExpenses(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
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

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutRequest().catch(() => {});
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ─── HEADER ─── */}
      <header className="h-16 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <div className="mx-auto grid h-full w-full max-w-[1200px] grid-cols-[1fr_auto] items-center gap-3 px-6 md:grid-cols-3">
          <div className="flex items-center gap-2 text-[#0F172A] md:justify-self-start">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4F46E5]" />
            <span className="text-lg font-bold">ExpenseTracker</span>
          </div>
          <span className="hidden text-sm text-[#64748B] md:block md:justify-self-center">
            {email}
          </span>

          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="h-10 justify-self-end rounded-lg border border-[#4F46E5] bg-[#FFFFFF] px-4 text-sm font-medium text-[#4F46E5] transition-colors hover:bg-[#4F46E5] hover:text-[#FFFFFF] disabled:opacity-60"
          >
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-5 md:px-6 md:py-6">
        {/* Mobile email */}
        <p className="text-sm text-[#64748B] sm:hidden">{email}</p>

        {/* Add Expense */}
        <ExpenseForm onAdded={load} />

        {/* Filter & Sort */}
        <section
          className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex w-full flex-col gap-2 md:max-w-xs">
              <label className="text-sm font-medium text-[#334155]">
                Filter by Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
              >
                <option value="All">All</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#334155]">Sort</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSortDesc(true)}
                  className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                    sortDesc
                      ? "border-[#4F46E5] bg-[#4F46E5] text-[#FFFFFF]"
                      : "border-[#4F46E5] bg-[#FFFFFF] text-[#4F46E5]"
                  }`}
                >
                  Newest first
                </button>
                <button
                  type="button"
                  onClick={() => setSortDesc(false)}
                  className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                    !sortDesc
                      ? "border-[#4F46E5] bg-[#4F46E5] text-[#FFFFFF]"
                      : "border-[#4F46E5] bg-[#FFFFFF] text-[#4F46E5]"
                  }`}
                >
                  Oldest first
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Total */}
        <section
          className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-6 py-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <span className="text-sm text-[#64748B]">Total</span>
          <span className="text-3xl font-bold text-[#0F172A]">
            {formatCurrency(total)}
          </span>
        </section>

        {/* Error */}
        {loadError && (
          <p className="text-sm text-[#DC2626]">{loadError}</p>
        )}

        {/* Expenses Table */}
        <ExpenseList expenses={expenses} loading={loading} />
      </main>
    </div>
  );
}
