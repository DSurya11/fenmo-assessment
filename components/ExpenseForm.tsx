"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, createExpense } from "@/lib/api";
import { Spinner } from "./Spinner";

const todayStr = () => new Date().toISOString().slice(0, 10);

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

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#64748B",
};

export function ExpenseForm({ onAdded }: { onAdded: () => void }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timeout);
  }, [success]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!category || !description.trim() || !date) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await createExpense({
        amount: parseFloat(amt.toFixed(2)),
        category,
        description: description.trim(),
        date,
      });
      setSuccess("Expense added");
      setAmount("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setDate(todayStr());
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
        Add Expense
      </h2>

      <form onSubmit={submit}>
        {/* Desktop: row — Mobile: stacked via CSS */}
        <div className="expense-form-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 40,
                borderRadius: 8,
                border: "none",
                backgroundColor: "#4F46E5",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "0 24px",
                whiteSpace: "nowrap",
              }}
            >
              {loading && <Spinner />}
              {loading ? "Adding…" : "Add Expense"}
            </button>
          </div>
        </div>
      </form>

      <div style={{ marginTop: 12, minHeight: 20, fontSize: 14 }}>
        {error && <span style={{ color: "#DC2626" }}>{error}</span>}
        {success && <span style={{ color: "#16A34A" }}>{success}</span>}
      </div>
    </section>
  );
}
