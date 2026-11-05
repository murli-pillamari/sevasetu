import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { credentialsSchema } from "@/lib/auth/credentials";
import { prisma } from "@/lib/prisma";

const authSecret = process.env.AUTH_SECRET;

if (
  !authSecret ||
  authSecret.length < 32 ||
  authSecret === "replace-with-a-secure-random-value"
) {
  throw new Error(
    "Set AUTH_SECRET to a random value of at least 32 characters before starting the application.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsedCredentials.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            office: true,
            active: true,
          },
        });

        if (!user?.active) {
          return null;
        }

        const passwordMatches = await compare(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          office: user.office,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.office = user.office;
      }

      return token;
    },
    async session({ session, token }) {
      if (
        !token.sub ||
        !token.role ||
        !Object.values(UserRole).includes(token.role)
      ) {
        throw new Error("Invalid authenticated session.");
      }

      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.office = token.office ?? null;

      return session;
    },
  },
});
