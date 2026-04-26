"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, createExpense } from "@/lib/api";
import { Spinner } from "./Spinner";
import { Plus } from "lucide-react";

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
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createExpense({
        amount: parseFloat(amt.toFixed(2)),
        category,
        description: description.trim(),
        date,
        idempotency_key: idempotencyKey,
      });
      setSuccess("Expense added successfully!");
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
    <section className="glass-card rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <Plus className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Add New Expense
        </h2>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Amount */}
          <div className="flex flex-col space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 pl-7 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col space-y-1.5 md:col-span-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1.5 md:col-span-3">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex flex-col justify-end h-full pt-6 md:pt-0">
            <button
              type="submit"
              disabled={loading}
              className="group relative h-11 w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-bold text-white shadow-sm shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {loading && <Spinner />}
              <span>{loading ? "Adding..." : "Add"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Messages */}
      {(error || success) && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium text-center">
              {success}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
