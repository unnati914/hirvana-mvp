import { analyzeResumeText, keywordGaps } from "../../../lib/resume-analyze";

const MAX_RESUME = 14_000;
const MAX_JD = 10_000;

function rulesOptimize(resumeText, jdText) {
  const analysis = analyzeResumeText(resumeText);
  const kw = jdText?.trim() ? keywordGaps(jdText, resumeText) : { hits: [], gaps: [] };
  const fixes = [
    ...analysis.issues.map((i) => i.message),
    ...(kw.gaps.length
      ? [`JD keyword gaps to weave in (where honest): ${kw.gaps.slice(0, 8).join(", ")}.`]
      : []),
  ];
  return {
    mode: "rules",
    score: analysis.score,
    summary:
      jdText?.trim()
        ? "Rules-based pass: tighten metrics, swap weak phrases, and align honest keyword overlap with the JD."
        : "Rules-based pass: add metrics, strong verbs, and scannable bullets. Paste a JD for keyword alignment.",
    fixes: fixes.slice(0, 10),
    corrections: [],
    rewrittenBullets: [],
    analysis,
    keywordGaps: kw,
  };
}

async function openAiOptimize(resumeText, jdText) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const userPayload = {
    resume: resumeText.slice(0, MAX_RESUME),
    jobDescription: jdText?.trim() ? jdText.slice(0, MAX_JD) : null,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert resume editor. The user uploaded resume text (and optional job description).

Output JSON only with this shape:
{
  "score": number 0-100,
  "summary": string (2-4 sentences on overall impression),
  "fixes": string[] (max 10) — short imperative improvements (e.g. "Add a metric to the Acme bullet"),
  "corrections": object[] (max 12) — each { "before": "exact short excerpt from resume", "after": "corrected or tightened wording", "why": "one short reason" } for grammar, clarity, tense, weak verbs, redundancy. Never change employers, dates, degrees, or numbers the user stated; if unsure, skip that item,
  "rewrittenBullets": object[] (max 8) — each { "original": "full bullet or line from resume", "suggested": "stronger honest rewrite", "reason": "why" }. Pick the highest-impact lines only; empty array if none
}

Rules: do not invent jobs, titles, tools, or metrics. Only tighten and clarify what is already plausible from the text.`,
        },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 400)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI empty response");
  const parsed = JSON.parse(content);
  const corrections = Array.isArray(parsed.corrections)
    ? parsed.corrections
        .filter((x) => x && typeof x === "object")
        .slice(0, 12)
        .map((x) => ({
          before: String(x.before || x.original || "").slice(0, 600),
          after: String(x.after || x.suggested || "").slice(0, 600),
          why: String(x.why || x.reason || "").slice(0, 300),
        }))
        .filter((c) => c.before.length > 0 && c.after.length > 0)
    : [];

  return {
    mode: "openai",
    score: Number(parsed.score) || 0,
    summary: String(parsed.summary || ""),
    fixes: Array.isArray(parsed.fixes) ? parsed.fixes.map(String).slice(0, 10) : [],
    corrections,
    rewrittenBullets: Array.isArray(parsed.rewrittenBullets)
      ? parsed.rewrittenBullets
          .filter((x) => x && typeof x === "object")
          .slice(0, 8)
          .map((x) => ({
            original: String(x.original || "").slice(0, 600),
            suggested: String(x.suggested || "").slice(0, 600),
            reason: String(x.reason || "").slice(0, 280),
          }))
      : [],
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const resumeText = String(body.resumeText || "").trim();
  const jdText = body.jdText != null ? String(body.jdText) : "";

  if (resumeText.length < 80) {
    return res.status(400).json({ error: "Paste a fuller resume (at least ~80 characters) for useful feedback." });
  }
  if (resumeText.length > MAX_RESUME) {
    return res.status(400).json({ error: `Resume too long (max ${MAX_RESUME} characters).` });
  }

  try {
    if (process.env.OPENAI_API_KEY?.trim()) {
      try {
        const ai = await openAiOptimize(resumeText, jdText);
        const base = rulesOptimize(resumeText, jdText);
        return res.status(200).json({
          ...ai,
          analysis: base.analysis,
          keywordGaps: base.keywordGaps,
        });
      } catch (e) {
        console.error("OpenAI optimize failed, falling back to rules", e?.message || e);
      }
    }
    return res.status(200).json(rulesOptimize(resumeText, jdText));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not run optimiser." });
  }
}
