import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="shrink-0 text-xs text-slate-500">…</span>;
  }

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="shrink-0 rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:px-3 sm:text-sm"
      >
        Log out
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="shrink-0 rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 sm:px-3 sm:text-sm"
    >
      Sign in
    </Link>
  );
}
