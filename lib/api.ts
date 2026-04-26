export type Expense = {
  id: string | number;
  amount: number;
  category: string;
  description: string;
  date: string;
};

export type AuthAction = "login" | "signup";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

const SESSION_KEY = "expense_tracker_session_email";

async function parseError(res: Response, fallback: string): Promise<Error> {
  const json = await res.json().catch(() => null);
  if (json && typeof json.error === "string") {
    return new Error(json.error);
  }

  const text = await res.text().catch(() => "");
  return new Error(text || fallback);
}

export async function authRequest(
  email: string,
  password: string,
  action: AuthAction
) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, action }),
  });
  if (!res.ok) {
    throw await parseError(res, "Authentication failed");
  }
  return res.json().catch(() => ({}));
}

export async function logoutRequest() {
  const res = await fetch("/api/auth", { method: "DELETE" });
  if (!res.ok) throw await parseError(res, "Logout failed");
}

export async function fetchExpenses(params: {
  category?: string;
  sortDesc?: boolean;
}): Promise<Expense[]> {
  const url = new URL("/api/expenses", window.location.origin);
  if (params.category && params.category !== "All") {
    url.searchParams.set("category", params.category);
  }
  url.searchParams.set("sort_date_desc", String(params.sortDesc ?? true));
  const res = await fetch(url.pathname + url.search);
  if (!res.ok) throw await parseError(res, "Failed to load expenses");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? data.expenses ?? []);
}

export async function createExpense(payload: {
  amount: number;
  category: string;
  description: string;
  date: string;
  idempotency_key: string;
}) {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw await parseError(res, "Failed to add expense");
  }
  return res.json().catch(() => ({}));
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function setSessionEmail(email: string) {
  window.localStorage.setItem(SESSION_KEY, email);
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n);
}
