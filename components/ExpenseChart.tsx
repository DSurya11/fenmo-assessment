"use client";

interface Props {
  expenses: { category: string; amount: number | string }[]
}

export default function ExpenseChart({ expenses }: Props) {
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  const labels = Object.keys(categoryTotals)
  const data = Object.values(categoryTotals)
  const totalAmount = data.reduce((a, b) => a + b, 0)

  const colors = [
    'bg-indigo-600', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-red-500', 'bg-violet-500', 'bg-pink-500'
  ]

  if (labels.length === 0 || totalAmount === 0) return null

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        Spending Breakdown
      </h2>
      
      {/* Stacked Bar */}
      <div className="w-full h-3 flex rounded-full overflow-hidden bg-slate-100">
        {labels.map((label, idx) => {
          const val = categoryTotals[label];
          const pct = (val / totalAmount) * 100;
          return (
            <div 
              key={label}
              className={`h-full ${colors[idx % colors.length]} hover:opacity-80 transition-opacity cursor-help`}
              style={{ width: `${pct}%` }}
              title={`${label}: ₹${val.toLocaleString('en-IN')} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5">
        {labels.map((label, idx) => {
          const val = categoryTotals[label];
          const pct = (val / totalAmount) * 100;
          return (
            <div key={label} className="flex items-center space-x-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
              <span className="text-slate-600 font-medium">
                {label} <span className="text-slate-400">({pct.toFixed(1)}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
