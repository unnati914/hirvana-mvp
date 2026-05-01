import { useCallback, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { INTERVIEW_QUESTIONS } from "../lib/interview-questions";

function pickIndex(exclude) {
  if (INTERVIEW_QUESTIONS.length <= 1) return 0;
  let i = Math.floor(Math.random() * INTERVIEW_QUESTIONS.length);
  let guard = 0;
  while (i === exclude && guard++ < 12) {
    i = Math.floor(Math.random() * INTERVIEW_QUESTIONS.length);
  }
  return i;
}

export default function PrepPage() {
  const [index, setIndex] = useState(() => pickIndex(-1));

  const question = INTERVIEW_QUESTIONS[index] ?? INTERVIEW_QUESTIONS[0];
  const total = INTERVIEW_QUESTIONS.length;

  const next = useCallback(() => {
    setIndex((prev) => pickIndex(prev));
  }, []);

  const position = useMemo(() => `${index + 1} / ${total}`, [index, total]);

  return (
    <Layout title="Interview prep">
      <p className="-mt-4 mb-8 max-w-2xl text-slate-400">
        Quick practice prompts — no recording, no AI. Use the space below to outline a 60–90s answer
        (Situation → Task → Action → Result).
      </p>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>Prompt {position}</span>
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-blue-500/15 px-3 py-1.5 font-semibold text-blue-300 ring-1 ring-blue-500/35 transition hover:bg-blue-500/25"
          >
            Next question
          </button>
        </div>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
          <p className="text-lg leading-relaxed text-white sm:text-xl">{question}</p>
        </article>

        <div>
          <label htmlFor="outline" className="mb-2 block text-sm font-medium text-slate-300">
            Your outline (not saved)
          </label>
          <textarea
            id="outline"
            rows={8}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Bullet notes, metrics, names, what you’d add if you had 30 more seconds…"
          />
        </div>

        <p className="text-center text-xs text-slate-600">
          Want AI feedback and rubrics later?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            Create an account
          </a>
          .
        </p>
      </div>
    </Layout>
  );
}
