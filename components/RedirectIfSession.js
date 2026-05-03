import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

/** Safe in-app path only (avoid open redirects). */
function safeCallbackUrl(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * When the session cookie is valid in the browser, leave /login without using
 * getServerSideProps redirect — that can disagree with Edge middleware getToken()
 * and cause ERR_TOO_MANY_REDIRECTS (login → / → login).
 */
export default function RedirectIfSession() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !session) return;
    const q = router.query?.callbackUrl;
    const dest = Array.isArray(q) ? safeCallbackUrl(q[0]) : safeCallbackUrl(q);
    void router.replace(dest);
  }, [status, session, router]);

  return null;
}
