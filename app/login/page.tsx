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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#4F46E5",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            ExpenseTracker
          </h1>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#64748B",
            margin: "0 0 32px 0",
          }}
        >
          Track your spending
        </p>

        {/* Mode heading */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0F172A",
            margin: "0 0 20px 0",
          }}
        >
          {mode === "login" ? "Log in" : "Create account"}
        </h2>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              style={{
                height: 40,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "0 12px",
                fontSize: 14,
                color: "#0F172A",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              required
              style={{
                height: 40,
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                padding: "0 12px",
                fontSize: 14,
                color: "#0F172A",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 14, color: "#DC2626" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 40,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#4F46E5",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
            }}
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
          style={{
            marginTop: 20,
            width: "100%",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 500,
            color: "#4F46E5",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {mode === "login"
            ? "Don\u2019t have an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
