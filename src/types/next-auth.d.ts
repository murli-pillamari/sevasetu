import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      office: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    office: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
    office?: string | null;
  }
}
