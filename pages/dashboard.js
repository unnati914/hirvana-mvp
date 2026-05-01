import Link from "next/link";
import Layout from "../components/Layout";
import { DEFAULT_FEATURES } from "../lib/features-seed";

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

export default function Dashboard({ features }) {
  const list = Array.isArray(features) && features.length ? features : DEFAULT_FEATURES;

  return (
    <Layout title="Dashboard">
      <p className="-mt-4 mb-10 max-w-2xl text-slate-400">
        Your workspace for Hirvana tools. Badges follow rollout status from the product catalog on the server.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(({ id, title, description, status }) => (
          <article
            key={id}
            id={id}
            className="group flex scroll-mt-24 flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-blue-500/40 hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[status] || statusBadge.soon}`}
              >
                {statusLabel[status] || status}
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
            <Link
              href="/waitlist"
              className="mt-6 inline-flex w-fit items-center text-sm font-semibold text-blue-400 transition group-hover:text-blue-300"
            >
              Get notified →
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
        <p className="text-slate-400">
          Need the full experience?{" "}
          <Link href="/pay" className="font-semibold text-blue-400 hover:text-blue-300">
            Unlock early access
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    let features = DEFAULT_FEATURES;
    const mod = await import("../lib/features-store");
    const loaded = await mod.getFeatures();
    if (Array.isArray(loaded) && loaded.length) {
      features = loaded;
    }
    return {
      props: { features },
      revalidate: 60,
    };
  } catch (e) {
    console.error("dashboard getStaticProps", e);
    return {
      props: { features: DEFAULT_FEATURES },
      revalidate: 60,
    };
  }
}
