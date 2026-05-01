import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

const STORAGE_KEY = "hirvana-tracker-v1";

const STAGES = [
  "Applied",
  "Recruiter screen",
  "Interview",
  "Take-home",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `r-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TrackerPage() {
  const [hydrated, setHydrated] = useState(false);
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState(STAGES[0]);
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setApplications(Array.isArray(parsed) ? parsed : []);
    } catch {
      setApplications([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {
      /* ignore quota */
    }
  }, [applications, hydrated]);

  const sorted = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const da = new Date(a.appliedAt || 0).getTime();
        const db = new Date(b.appliedAt || 0).getTime();
        return db - da;
      }),
    [applications],
  );

  function addApplication(e) {
    e.preventDefault();
    const c = company.trim();
    const r = role.trim();
    if (!c || !r) return;
    setApplications((prev) => [
      {
        id: newId(),
        company: c,
        role: r,
        stage,
        appliedAt: appliedAt || new Date().toISOString().slice(0, 10),
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setCompany("");
    setRole("");
    setNotes("");
    setStage(STAGES[0]);
    setAppliedAt(new Date().toISOString().slice(0, 10));
  }

  function updateStage(id, nextStage) {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, stage: nextStage, updatedAt: new Date().toISOString() } : a,
      ),
    );
  }

  function updateNotes(id, text) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes: text, updatedAt: new Date().toISOString() } : a)),
    );
  }

  function removeApplication(id) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(applications, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hirvana-applications-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout title="Application tracker">
      <p className="-mt-4 mb-8 max-w-2xl text-slate-400">
        MVP pipeline: data stays in <strong className="text-slate-300">this browser only</strong>{" "}
        (localStorage). Export JSON occasionally if you switch devices.
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <form
          onSubmit={addApplication}
          className="h-fit space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
        >
          <h2 className="text-lg font-semibold text-white">Add application</h2>
          <div>
            <label htmlFor="co" className="mb-1 block text-sm font-medium text-slate-300">
              Company
            </label>
            <input
              id="co"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-300">
              Role
            </label>
            <input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Senior Data Scientist"
            />
          </div>
          <div>
            <label htmlFor="stage" className="mb-1 block text-sm font-medium text-slate-300">
              Stage
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="when" className="mb-1 block text-sm font-medium text-slate-300">
              Applied
            </label>
            <input
              id="when"
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-300">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="JD link, recruiter name, next steps…"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400"
          >
            Save to pipeline
          </button>
        </form>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              Pipeline <span className="text-slate-500">({sorted.length})</span>
            </h2>
            <button
              type="button"
              onClick={exportJson}
              disabled={!applications.length}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export JSON
            </button>
          </div>

          {!hydrated ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : sorted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-slate-400">
              No applications yet. Add your first on the left.
            </p>
          ) : (
            <ul className="space-y-4">
              {sorted.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-blue-500/25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{a.company}</p>
                      <p className="text-sm text-slate-400">{a.role}</p>
                      <p className="mt-1 text-xs text-slate-500">Applied {a.appliedAt || "—"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeApplication(a.id)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-300/90 ring-1 ring-red-500/25 transition hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Stage
                    </label>
                    <select
                      value={a.stage}
                      onChange={(e) => updateStage(a.id, e.target.value)}
                      className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                      Notes
                    </label>
                    <textarea
                      value={a.notes || ""}
                      onChange={(e) => updateNotes(a.id, e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
