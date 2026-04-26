"use client";

import { type Expense, formatCurrency } from "@/lib/api";

export function ExpenseList({
  expenses,
  loading,
}: {
  expenses: Expense[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid h-12 grid-cols-4 items-center gap-4 border-b border-[#E2E8F0] px-4 last:border-b-0"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="h-3 w-16 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="ml-auto h-3 w-14 animate-pulse rounded bg-[#E2E8F0]" />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div
        className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-6 py-16 text-center text-sm text-[#64748B]"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        No expenses yet. Add your first one.
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-[#E2E8F0] text-left">
          <tr>
            <th className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Date
            </th>
            <th className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Category
            </th>
            <th className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Description
            </th>
            <th className="h-12 px-4 text-right text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr
              key={e.id}
              className="h-12 border-b border-[#E2E8F0] text-[#0F172A] last:border-b-0"
            >
              <td className="px-4 text-sm">{e.date}</td>
              <td className="px-4">
                <span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#4338CA]">
                  {e.category}
                </span>
              </td>
              <td className="px-4 text-sm">{e.description}</td>
              <td className="px-4 text-right font-bold text-[#0F172A]">
                {formatCurrency(Number(e.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
