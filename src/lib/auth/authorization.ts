import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const authenticatedUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  office: true,
} as const;

export async function getAuthenticatedUser() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: userId,
      active: true,
    },
    select: authenticatedUserSelect,
  });
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const user = await requireAuthenticatedUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
