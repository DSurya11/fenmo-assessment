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

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const inputStyle: React.CSSProperties = {
  height: 40,
  borderRadius: 8,
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  padding: "0 12px",
  fontSize: 14,
  color: "#0F172A",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 40,
        borderRadius: 9999,
        border: "1px solid #4F46E5",
        backgroundColor: active ? "#4F46E5" : hovered ? "#EEF2FF" : "#FFFFFF",
        color: active ? "#FFFFFF" : "#4F46E5",
        fontSize: 14,
        fontWeight: 500,
        padding: "0 16px",
        cursor: "pointer",
        transition: "background-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const email = getSessionEmail();
  const [category, setCategory] = useState("All");
  const [sortDesc, setSortDesc] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

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
      clearSession();
      router.push("/login");
    }
  };

  if (!email) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* ─── HEADER ─── */}
      <header
        style={{
          height: 64,
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          {/* Left: brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#4F46E5",
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
              ExpenseTracker
            </span>
          </div>

          {/* Center: email (desktop) */}
          <span
            className="header-email"
            style={{ fontSize: 14, color: "#64748B" }}
          >
            {email}
          </span>

          {/* Right: logout */}
          <button
            onClick={onLogout}
            disabled={loggingOut}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              height: 40,
              borderRadius: 8,
              border: "1px solid #4F46E5",
              backgroundColor: logoutHovered && !loggingOut ? "#4F46E5" : "#FFFFFF",
              color: logoutHovered && !loggingOut ? "#FFFFFF" : "#4F46E5",
              fontSize: 14,
              fontWeight: 500,
              padding: "0 16px",
              cursor: loggingOut ? "not-allowed" : "pointer",
              opacity: loggingOut ? 0.6 : 1,
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main
        className="main-container"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Mobile email */}
        <p className="mobile-email" style={{ margin: 0, fontSize: 14, color: "#64748B" }}>
          {email}
        </p>

        {/* Add Expense */}
        <ExpenseForm onAdded={load} />

        {/* Filter & Sort */}
        <section style={cardStyle}>
          <div className="filter-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>
                Filter by Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>Sort</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <SortButton active={sortDesc} onClick={() => setSortDesc(true)}>
                  Newest first
                </SortButton>
                <SortButton active={!sortDesc} onClick={() => setSortDesc(false)}>
                  Oldest first
                </SortButton>
              </div>
            </div>
          </div>
        </section>

        {/* Total */}
        <section
          style={{
            ...cardStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
          }}
        >
          <span style={{ fontSize: 14, color: "#64748B" }}>Total</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#0F172A" }}>
            {formatCurrency(total)}
          </span>
        </section>

        {categorySummary.length > 0 && (
          <section style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
              Spending by Category
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "#334155" }}>
              {categorySummary
                .map(([expenseCategory, amount]) => `${expenseCategory} ${formatCurrency(amount)}`)
                .join(" | ")}
            </p>
          </section>
        )}

        {/* Error */}
        {loadError && (
          <p style={{ margin: 0, fontSize: 14, color: "#DC2626" }}>{loadError}</p>
        )}

        {/* Expenses Table */}
        <ExpenseList expenses={expenses} loading={loading} />
      </main>
    </div>
  );
}
