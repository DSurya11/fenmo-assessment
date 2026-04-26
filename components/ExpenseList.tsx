"use client";

import { type Expense, formatCurrency } from "@/lib/api";

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  overflowX: "auto",
};

const thStyle: React.CSSProperties = {
  height: 48,
  padding: "0 16px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#94A3B8",
  textAlign: "left",
  borderBottom: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
};

const tdStyle: React.CSSProperties = {
  padding: "0 16px",
  fontSize: 14,
  color: "#0F172A",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 9999,
  backgroundColor: "#EEF2FF",
  color: "#4338CA",
  fontSize: 12,
  fontWeight: 500,
  padding: "2px 10px",
};

export function ExpenseList({
  expenses,
  loading,
}: {
  expenses: Expense[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={cardStyle}>
        <p
          style={{
            margin: 0,
            padding: "16px",
            fontSize: 14,
            color: "#64748B",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          Loading expenses...
        </p>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr 1fr",
              alignItems: "center",
              height: 48,
              padding: "0 16px",
              gap: 16,
              borderBottom: i < 3 ? "1px solid #E2E8F0" : "none",
            }}
          >
            <div style={{ height: 12, width: 80, borderRadius: 4, backgroundColor: "#E2E8F0" }} />
            <div style={{ height: 12, width: 64, borderRadius: 4, backgroundColor: "#E2E8F0" }} />
            <div style={{ height: 12, width: 128, borderRadius: 4, backgroundColor: "#E2E8F0" }} />
            <div style={{ height: 12, width: 56, borderRadius: 4, backgroundColor: "#E2E8F0", marginLeft: "auto" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div
        style={{
          ...cardStyle,
          padding: "64px 24px",
          textAlign: "center",
          fontSize: 14,
          color: "#64748B",
        }}
      >
        No expenses yet. Add your first one.
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, idx) => (
            <tr
              key={e.id}
              style={{
                height: 48,
                borderBottom: idx < expenses.length - 1 ? "1px solid #E2E8F0" : "none",
              }}
            >
              <td style={tdStyle}>{e.date}</td>
              <td style={tdStyle}>
                <span style={badgeStyle}>{e.category}</span>
              </td>
              <td style={tdStyle}>{e.description}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                {formatCurrency(Number(e.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
