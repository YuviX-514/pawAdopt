import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Account, User as NextAuthUser } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

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
        await connectDB();

        console.log("AUTH credentials", credentials);

        // ✅ Remove provider filter - search only by email
        const user = await User.findOne({
          email: credentials!.email,
        });

        console.log("Found user:", user);

        // must exist, and have a password (i.e. not OAuth-only)
        if (!user || !user.password) {
          console.log("User not found or missing password");
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        console.log("Password valid:", isValid);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
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
      await connectDB();

      const existing = await User.findOne({ email: user.email });

      if (!existing) {
        await User.create({
          username: user.name || user.email?.split("@")[0],
          email: user.email,
          password: null,
          provider: account?.provider,
        });
      } else {
        if (existing.provider !== account?.provider) {
          existing.provider = account?.provider;
          await existing.save();
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
