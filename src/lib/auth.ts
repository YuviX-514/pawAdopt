import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Account, User as NextAuthUser } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { normalizeRole } from "@/lib/roles";
import bcrypt from "bcryptjs";
import { ensureConfiguredAdmins } from "@/lib/admin-seed";

const PRODUCTION_URL = "https://paw-adopt.vercel.app";

function getAllowedAuthOrigins(baseUrl: string) {
  return new Set([
    baseUrl,
    PRODUCTION_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter((origin): origin is string => Boolean(origin)));
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectDB();
        await ensureConfiguredAdmins();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: normalizeRole(user.role),
        };
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: NextAuthUser;
      account: Account | null;
    }) {
      if (!user.email) return false;

      await connectDB();
      await ensureConfiguredAdmins();

      const email = user.email.toLowerCase();
      const existing = await User.findOne({ email });

      if (!existing) {
        await User.create({
          username: user.name || email.split("@")[0],
          email,
          password: null,
          provider: account?.provider,
          role: "adopter",
        });
        return true;
      }

      existing.role = normalizeRole(existing.role);

      const provider = account?.provider || existing.provider || "credentials";

      if (existing.provider !== provider) {
        existing.provider = provider;
      }

      await existing.save();
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = normalizeRole(token.role);
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        await connectDB();
        await ensureConfiguredAdmins();
        const dbUser = await User.findOne({ email: user.email.toLowerCase() }).select("role");
        token.sub = dbUser?._id.toString() || user.id;
        token.role = normalizeRole(dbUser?.role || user.role);
        return token;
      }

      if (token.email) {
        await connectDB();
        await ensureConfiguredAdmins();
        const dbUser = await User.findOne({ email: token.email.toLowerCase() }).select("role");
        token.role = normalizeRole(dbUser?.role);
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const targetUrl = new URL(url);
        if (getAllowedAuthOrigins(baseUrl).has(targetUrl.origin)) return url;
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },
};
