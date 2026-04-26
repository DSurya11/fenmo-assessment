"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authRequest,
  getSessionEmail,
  setSessionEmail,
} from "@/lib/api";
import { Spinner } from "@/components/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getSessionEmail()) {
      router.push("/dashboard");
    }
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await authRequest(email.trim(), password, mode);
      setSessionEmail(email.trim());
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8">
      <div
        className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-10"
        style={{ maxWidth: 400, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {/* App title */}
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
          <h1 className="text-2xl font-bold text-[#0F172A]">ExpenseTracker</h1>
        </div>
        <p className="mb-8 text-center text-sm text-[#64748B]">
          Track your spending
        </p>

        {/* Mode heading */}
        <h2 className="mb-5 text-lg font-semibold text-[#0F172A]">
          {mode === "login" ? "Log in" : "Create account"}
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#334155]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#334155]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 text-sm text-[#0F172A] outline-none"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-[#DC2626]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-6 text-sm font-medium text-[#FFFFFF] transition-colors hover:bg-[#4338CA] disabled:opacity-60"
          >
            {loading && <Spinner />}
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="mt-5 w-full text-center text-sm font-medium text-[#4F46E5] hover:underline"
        >
          {mode === "login"
            ? "Don\u2019t have an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
