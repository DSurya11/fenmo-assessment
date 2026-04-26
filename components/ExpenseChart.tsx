'use client'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

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

  const colors = [
    '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B',
    '#EF4444', '#8B5CF6', '#EC4899'
  ]

  if (labels.length === 0) return null

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 0,
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 16,
          font: { size: 13 }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed
            const total = data.reduce((a, b) => a + b, 0)
            const pct = ((val / total) * 100).toFixed(1)
            return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`
          }
        }
      }
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm mb-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">
        Spending Breakdown
      </h2>
      <div className="max-w-sm mx-auto">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  )
}
