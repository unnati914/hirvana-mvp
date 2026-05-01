import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { isAdminAuthorizedFromFetchHeaders } from "./lib/admin-auth";

const authHandler = withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
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
  const res = await authHandler(req, event);
  return res ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
