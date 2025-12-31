"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
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
              Create an account
            </h1>
            <p className="text-[15px] text-[#6e6e73]">
              Get access to HVAC acquisition intelligence
            </p>
          </div>

          <div className="glass-premium p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[13px] font-medium text-[#1d1d1f] mb-2"
                >
                  Name <span className="text-[#86868b]">(optional)</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] outline-none text-[15px] transition-all"
                  placeholder="Your name"
                  autoFocus
                />
              </div>

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
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] font-medium text-[#1d1d1f] mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] outline-none text-[15px] transition-all"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-black/5 text-center">
              <p className="text-[14px] text-[#6e6e73]">
                Already have an account?{" "}
                <Link
                  href={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
                  className="text-[#14b8a6] hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
