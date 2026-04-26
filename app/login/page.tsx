"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
  authRequest,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/Spinner";
import { CheckCircle2, XCircle, WalletCards } from "lucide-react";

const passwordRules = [
  {
    label: "At least 8 characters",
    validator: (value: string) => value.length >= 8,
  },
  {
    label: "At least one uppercase letter",
    validator: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "At least one lowercase letter",
    validator: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "At least one number",
    validator: (value: string) => /[0-9]/.test(value),
  },
  {
    label: "At least one special character",
    validator: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = passwordRules.map((rule) => ({
    label: rule.label,
    met: rule.validator(password),
  }));
  const passwordValid = passwordChecks.every((rule) => rule.met);
  const showPasswordRequirements = mode === "signup";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    if (mode === "signup" && !passwordValid) {
      setError("Password does not meet complexity requirements");
      return;
    }
    setLoading(true);
    try {
      await authRequest(email.trim(), password, mode);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 sm:p-10 transform transition-all duration-300 hover:shadow-xl">
        {/* Brand */}
        <div className="flex flex-col items-center justify-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 mb-2">
            <WalletCards className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ExpenseTracker
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Manage your spending beautifully
          </p>
        </div>

        {/* Mode heading */}
        <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>

        <form onSubmit={submit} className="flex flex-col space-y-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="h-11 rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="••••••••"
              required
              className="h-11 rounded-xl border border-slate-200 bg-white/50 px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {showPasswordRequirements && (
              <div className="mt-2 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Password must contain:
                </p>
                <div className="flex flex-col space-y-1.5">
                  {passwordChecks.map((rule) => (
                    <div key={rule.label} className="flex items-center space-x-2">
                      {rule.met ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={`text-xs ${rule.met ? "text-emerald-700" : "text-slate-500"}`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative h-11 w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
          >
            {loading && <Spinner />}
            <span>
              {loading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors focus:outline-none focus:underline"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
