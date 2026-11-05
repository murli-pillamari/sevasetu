import type { Metadata } from "next";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { StatusBadge } from "@/app/dashboard/applications/status-badge";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import {
  formatDate,
  roleShortLabels,
  stageLabels,
  statusLabels,
} from "@/lib/applications/presentation";
import { getApplicationList } from "@/lib/applications/queries";
import {
  applicationListQuerySchema,
  type ApplicationListQuery,
} from "@/lib/applications/validation";

export const metadata: Metadata = {
  title: "અરજીઓ | SevaSetu",
};

export const instant = false;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const user = await requireAuthenticatedUser();
  const params = await searchParams;
  const parsed = applicationListQuerySchema.safeParse({
    q: firstValue(params.q),
    status: firstValue(params.status),
    district: firstValue(params.district),
    page: firstValue(params.page),
  });
  const filters: ApplicationListQuery = parsed.success
    ? parsed.data
    : { q: "", status: "", district: "", page: 1 };
  const result = await getApplicationList(user, filters);

  return (
    <DashboardShell
      title="અરજીઓ (Applications)"
      user={user}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px_auto]">
          <div>
            <label className="sr-only" htmlFor="q">
              અરજીઓ શોધો (Search applications)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              defaultValue={filters.q}
              id="q"
              name="q"
              placeholder="અરજી નંબર, નામ અથવા મોબાઇલથી શોધો"
              type="search"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="status">
              સ્થિતિ (Status)
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
              defaultValue={filters.status}
              id="status"
              name="status"
            >
              <option value="">બધી સ્થિતિઓ (All statuses)</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="district">
              જિલ્લો (District)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              defaultValue={filters.district}
              id="district"
              name="district"
              placeholder="જિલ્લાથી ફિલ્ટર"
            />
          </div>
          <button
            className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            type="submit"
          >
            શોધો (Search)
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          કુલ {result.total} અરજીઓ
        </p>
        {user.role === UserRole.CLERK ? (
          <Link
            className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            href="/dashboard/applications/new"
          >
            નવી અરજી (New application)
          </Link>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {result.applications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h2 className="font-semibold text-slate-900">
              કોઈ અરજી મળી નથી
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              શોધ અથવા ફિલ્ટર બદલીને ફરી પ્રયાસ કરો.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3" scope="col">અરજી / અરજદાર</th>
                    <th className="px-4 py-3" scope="col">સબમિશન</th>
                    <th className="px-4 py-3" scope="col">તબક્કો</th>
                    <th className="px-4 py-3" scope="col">અધિકારી</th>
                    <th className="px-4 py-3" scope="col">સ્થિતિ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.applications.map((application) => (
                    <tr
                      className="align-top transition hover:bg-slate-50"
                      key={application.id}
                    >
                      <td className="px-4 py-4">
                        <Link
                          className="font-semibold text-teal-900 underline-offset-2 hover:underline"
                          href={`/dashboard/applications/${application.id}`}
                        >
                          {application.applicationNo}
                        </Link>
                        <p className="mt-1 text-slate-800">
                          {application.applicantNameGu ||
                            application.applicantName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {application.district} · {application.taluka}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {formatDate(application.submittedAt)}
                      </td>
                      <td className="min-w-52 px-4 py-4 text-slate-600">
                        {stageLabels[application.currentStage]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {application.assignedUser
                          ? `${application.assignedUser.name} · ${roleShortLabels[application.assignedUser.role]}`
                          : "સોંપાયેલ નથી"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={application.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              aria-label="અરજી પાનાં (Application pages)"
              className="flex items-center justify-between border-t border-slate-200 px-4 py-3"
            >
              <p className="text-sm text-slate-600">
                પાનું {result.page} / {result.pageCount}
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    href={pageHref(filters, result.page - 1)}
                  >
                    અગાઉનું
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    href={pageHref(filters, result.page + 1)}
                  >
                    આગળનું
                  </Link>
                ) : null}
              </div>
            </nav>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function pageHref(
  filters: { q: string; status: string; district: string },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.district) params.set("district", filters.district);
  params.set("page", String(page));
  return `/dashboard/applications?${params.toString()}`;
}
