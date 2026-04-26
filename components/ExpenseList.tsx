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
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60 bg-slate-50/50">
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Loading expenses...
          </p>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 sm:grid-cols-12 gap-4 items-center px-6 py-4 ${
              i < 3 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className="h-3 w-16 sm:w-20 rounded-md bg-slate-200 animate-pulse col-span-1 sm:col-span-2" />
            <div className="h-5 w-16 sm:w-24 rounded-full bg-slate-200 animate-pulse col-span-1 sm:col-span-3" />
            <div className="h-3 w-24 sm:w-32 rounded-md bg-slate-200 animate-pulse col-span-1 sm:col-span-4" />
            <div className="h-3 w-12 sm:w-16 rounded-md bg-slate-200 animate-pulse col-span-1 sm:col-span-3 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No expenses yet</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Get started by adding your first expense above. Your spending history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Description</th>
              <th className="px-6 py-4 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {expenses.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-indigo-50/40 transition-colors group"
              >
                <td className="px-6 py-4 text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                  {e.date}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                    {e.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 group-hover:text-slate-900 transition-colors">
                  {e.description}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatCurrency(Number(e.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
