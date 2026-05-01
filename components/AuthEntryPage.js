import Layout from "./Layout";
import LoginSignupPanel from "./LoginSignupPanel";

export default function AuthEntryPage({ auth }) {
  const { configured } = auth;

  return (
    <Layout>
      <div className="mx-auto flex max-w-md flex-col items-stretch">
        {!configured ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
            <p className="font-semibold text-amber-50">Sign-in is not fully configured</p>
            <p className="mt-2 text-amber-100/90">
              Set <code className="rounded bg-slate-950/80 px-1">NEXTAUTH_SECRET</code> and{" "}
              <code className="rounded bg-slate-950/80 px-1">NEXTAUTH_URL</code>, then enable at least one method:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-amber-100/90">
              <li>
                <strong>Postgres (recommended):</strong> <code className="rounded bg-slate-950/80 px-1">DATABASE_URL</code> +{" "}
                <code className="rounded bg-slate-950/80 px-1">npm run db:migrate</code> — <strong>Create account</strong> stores users in the{" "}
                <code className="rounded bg-slate-950/80 px-1">User</code> table; sign-in reads the same table.
              </li>
              <li>
                Single env user: <code className="rounded bg-slate-950/80 px-1">HIRVANA_AUTH_EMAIL</code> +{" "}
                <code className="rounded bg-slate-950/80 px-1">HIRVANA_AUTH_PASSWORD_HASH</code> (bcrypt)
              </li>
              <li>
                GitHub: <code className="rounded bg-slate-950/80 px-1">GITHUB_ID</code> +{" "}
                <code className="rounded bg-slate-950/80 px-1">GITHUB_SECRET</code>
              </li>
            </ul>
            <p className="mt-3 text-amber-100/90">
              See <code className="rounded bg-slate-950/80 px-1">README.md</code>. Restart the dev server after changing{" "}
              <code className="rounded bg-slate-950/80 px-1">.env.local</code>.
            </p>
          </div>
        ) : (
          <LoginSignupPanel auth={auth} />
        )}
      </div>
    </Layout>
  );
}
