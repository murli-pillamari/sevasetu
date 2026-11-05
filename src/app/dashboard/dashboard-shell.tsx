import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { roleLabels } from "@/lib/auth/dashboard-navigation";
import type { requireAuthenticatedUser } from "@/lib/auth/authorization";

type DashboardUser = NonNullable<
  Awaited<ReturnType<typeof requireAuthenticatedUser>>
>;

export function DashboardShell({
  user,
  title,
  children,
}: {
  user: DashboardUser;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-medium text-teal-800">
              ગુજરાત માટેનું કાર્યપ્રવાહ વ્યવસ્થાપન
            </p>
            <Link
              className="mt-1 inline-block text-2xl font-semibold text-slate-950"
              href="/dashboard"
            >
              સેવા સેતુ
            </Link>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="sm:text-right">
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-600">{roleLabels[user.role]}</p>
              <p className="text-sm text-slate-600">
                કચેરી: {user.office ?? "માહિતી ઉપલબ્ધ નથી"}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                type="submit"
              >
                બહાર નીકળો (Log out)
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
        <aside>
          <nav
            aria-label="મુખ્ય નેવિગેશન (Main navigation)"
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <Link
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/dashboard"
            >
              ડેશબોર્ડ (Dashboard)
            </Link>
            <Link
              className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/dashboard/applications"
            >
              અરજીઓ (Applications)
            </Link>
            {user.role === "CLERK" ? (
              <Link
                className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                href="/dashboard/applications/new"
              >
                નવી અરજી (New application)
              </Link>
            ) : null}
          </nav>
          <p className="mt-4 px-2 text-xs leading-5 text-slate-500">
            અરજીઓની વિગતો ફક્ત તમને સોંપાયેલ કેસોમાંથી ઉપલબ્ધ છે.
          </p>
        </aside>

        <section className="min-w-0">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
