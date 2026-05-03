import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { isAdminAuthorizedFromFetchHeaders } from "./lib/admin-auth";

const authHandler = withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      if (path === "/") return true;
      if (path.startsWith("/pay")) return true;
      if (path.startsWith("/login")) return true;
      if (path.startsWith("/signup")) return true;
      if (path.startsWith("/api/auth")) return true;
      if (path.startsWith("/api/signup")) return true;
      if (path.startsWith("/api/health")) return true;
      if (path.startsWith("/api/") && isAdminAuthorizedFromFetchHeaders(req.headers)) return true;
      return !!token;
    },
  },
});

export default async function middleware(req, event) {
  try {
    const res = await authHandler(req, event);
    return res ?? NextResponse.next();
  } catch (err) {
    // next-auth calls parseUrl(process.env.NEXTAUTH_URL); an empty string makes new URL("") throw and
    // would otherwise take down every route (including /login). Avoid redirect loops: return 500 text.
    console.error("[hirvana middleware]", err);
    const hint =
      "Hirvana middleware error. Common causes: NEXTAUTH_URL is blank or invalid (use a full URL like https://your-app.vercel.app), or NEXTAUTH_SECRET is missing in production. See README → Sign-in.";
    return new NextResponse(`${hint}\n\n${err?.message || err}`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
