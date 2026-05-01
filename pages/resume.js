import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { analyzeResumeText, keywordGaps } from "../lib/resume-analyze";
import { normalizeResumeText } from "../lib/resume-normalize";

export default function ResumeHubPage() {
  const fileInputRef = useRef(null);

  const [resumeDraft, setResumeDraft] = useState("");
  const [jdDraft, setJdDraft] = useState("");
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [localKw, setLocalKw] = useState(null);

  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState(null);
  const [uploadName, setUploadName] = useState(null);
  const [uploadTruncated, setUploadTruncated] = useState(false);

  const [hasOpenAi, setHasOpenAi] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [optErr, setOptErr] = useState(null);
  const [optResult, setOptResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/resume");
        const data = await r.json().catch(() => ({}));
        if (!cancelled) setHasOpenAi(Boolean(data?.hasOpenAi));
      } catch {
        if (!cancelled) setHasOpenAi(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!resumeDraft.trim()) {
      setLocalAnalysis(null);
      return;
    }
    setLocalAnalysis(analyzeResumeText(resumeDraft));
  }, [resumeDraft]);

  useEffect(() => {
    if (!resumeDraft.trim() || !jdDraft.trim()) {
      setLocalKw(null);
      return;
    }
    setLocalKw(keywordGaps(jdDraft, resumeDraft));
  }, [resumeDraft, jdDraft]);

  async function handleResumeFile(ev) {
    const input = ev.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const name = file.name || "resume";
    const lower = name.toLowerCase();
    setUploadErr(null);
    setUploadBusy(true);
    setUploadName(null);
    setUploadTruncated(false);
    setOptResult(null);

    try {
      if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".markdown")) {
        const text = await new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result || ""));
          fr.onerror = () => reject(new Error("read"));
          fr.readAsText(file, "UTF-8");
        });
        const t = normalizeResumeText(text);
        if (t.length < 40) {
          setUploadErr("That file looks empty or too short.");
          return;
        }
        setResumeDraft(t.length > 14_000 ? t.slice(0, 14_000) : t);
        setUploadName(name);
        setUploadTruncated(t.length > 14_000);
        return;
      }

      if (lower.endsWith(".pdf") || lower.endsWith(".docx")) {
        const fd = new FormData();
        fd.append("file", file, name);
        const r = await fetch("/api/resume/extract", { method: "POST", body: fd });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setUploadErr(data.error || "Could not read that file.");
          return;
        }
        setResumeDraft(String(data.text || ""));
        setUploadName(name);
        setUploadTruncated(Boolean(data.truncated));
        return;
      }

      setUploadErr("Use PDF, DOCX, or TXT. (Old .doc is not supported — save as DOCX.)");
    } catch {
      setUploadErr("Could not read the file.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function runOptimiser() {
    setOptErr(null);
    setOptResult(null);
    setOptLoading(true);
    try {
      const r = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeDraft, jdText: jdDraft }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setOptErr(data.error || "Optimiser failed.");
        return;
      }
      setOptResult(data);
    } catch {
      setOptErr("Network error.");
    } finally {
      setOptLoading(false);
    }
  }

  return (
    <Layout title="Resume hub">
      <p className="-mt-4 mb-8 max-w-2xl text-slate-400">
        Everything here is <strong className="text-slate-200">free</strong>: upload a resume (PDF, DOCX, or TXT),
        optional job description, then run the optimiser for fixes, line-level corrections, and stronger bullets. With
        AI enabled on the server, feedback uses GPT for corrections and rewrites; otherwise you still get a solid
        rules-based pass. No signup.
      </p>

      <div className="space-y-16">
        <section className="max-w-3xl">
          <h2 className="text-xl font-semibold text-white">Your resume</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload a file or paste below. Text is used for the quick scan, keyword overlap, and optimiser (nothing is
            stored on our servers after the request).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.markdown"
              className="sr-only"
              onChange={handleResumeFile}
            />
            <button
              type="button"
              disabled={uploadBusy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-500/50 hover:bg-slate-800 disabled:opacity-50"
            >
              {uploadBusy ? "Reading file…" : "Upload resume"}
            </button>
            {uploadName ? (
              <span className="text-sm text-slate-400">
                Loaded <span className="text-slate-200">{uploadName}</span>
                {uploadTruncated ? (
                  <span className="text-amber-300/90"> · trimmed to 14k characters</span>
                ) : null}
              </span>
            ) : null}
          </div>
          {uploadErr ? (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/30">
              {uploadErr}
            </p>
          ) : null}
          <textarea
            value={resumeDraft}
            onChange={(e) => {
              setResumeDraft(e.target.value);
              setUploadName(null);
              setUploadTruncated(false);
            }}
            rows={10}
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Paste resume text, or upload PDF / DOCX / TXT…"
          />
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">ATS-style scan</h3>
          <p className="mt-1 text-xs text-slate-600">Heuristic only — not a vendor ATS score.</p>
          {localAnalysis && (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-sm text-slate-300">
                Score <span className="font-bold text-blue-300">{localAnalysis.score}</span> / 100 ·{" "}
                {localAnalysis.wordCount} words
              </p>
              {localAnalysis.issues.length === 0 ? (
                <p className="text-sm text-emerald-300/90">No major red flags from this quick pass.</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                  {localAnalysis.issues.map((i) => (
                    <li key={i.id}>{i.message}</li>
                  ))}
                </ul>
              )}
              <ul className="space-y-1 border-t border-slate-800 pt-3 text-sm text-slate-400">
                {localAnalysis.suggestions.map((s, idx) => (
                  <li key={idx}>→ {s}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="max-w-3xl">
          <h2 className="text-xl font-semibold text-white">JD keyword overlap</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tokens from the job description vs your resume (honest overlap only).
          </p>
          <textarea
            value={jdDraft}
            onChange={(e) => setJdDraft(e.target.value)}
            rows={6}
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Paste job description…"
          />
          {localKw && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">In resume</p>
                <p className="mt-2 text-sm text-slate-300">{localKw.hits.length ? localKw.hits.join(", ") : "—"}</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Gaps to consider</p>
                <p className="mt-2 text-sm text-slate-300">{localKw.gaps.length ? localKw.gaps.join(", ") : "—"}</p>
              </div>
            </div>
          )}
        </section>

        <section className="max-w-3xl border-t border-slate-800 pt-12">
          <h2 className="text-xl font-semibold text-white">Full resume optimiser</h2>
          <p className="mt-1 text-sm text-slate-500">
            Uses the same resume and JD fields above.{" "}
            {hasOpenAi ? (
              <span className="text-emerald-300/90">This deployment can run an OpenAI pass plus rules.</span>
            ) : (
              <span>Runs rules + merged analysis on the server (host can add OPENAI_API_KEY for GPT).</span>
            )}
          </p>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={runOptimiser}
              disabled={optLoading || resumeDraft.trim().length < 80}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {optLoading ? "Running…" : "Run optimiser"}
            </button>
            {optErr && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200 ring-1 ring-red-500/30">
                {optErr}
              </p>
            )}
            {optResult && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-blue-200">{optResult.mode}</span>
                  <span className="text-2xl font-bold text-white">{optResult.score}</span>
                  <span className="text-slate-500">/ 100</span>
                </div>
                {optResult.summary && <p className="text-sm text-slate-300">{optResult.summary}</p>}
                {Array.isArray(optResult.fixes) && optResult.fixes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority fixes</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-400">
                      {optResult.fixes.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(optResult.corrections) && optResult.corrections.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Line-level corrections</p>
                    <ul className="mt-3 space-y-4">
                      {optResult.corrections.map((c, i) => (
                        <li key={i} className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-sm">
                          <p className="text-slate-500">
                            <span className="text-slate-600">Before:</span> {c.before || "—"}
                          </p>
                          <p className="mt-2 text-emerald-200/90">
                            <span className="text-emerald-500/80">After:</span> {c.after || "—"}
                          </p>
                          {c.why ? <p className="mt-2 text-xs text-slate-500">{c.why}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(optResult.rewrittenBullets) && optResult.rewrittenBullets.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stronger bullets</p>
                    <ul className="mt-3 space-y-3">
                      {optResult.rewrittenBullets.map((b, i) => (
                        <li key={i} className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-sm">
                          <p className="text-slate-500 line-through">{b.original || "—"}</p>
                          <p className="mt-2 text-slate-200">{b.suggested || "—"}</p>
                          {b.reason ? <p className="mt-2 text-xs text-slate-500">{b.reason}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-slate-600">
          Want mentorship and auto-apply later?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Create an account
          </Link>{" "}
          or{" "}
          <Link href="/pay" className="text-blue-400 hover:text-blue-300">
            early access
          </Link>
          .
        </p>
      </div>
    </Layout>
  );
}
