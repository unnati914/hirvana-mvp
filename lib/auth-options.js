import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

const hasGitHub =
  Boolean(process.env.GITHUB_ID?.trim()) && Boolean(process.env.GITHUB_SECRET?.trim());

const hasEnvCredentials =
  Boolean(process.env.HIRVANA_AUTH_EMAIL?.trim()) &&
  Boolean(process.env.HIRVANA_AUTH_PASSWORD_HASH?.trim());

const hasDatabaseAuth = Boolean(process.env.DATABASE_URL?.trim());

function buildProviders() {
  const list = [];
  if (hasEnvCredentials || hasDatabaseAuth) {
    list.push(
      CredentialsProvider({
        id: "credentials",
        name: "Email",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "you@example.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const rawEmail = credentials?.email?.trim();
          const password = credentials?.password ?? "";
          if (!rawEmail || !password) return null;
          const emailLower = rawEmail.toLowerCase();

          if (hasDatabaseAuth) {
            try {
              const user = await prisma.user.findUnique({ where: { email: emailLower } });
              if (user?.passwordHash) {
                const ok = await bcrypt.compare(password, user.passwordHash);
                if (ok) {
                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name || rawEmail.split("@")[0] || "Member",
                  };
                }
              }
            } catch (err) {
              console.error("[next-auth] User table lookup failed (check DATABASE_URL / network):", err?.message || err);
            }
          }

          if (hasEnvCredentials) {
            const expectedEmail = process.env.HIRVANA_AUTH_EMAIL?.trim();
            const hash = process.env.HIRVANA_AUTH_PASSWORD_HASH?.trim();
            if (!expectedEmail || !hash) return null;
            if (emailLower !== expectedEmail.toLowerCase()) return null;
            const ok = await bcrypt.compare(password, hash);
            if (!ok) return null;
            return {
              id: `creds:${emailLower}`,
              email: emailLower,
              name: rawEmail.split("@")[0] || "Member",
            };
          }

          return null;
        },
      })
    );
  }
  if (hasGitHub) {
    list.push(
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    );
  }
  return list;
}

/** @type {import("next-auth").NextAuthOptions} */
export const authOptions = {
  providers: buildProviders(),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
};

const hasNextAuthSecret = () => Boolean(process.env.NEXTAUTH_SECRET?.trim());

/** True when GitHub OAuth is configured and NextAuth secret is set. */
export function isOAuthConfigured() {
  return hasNextAuthSecret() && hasGitHub;
}

/** @returns {{ credentials: boolean; signup: boolean; github: boolean; configured: boolean }} */
export function getAuthEnvFlags() {
  const secret = hasNextAuthSecret();
  const credentials = secret && (hasEnvCredentials || hasDatabaseAuth);
  return {
    credentials,
    signup: secret && hasDatabaseAuth,
    github: secret && hasGitHub,
    configured: secret && (hasEnvCredentials || hasDatabaseAuth || hasGitHub),
  };
}
