"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="pt-16 pb-20 md:pt-20 md:pb-28 mesh-gradient">
        <div className="max-w-[420px] mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-[2rem] font-bold text-[#1d1d1f] tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-[15px] text-[#6e6e73]">
              Sign in to access premium intelligence
            </p>
          </div>

          <div className="glass-premium p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-medium text-[#1d1d1f] mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] outline-none text-[15px] transition-all"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#1d1d1f] mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] outline-none text-[15px] transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-[14px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-black/5 text-center">
              <p className="text-[14px] text-[#6e6e73]">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                  className="text-[#14b8a6] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
