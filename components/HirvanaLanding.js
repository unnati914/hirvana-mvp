import Link from "next/link";
import FeatureCatalogSection from "./FeatureCatalogSection";

const pillars = [
  {
    title: "Resume that reads clear",
    body: "Structure, wording, and ATS-friendly patterns so recruiters see your story fast—not a wall of buzzwords.",
    href: "/resume",
    cta: "Open resume hub",
  },
  {
    title: "Interview reps, not guesswork",
    body: "Practice with prompts and feedback tuned for real screens—behavioral, technical, and how you frame projects.",
    href: "/dashboard",
    cta: "Explore interview tools",
  },
  {
    title: "Applications you can track",
    body: "One place for roles, stages, and follow-ups so nothing slips when you are juggling classes and deadlines.",
    href: "/tracker",
    cta: "Try the tracker",
  },
];

const steps = [
  { n: "1", title: "Sign in free", body: "Use email or GitHub. No card required to explore the resume hub and catalog." },
  { n: "2", title: "Pick your focus", body: "Polish a resume, run a mock, or log applications—whatever is blocking you this week." },
  { n: "3", title: "Level up with early access", body: "Supporters unlock the full roadmap faster and help shape what we ship next." },
];

/**
 * Full marketing landing for Hirvana (hero, pillars, how it works, feature catalog).
 * @param {{ belowHero?: import("react").ReactNode }} [props]
 */
export default function HirvanaLanding({ belowHero }) {
  return (
    <div className="flex w-full flex-col items-stretch">
      <section
        className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950 pb-20 pt-6 sm:pb-24 sm:pt-10"
        aria-labelledby="hirvana-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.18),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-300/90">Hirvana</p>
          <h1
            id="hirvana-hero-heading"
            className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Your career prep workspace—{" "}
            <span className="bg-gradient-to-r from-blue-300 to-sky-400 bg-clip-text text-transparent">
              AI, structure, and momentum
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Built for students and early-career builders who want sharper resumes, calmer interviews,
            and a single place to track where they applied—without drowning in tabs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/resume"
              className="inline-flex w-full min-w-[12rem] items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            >
              Start with the resume hub
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full min-w-[12rem] items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 px-8 py-3.5 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            >
              Sign in
            </Link>
            <Link
              href="/pay"
              className="inline-flex w-full min-w-[12rem] items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 px-8 py-3.5 text-base font-semibold text-blue-200 transition hover:border-blue-400/60 hover:bg-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
            >
              Join early access
            </Link>
            <Link
              href="#tools"
              className="text-sm font-medium text-slate-400 underline-offset-4 transition hover:text-slate-200 hover:underline"
            >
              Browse all tools
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            Early access &amp; supporter perks on{" "}
            <Link href="/pay" className="font-medium text-blue-400 hover:text-blue-300">
              pricing
            </Link>
            .
          </p>
        </div>
      </section>

      {belowHero ? <div className="mx-auto mt-12 w-full max-w-md px-4 sm:px-6">{belowHero}</div> : null}

      <section className="border-b border-slate-800/60 py-14 sm:py-16" aria-labelledby="pillars-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="pillars-heading" className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Three ways we help you move forward
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {pillars.map(({ title, body, href, cta }) => (
              <li
                key={title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/30 p-6 transition hover:border-blue-500/25"
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{body}</p>
                <Link
                  href={href}
                  className="mt-5 inline-flex text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  {cta} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-16" aria-labelledby="how-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 id="how-heading" className="text-center text-2xl font-semibold text-white sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map(({ n, title, body }) => (
              <li key={n} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300 ring-1 ring-blue-500/40">
                  {n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="py-14 sm:py-16">
        <FeatureCatalogSection />
      </div>

      <section className="border-t border-slate-800/80 bg-slate-900/25 py-16 sm:py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 id="cta-heading" className="text-2xl font-semibold text-white sm:text-3xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-slate-400">
            Jump into the resume hub in one click, or sign in to sync your tools and tracker across devices.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/resume"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400 sm:min-w-[11rem]"
            >
              Open resume hub
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-8 py-3.5 text-base font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800/60 sm:min-w-[11rem]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
