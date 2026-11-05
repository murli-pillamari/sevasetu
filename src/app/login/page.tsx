import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { getAuthenticatedUser } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "પ્રવેશ | SevaSetu",
};

export const instant = false;

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-teal-800">
            ગુજરાત માટેનું કાર્યપ્રવાહ વ્યવસ્થાપન
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            સેવા સેતુ
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            અધિકારી પ્રવેશ (Officer sign in)
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900">
            તમારા ખાતામાં પ્રવેશ કરો
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            આગળ વધવા માટે આપનું અધિકૃત ઇમેઇલ અને પાસવર્ડ દાખલ કરો.
          </p>
          <LoginForm />
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          આ પ્રદર્શન માટેનું કાર્યપ્રવાહ પ્લેટફોર્મ છે. અંતિમ નિર્ણય અધિકૃત
          અધિકારી દ્વારા લેવામાં આવે છે.
        </p>
      </div>
    </main>
  );
}
