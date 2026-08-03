"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    // Session cookie is set — figure out where this user belongs.
    const res = await fetch("/api/me");
    const { role } = await res.json();
    router.push(role === "admin" ? "/admin" : "/portal");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-sm font-semibold text-white">
            A
          </div>
          <h1 className="text-xl font-semibold text-ink">Aperture Weddings</h1>
          <p className="mt-1 text-sm text-ink/50">Sign in to your studio or client portal</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@studio.com"
            className="focus-ring mb-4 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          />

          <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="focus-ring mb-2 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          />

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring mt-3 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          Admin accounts and client accounts are provisioned by the studio —
          contact your planner if you need access.
        </p>
      </div>
    </div>
  );
}
