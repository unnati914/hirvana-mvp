import Link from "next/link";
import { getToolHref } from "../lib/tool-routes";

export default function FeatureActions({ featureId, layout = "stack" }) {
  const toolHref = getToolHref(featureId);
  if (!toolHref) return null;

  const wrap =
    layout === "row"
      ? "mt-5 flex flex-wrap items-center gap-3"
      : "mt-6 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3";

  return (
    <div className={wrap}>
      <Link
        href={toolHref}
        className="inline-flex items-center rounded-lg bg-blue-500/15 px-3 py-2 text-sm font-semibold text-blue-300 ring-1 ring-blue-500/35 transition hover:bg-blue-500/25 hover:text-white"
      >
        Open tool
      </Link>
    </div>
  );
}
