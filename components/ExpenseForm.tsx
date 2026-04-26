"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, createExpense } from "@/lib/api";
import { Spinner } from "./Spinner";

const todayStr = () => new Date().toISOString().slice(0, 10);

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
      className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h2 className="mb-5 text-lg font-bold text-[#0F172A]">Add Expense</h2>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[140px_160px_minmax(200px,1fr)_160px_auto]"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for?"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
            required
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-6 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#4338CA] disabled:opacity-60 whitespace-nowrap"
          >
            {loading && <Spinner />}
            {loading ? "Adding…" : "Add Expense"}
          </button>
        </div>
      </form>

      <div className="mt-3 min-h-5 text-sm">
        {error && <span className="text-[#DC2626]">{error}</span>}
        {success && <span className="text-[#16A34A]">{success}</span>}
      </div>
    </section>
  );
}
