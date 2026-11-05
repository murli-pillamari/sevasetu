import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationStatus } from "@prisma/client";
import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { StatusBadge } from "@/app/dashboard/applications/status-badge";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import {
  formatDate,
  stageLabels,
  statusLabels,
} from "@/lib/applications/presentation";
import { getDashboardData } from "@/lib/applications/queries";

export const metadata: Metadata = {
  title: "ડેશબોર્ડ | SevaSetu",
};

export const instant = false;

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const dashboard = await getDashboardData(user);

  return (
    <DashboardShell title="ડેશબોર્ડ (Dashboard)" user={user}>
      <p className="mb-5 text-sm text-slate-600">
        નમસ્તે, {user.name} ·{" "}
        {user.role === "ADMIN"
          ? "આ આંકડા તમામ અરજીઓ માટે છે."
          : "આંકડા ફક્ત તમને સોંપેલી અરજીઓ માટે છે."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="કુલ અરજીઓ (Total)" value={dashboard.total} />
        <MetricCard label="બાકી અરજીઓ (Pending)" value={dashboard.pending} />
        <MetricCard
          label="ધ્યાન જરૂરી (Needs attention)"
          value={dashboard.needsAttention}
          accent
        />
        <MetricCard label="મંજૂર (Approved)" value={dashboard.approved} />
        <MetricCard label="નામંજૂર (Rejected)" value={dashboard.rejected} />
        <MetricCard
          label="મને સોંપેલી (Assigned to me)"
          value={dashboard.assignedToUser}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                તાજેતરની અરજીઓ (Recent applications)
              </h2>
              <p className="mt-1 text-xs text-slate-500">તમને સોંપાયેલી અરજીઓ</p>
            </div>
            <Link
              className="text-sm font-semibold text-teal-800 hover:underline"
              href="/dashboard/applications"
            >
              બધી અરજીઓ જુઓ
            </Link>
          </div>
          {dashboard.recentApplications.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-600">
              હાલમાં તમને કોઈ અરજી સોંપાયેલી નથી.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dashboard.recentApplications.map((application) => (
                <li className="px-5 py-4" key={application.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        className="font-semibold text-teal-900 hover:underline"
                        href={`/dashboard/applications/${application.id}`}
                      >
                        {application.applicationNo}
                      </Link>
                      <p className="mt-1 text-sm text-slate-800">
                        {application.applicantName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {stageLabels[application.currentStage]} ·{" "}
                        {formatDate(application.submittedAt)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            સ્થિતિ પ્રમાણે (Status distribution)
          </h2>
          {dashboard.total === 0 ? (
            <p className="mt-6 text-sm text-slate-600">
              સ્થિતિ દર્શાવવા માટે કોઈ અરજી નથી.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {Object.values(ApplicationStatus).map((status) => {
                const count = dashboard.counts[status] ?? 0;
                const width = Math.round((count / dashboard.total) * 100);
                return (
                  <li key={status}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                      <span className="text-slate-700">{statusLabels[status]}</span>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {count}
                      </span>
                    </div>
                    <div
                      aria-label={`${statusLabels[status]}: ${width}%`}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="img"
                    >
                      <div
                        className="h-full rounded-full bg-teal-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        accent
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">
        {value}
      </p>
    </article>
  );
}
