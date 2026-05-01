import { useMemo, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";

const NOTE = "Hirvana early access";
/** Shown in UI; UPI `am` uses two decimals when prefilled. */
const DEFAULT_PRICE_RUPEES = "499.00";

function buildUpiDeepLink(pa, pn, tn, amount) {
  const params = { pa, pn, cu: "INR", tn };
  if (amount && String(amount).trim()) {
    params.am = String(amount).trim();
  }
  return `upi://pay?${new URLSearchParams(params).toString()}`;
}

export default function Pay() {
  const [copied, setCopied] = useState(false);
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "unnati.86@ptaxis";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "Hirvana";
  const upiAmount =
    process.env.NEXT_PUBLIC_UPI_AMOUNT?.trim?.() || DEFAULT_PRICE_RUPEES;

  const upiHref = useMemo(
    () => buildUpiDeepLink(upiId, payeeName, NOTE, upiAmount),
    [upiId, payeeName, upiAmount]
  );

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this UPI ID:", upiId);
    }
  }

  function openUpiPay() {
    window.location.assign(upiHref);
  }

  return (
    <Layout title="Early access">
      <p className="-mt-4 mb-10 max-w-xl text-slate-400">
        One-time founding-member access for <span className="font-semibold text-slate-200">₹499</span>. Pay with any
        UPI app using the ID below or the one-tap link (amount prefilled where your app supports it).
      </p>

      <div className="mx-auto max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 shadow-glow">
          <div className="border-b border-slate-800 bg-blue-500/10 px-8 py-6">
            <p className="text-sm font-medium uppercase tracking-wider text-blue-300">Founding offer</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">₹499</span>
              <span className="text-slate-500 line-through">₹999</span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">Early access bundle</p>
            <p className="mt-2 text-sm text-slate-400">UPI · Limited slots</p>
          </div>
          <ul className="space-y-3 px-8 py-6 text-sm text-slate-300">
            {[
              "Resume AI when it launches",
              "Auto-apply workflows",
              "Priority access for 1:1 mentorship",
              "Product updates and templates",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-blue-400" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="space-y-4 border-t border-slate-800 px-8 py-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">UPI ID</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 break-all rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={copyUpi}
                  className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={openUpiPay}
              aria-label={`Open UPI app to pay ₹499 to ${upiId}`}
              className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 py-3.5 text-base font-semibold text-white transition hover:from-blue-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Pay ₹499 in UPI app
            </button>
            <p className="text-center text-xs text-slate-500">
              The{" "}
              <Link href="/resume" className="font-medium text-blue-400 hover:text-blue-300">
                Resume hub
              </Link>{" "}
              (scan, JD keywords, optimiser) is free for everyone — early access bundles the rest of the
              roadmap.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
