"use client";

import { CATEGORIES } from "@/lib/api";

export function ExpenseFilters({
  category,
  onCategoryChange,
  sortDesc,
  onSortChange,
}: {
  category: string;
  onCategoryChange: (c: string) => void;
  sortDesc: boolean;
  onSortChange: (desc: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1 sm:w-60">
        <label className="text-xs font-medium text-foreground">Filter by category</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent-brand)]"
        >
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">Sort</label>
        <div className="inline-flex overflow-hidden rounded-md border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => onSortChange(true)}
            className={`px-3 py-2 text-sm ${
              sortDesc
                ? "bg-[var(--accent-brand)] text-[var(--accent-brand-foreground)]"
                : "bg-white text-foreground"
            }`}
          >
            Newest first
          </button>
          <button
            type="button"
            onClick={() => onSortChange(false)}
            className={`px-3 py-2 text-sm border-l border-[var(--border-subtle)] ${
              !sortDesc
                ? "bg-[var(--accent-brand)] text-[var(--accent-brand-foreground)]"
                : "bg-white text-foreground"
            }`}
          >
            Oldest first
          </button>
        </div>
      </div>
    </div>
  );
}
