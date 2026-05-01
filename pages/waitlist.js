import { useState } from "react";
import Layout from "../components/Layout";

export default function Waitlist() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      role: form.role.value.trim(),
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setStatus(data.message || "You’re on the list.");
      form.reset();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Join the waitlist">
      <p className="-mt-4 mb-10 max-w-xl text-slate-400">
        Leave your details and we’ll notify you when spots open or new features ship.
      </p>

      <div className="mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
              Target role
            </label>
            <input
              id="role"
              name="role"
              type="text"
              placeholder="e.g. Data scientist, PM, SDE"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p
              className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-500/30"
              role="alert"
            >
              {error}
            </p>
          )}

          {status && (
            <p
              className="rounded-lg bg-blue-500/10 px-4 py-3 text-sm text-blue-200 ring-1 ring-blue-500/30"
              role="status"
            >
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 py-3.5 text-base font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
