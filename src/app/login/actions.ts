"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { credentialsSchema } from "@/lib/auth/credentials";

export type LoginState =
  | {
      error?: string;
      emailError?: string;
      passwordError?: string;
    }
  | undefined;

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsedCredentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    const emailError = parsedCredentials.error.issues.find(
      (issue) => issue.path[0] === "email",
    )?.message;
    const passwordError = parsedCredentials.error.issues.find(
      (issue) => issue.path[0] === "password",
    )?.message;

    return {
      emailError: emailError ? "યોગ્ય ઇમેઇલ દાખલ કરો." : undefined,
      passwordError: passwordError ? "પાસવર્ડ દાખલ કરો." : undefined,
      error: "કૃપા કરીને વિગતો તપાસો.",
    };
  }

  try {
    await signIn("credentials", {
      ...parsedCredentials.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "ઇમેઇલ અથવા પાસવર્ડ સાચો નથી." };
      }

      return { error: "લોગિન કરી શકાયું નથી. કૃપા કરીને ફરી પ્રયાસ કરો." };
    }

    throw error;
  }

  return undefined;
}
