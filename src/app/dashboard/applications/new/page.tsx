import type { Metadata } from "next";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { ApplicationForm } from "@/app/dashboard/applications/application-form";
import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "નવી અરજી | SevaSetu",
};

export const instant = false;

export default async function NewApplicationPage() {
  const user = await requireRole([UserRole.CLERK]);

  return (
    <DashboardShell title="નવી અરજી (New application)" user={user}>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="mb-6">
          <Link
            className="text-sm font-medium text-teal-800 hover:underline"
            href="/dashboard/applications"
          >
            ← અરજીઓ પર પાછા જાઓ
          </Link>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            અરજદારની માહિતી દાખલ કરો. આ અરજી દસ્તાવેજ ચકાસણી માટે તમને સોંપાશે.
          </p>
        </div>
        <ApplicationForm />
      </div>
    </DashboardShell>
  );
}
