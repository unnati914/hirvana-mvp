/** Heuristic resume review — no LLM. Safe for client + server. */

const WEAK_PHRASES = [
  "responsible for",
  "duties included",
  "helped with",
  "worked on various",
  "various tasks",
];

const STOP = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "this",
  "that",
  "your",
  "our",
  "are",
  "you",
  "will",
  "have",
  "has",
  "was",
  "were",
  "been",
  "being",
  "into",
  "about",
  "their",
  "they",
  "using",
  "based",
  "role",
  "work",
  "team",
  "skills",
  "experience",
  "years",
  "year",
  "strong",
  "good",
  "excellent",
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeResumeText(text) {
  const t = String(text || "").trim();
  const lower = t.toLowerCase();
  const words = t ? t.split(/\s+/).filter(Boolean) : [];
  const issues = [];
  let score = 72;

  if (words.length < 40) {
    issues.push({ id: "short", message: "Text is quite short — aim for dense impact bullets." });
    score -= 18;
  } else if (words.length < 90) {
    issues.push({ id: "thin", message: "Consider adding more concrete outcomes per role." });
    score -= 8;
  }

  if (t && !/\d/.test(t)) {
    issues.push({ id: "metrics", message: "No numbers spotted — add %, $, latency, scale, or time saved." });
    score -= 12;
  }

  const bulletish = (t.match(/^[\s]*[-•*▪]/gm) || []).length + (t.match(/\n[-•*]/g) || []).length;
  if (words.length > 30 && bulletish < 2) {
    issues.push({ id: "bullets", message: "Few bullet-style lines — scanners love scannable bullets." });
    score -= 8;
  }

  for (const phrase of WEAK_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push({
        id: "weak",
        message: `Weak phrasing (“${phrase}”) — prefer strong verbs + outcome (Built, Shipped, Cut, Scaled…).`,
      });
      score -= 7;
      break;
    }
  }

  if (lower.includes("linkedin.com") && words.length < 120) {
    issues.push({ id: "links", message: "If you link out, make sure in-PDF context still reads standalone." });
    score -= 3;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const suggestions = [];
  if (issues.some((i) => i.id === "metrics")) {
    suggestions.push("Add one line: “Reduced X by N% / saved ₹Y / cut latency from A → B.”");
  }
  if (issues.some((i) => i.id === "weak")) {
    suggestions.push("Rewrite one duty as: “[Verb] [scope] → [measurable result].”");
  }
  if (issues.length === 0) {
    suggestions.push("Nice baseline — paste a job description in the keyword tool to tune keywords.");
  }

  return {
    score,
    wordCount: words.length,
    issues,
    suggestions,
  };
}

export function keywordGaps(jobDescription, resumeText) {
  const jdTokens = tokenize(jobDescription).filter((w) => w.length > 3 && !STOP.has(w));
  const resumeLower = String(resumeText || "").toLowerCase();
  const uniq = [...new Set(jdTokens)];
  const hits = [];
  const gaps = [];
  for (const w of uniq) {
    if (resumeLower.includes(w)) hits.push(w);
    else gaps.push(w);
  }
  hits.sort((a, b) => b.length - a.length);
  gaps.sort((a, b) => b.length - a.length);
  return {
    hits: hits.slice(0, 35),
    gaps: gaps.slice(0, 25),
  };
}
