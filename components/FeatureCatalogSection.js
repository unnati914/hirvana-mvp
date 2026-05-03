import Link from "next/link";
import FeatureActions from "./FeatureActions";
import { useFeaturesCatalog } from "../hooks/useFeaturesCatalog";

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

/**
 * Feature roadmap grid (shared by landing and legacy marketing blocks).
 */
export default function FeatureCatalogSection() {
  const list = useFeaturesCatalog();

  return (
    <section id="tools" className="w-full scroll-mt-24" aria-labelledby="tools-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2
          id="tools-heading"
          className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Tools on your path
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-400 sm:text-base">
          Everything here is built for students and early-career builders—resume, interviews, and
          staying organized while you apply.
        </p>
        <ul className="mt-12 grid w-full gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ id, title, description, status }) => (
            <li
              key={id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-blue-500/30"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white">{title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[status] || statusBadge.soon}`}
                >
                  {statusLabel[status] || status}
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
              <FeatureActions featureId={id} layout="row" />
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-slate-500">
          Already in?{" "}
          <Link href="/dashboard" className="font-medium text-blue-400 hover:text-blue-300">
            Open your dashboard
          </Link>
        </p>
      </div>
    </section>
  );
}
