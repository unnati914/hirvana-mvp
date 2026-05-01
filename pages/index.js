import Link from "next/link";
import { useFeaturesCatalog } from "../hooks/useFeaturesCatalog";
import Layout from "../components/Layout";

const statusBadge = {
  soon: "bg-slate-800 text-slate-400",
  beta: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  live: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
};

const statusLabel = {
  soon: "Soon",
  beta: "Beta",
  live: "Live",
};

export default function Home() {
  const list = useFeaturesCatalog();

  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Land your next role with{" "}
          <span className="bg-gradient-to-r from-blue-300 to-sky-400 bg-clip-text text-transparent">
            AI + mentorship
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/pay"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-8 py-3.5 text-base font-semibold text-white shadow-glow transition hover:from-blue-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Join early access
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-900/50 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Join waitlist
          </Link>
        </div>

        <ul className="mt-28 grid w-full max-w-5xl gap-5 text-left sm:mt-32 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ id, title, description, status }) => (
            <li
              key={id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-blue-500/30"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-semibold text-white">{title}</h2>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[status] || statusBadge.soon}`}
                >
                  {statusLabel[status] || status}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
