import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

/**
 * @param {{ auth: { credentials: boolean; signup: boolean; github: boolean; configured: boolean } }} props
 */
export default function LoginSignupPanel({ auth }) {
  const { credentials, signup, github, configured } = auth;
  const showBoth = credentials && github;
  /** Postgres sign-up API on — show create-account beside sign-in on large screens. */
  const showSignupSection = signup && credentials;

  const [showCreatedBanner, setShowCreatedBanner] = useState(false);

  /** Strip legacy `#signup` from the address bar so the URL stays `/login`. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#signup") return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInBusy, setSignInBusy] = useState(false);

  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suError, setSuError] = useState("");
  const [suBusy, setSuBusy] = useState(false);

  const blurb =
    credentials && github
      ? "Use your email and password, or continue with GitHub."
      : credentials
        ? "Enter your email and password."
        : "Continue with your GitHub account.";

  function focusSignIn() {
    if (typeof document === "undefined") return;
    document.getElementById("signin-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSignIn(e) {
    e.preventDefault();
    setSignInError("");
    setSignInBusy(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });
      if (res?.error) {
        setSignInError("Invalid email or password.");
        return;
      }
      if (res?.ok) {
        const dest =
          typeof res.url === "string" && (res.url.startsWith("/") || res.url.startsWith("http"))
            ? res.url
            : "/";
        window.location.assign(dest);
        return;
      }
      setSignInError("Could not continue. Try again.");
    } finally {
      setSignInBusy(false);
    }
  }

  /**
   * After POST /api/signup the new row may not be visible to the next serverless
   * invocation immediately; retry credentials sign-in, then hard-navigate so the
   * session cookie is always applied before hitting middleware.
   */
  async function signInAfterSignup(emailLower, password) {
    await new Promise((r) => setTimeout(r, 150));
    let last = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 180 * attempt));
      try {
        last = await signIn("credentials", {
          redirect: false,
          email: emailLower,
          password,
          callbackUrl: "/",
        });
      } catch (err) {
        console.error("signIn after signup", err);
        last = { ok: false, error: "NetworkError" };
      }
      if (last?.ok) {
        const dest =
          typeof last.url === "string" && (last.url.startsWith("/") || last.url.startsWith("http"))
            ? last.url
            : "/";
        window.location.assign(dest);
        return true;
      }
    }
    return last;
  }

  async function onSignUp(e) {
    e.preventDefault();
    setSuError("");
    if (suPassword !== suConfirm) {
      setSuError("Passwords do not match.");
      return;
    }
    setSuBusy(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSuError(typeof data.error === "string" ? data.error : "Sign up failed.");
        return;
      }

      const emailLower = suEmail.trim().toLowerCase();
      if (credentials) {
        const lastSi = await signInAfterSignup(emailLower, suPassword);
        if (lastSi === true) return;

        const err = lastSi && typeof lastSi === "object" ? lastSi.error : null;
        const hint =
          err === "CredentialsSignin"
            ? "Account created. Sign-in did not pick up the new password yet—wait a few seconds, then tap Continue below (or refresh the page)."
            : err
              ? `Account created, but automatic sign-in failed (${err}). Use Sign in below.`
              : "Account created, but automatic sign-in failed. Use Sign in below.";
        setSuError(hint);
        setEmail(emailLower);
        setPassword(suPassword);
        setSignInError("");
        focusSignIn();
        return;
      }

      setShowCreatedBanner(true);
      focusSignIn();
    } catch {
      setSuError("Network error. Try again.");
    } finally {
      setSuBusy(false);
    }
  }

  if (!configured) {
    return null;
  }

  const gridTwoCol = showSignupSection;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-left shadow-xl backdrop-blur sm:p-8">
      {showCreatedBanner ? (
        <p className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100">
          Account created. Use <strong className="text-emerald-50">Sign in</strong> with the same email and password to continue to the home page.
        </p>
      ) : null}

      <div
        className={
          gridTwoCol
            ? "grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-0"
            : "grid grid-cols-1"
        }
      >
        <section
          id="signin-section"
          aria-labelledby="signin-heading"
          className={`scroll-mt-6 min-w-0 ${gridTwoCol ? "lg:pr-8" : ""}`}
        >
        <h2 id="signin-heading" className="text-lg font-semibold text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-slate-400">{blurb}</p>

        {credentials ? (
          <form className="mt-6 space-y-4" onSubmit={onSignIn}>
            <div>
              <label htmlFor="signin-email" className="block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {signInError ? <p className="text-sm text-rose-400">{signInError}</p> : null}
            <button
              type="submit"
              disabled={signInBusy}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 py-3 text-sm font-semibold text-white shadow transition hover:from-blue-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signInBusy ? "Please wait…" : "Continue"}
            </button>
          </form>
        ) : null}

        {showBoth ? (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/90 px-3 text-slate-500">or</span>
            </div>
          </div>
        ) : null}

        {github ? (
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className={`flex w-full items-center justify-center gap-3 rounded-xl border border-slate-600 bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 ${credentials ? "" : "mt-6"}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            Continue with GitHub
          </button>
        ) : null}
      </section>

      {showSignupSection && (
        <section
          className="min-w-0 border-t border-slate-800 pt-10 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
          aria-labelledby="signup-heading"
        >
          <h2 id="signup-heading" className="text-lg font-semibold text-white">
            Create account
          </h2>
          <p className="mt-1 text-sm text-slate-400">New account with email and password.</p>
          <form className="mt-5 space-y-4" onSubmit={onSignUp}>
            <div>
              <label htmlFor="su-name" className="block text-xs font-medium text-slate-400">
                Name <span className="text-slate-600">(optional)</span>
              </label>
              <input
                id="su-name"
                name="name"
                type="text"
                autoComplete="name"
                value={suName}
                onChange={(e) => setSuName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="su-email" className="block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="su-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={suEmail}
                onChange={(e) => setSuEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="su-password" className="block text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="su-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={suPassword}
                onChange={(e) => setSuPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="su-confirm" className="block text-xs font-medium text-slate-400">
                Confirm password
              </label>
              <input
                id="su-confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={suConfirm}
                onChange={(e) => setSuConfirm(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {suError ? <p className="text-sm text-rose-400">{suError}</p> : null}
            <button
              type="submit"
              disabled={suBusy}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 py-3 text-sm font-semibold text-white shadow transition hover:from-blue-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {suBusy ? "Creating account…" : "Create account"}
            </button>
          </form>
        </section>
      )}
      </div>
    </div>
  );
}
