import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AIReviewSection } from "@/app/dashboard/applications/ai-review-section";
import { ApplicationForm } from "@/app/dashboard/applications/application-form";
import { WorkflowControls } from "@/app/dashboard/applications/workflow-controls";
import { DashboardShell } from "@/app/dashboard/dashboard-shell";
import { StatusBadge } from "@/app/dashboard/applications/status-badge";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import {
  documentReviewSchema,
  isOpenAIConfigured,
} from "@/lib/applications/ai-review";
import {
  formatCurrency,
  formatDate,
  requiredDocuments,
  roleShortLabels,
  stageLabels,
  taskStatusLabels,
} from "@/lib/applications/presentation";
import { getApplicationDetails } from "@/lib/applications/queries";

export const metadata: Metadata = {
  title: "અરજીની વિગતો | SevaSetu",
};

export const instant = false;

export default async function ApplicationDetailsPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  const application = await getApplicationDetails(user, id);

  if (!application) {
    notFound();
  }

  const lastAnalysis = application.aiAnalyses[0];
  const analysisResult = lastAnalysis
    ? documentReviewSchema.safeParse(lastAnalysis.outputData)
    : null;
  const canRequestAI =
    user.role === UserRole.CLERK &&
    application.assignedUserId === user.id &&
    application.currentStage === "DOCUMENT_SCRUTINY" &&
    (application.status === "SUBMITTED" ||
      application.status === "DOCUMENT_REVIEW");
  const returnedTask = [...application.workflowTasks]
    .reverse()
    .find((task) => task.status === "RETURNED");
  const canCorrect =
    user.role === UserRole.CLERK &&
    application.assignedUserId === user.id &&
    application.status === "RETURNED";
  const correctionValues = {
    applicantName: application.applicantName,
    applicantNameGu: application.applicantNameGu ?? "",
    phone: application.phone,
    address: application.address,
    district: application.district,
    taluka: application.taluka,
    annualIncome: Number(application.annualIncome),
    familyMembers: application.familyMembers,
    incomePurpose: application.incomePurpose,
  };

  return (
    <DashboardShell
      title={`અરજી ${application.applicationNo}`}
      user={user}
    >
      <div className="mb-4">
        <Link
          className="text-sm font-medium text-teal-800 hover:underline"
          href="/dashboard/applications"
        >
          ← અરજીઓ પર પાછા જાઓ
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-teal-800">
                  {application.applicationNo}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {application.applicantNameGu || application.applicantName}
                </h2>
                {application.applicantNameGu ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {application.applicantName}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={application.status} />
            </div>
            <dl className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <Detail label="મોબાઇલ (Phone)" value={application.phone} />
              <Detail
                label="વાર્ષિક કુટુંબ આવક (Annual income)"
                value={formatCurrency(application.annualIncome.toString())}
              />
              <Detail
                label="સરનામું (Address)"
                value={`${application.address}, ${application.taluka}, ${application.district}`}
              />
              <Detail
                label="કુટુંબના સભ્યો (Family members)"
                value={String(application.familyMembers)}
              />
              <Detail
                label="પ્રમાણપત્રનો હેતુ (Purpose)"
                value={application.incomePurpose}
              />
              <Detail
                label="સબમિશન તારીખ (Submitted)"
                value={formatDate(application.submittedAt)}
              />
            </dl>
          </section>

          {application.status === "RETURNED" ? (
            <section
              aria-labelledby="returned-application-heading"
              className="rounded-xl border border-amber-300 bg-amber-50 p-5"
            >
              <h2
                className="font-semibold text-amber-950"
                id="returned-application-heading"
              >
                સુધારા જરૂરી (Corrections required)
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                અધિકારીએ આ અરજી સુધારા માટે પરત કરી છે. અરજી નંબર અને ઓળખ
                બદલાશે નહીં.
              </p>
              {returnedTask?.remarks ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-xs font-medium text-slate-600">
                    અધિકારીની નોંધ (Officer remarks)
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-900">
                    {returnedTask.remarks}
                  </p>
                </div>
              ) : null}
              {canCorrect ? (
                <div className="mt-5 border-t border-amber-200 pt-5">
                  <h3 className="mb-4 text-sm font-semibold text-slate-900">
                    અરજીમાં સુધારો કરો અને ફરી મોકલો
                  </h3>
                  <ApplicationForm
                    applicationId={application.id}
                    initialValues={correctionValues}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-amber-900">
                  સુધારા કરવા માટે અરજી સોંપાયેલા ક્લાર્કને સંપર્ક કરો.
                </p>
              )}
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  દસ્તાવેજ સૂચિ (Document checklist)
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  આ તબક્કામાં દસ્તાવેજ અપલોડ ઉપલબ્ધ નથી; અધિકારી ચકાસણી નોંધે.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                દસ્તાવેજો: {application.documents.length}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {requiredDocuments.map(({ type, label }) => {
                const documents = application.documents.filter(
                  (document) => document.type === type,
                );
                const verified = documents.some(
                  (document) => document.status === "VERIFIED",
                );
                return (
                  <li
                    className="flex flex-wrap items-start justify-between gap-2 py-3"
                    key={type}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {label}
                      </p>
                      {documents.length > 0 ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {documents
                            .map((document) => document.fileName)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        verified ? "text-emerald-800" : "text-amber-800"
                      }`}
                    >
                      {verified
                        ? "ચકાસાયેલ (Verified)"
                        : documents.length > 0
                          ? "સમીક્ષા બાકી (Review pending)"
                          : "હજુ નોંધાયેલ નથી (Not recorded)"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <AIReviewSection
            applicationId={application.id}
            available={isOpenAIConfigured()}
            canRequest={canRequestAI}
            preliminaryOnly={application.documents.length === 0}
            initialResult={
              analysisResult?.success ? analysisResult.data : undefined
            }
          />
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">
              વર્તમાન કાર્યપ્રવાહ (Current workflow)
            </h2>
            <dl className="mt-4 space-y-4">
              <Detail
                label="વર્તમાન તબક્કો (Stage)"
                value={stageLabels[application.currentStage]}
              />
              <Detail
                label="સોંપાયેલ અધિકારી (Assigned officer)"
                value={
                  application.assignedUser
                    ? `${application.assignedUser.name} · ${
                        roleShortLabels[application.assignedUser.role]
                      }`
                    : "સોંપાયેલ નથી"
                }
              />
            </dl>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <WorkflowControls
                applicationId={application.id}
                assignedUserId={application.assignedUserId}
                currentStage={application.currentStage}
                role={user.role}
                status={application.status}
                userId={user.id}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">
              અધિકારી નોંધો (Officer remarks)
            </h2>
            {application.workflowTasks.some((task) => task.remarks) ? (
              <ul className="mt-3 space-y-3">
                {application.workflowTasks
                  .filter((task) => task.remarks)
                  .map((task) => (
                    <li
                      className="rounded-lg bg-slate-50 p-3"
                      key={task.id}
                    >
                      <p className="text-xs font-medium text-slate-600">
                        {task.assignedTo
                          ? `${task.assignedTo.name} · ${
                              roleShortLabels[task.assignedTo.role]
                            }`
                          : "અધિકારી"}
                        {" · "}
                        {stageLabels[task.stage]}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                        {task.remarks}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {taskStatusLabels[task.status]}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                હજી કોઈ નોંધ નથી.
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">
          અરજી સમયરેખા (Application timeline)
        </h2>
        {application.auditLogs.length > 0 ? (
          <ol className="mt-4 space-y-4">
            {application.auditLogs.map((entry) => (
              <li className="flex gap-3" key={entry.id}>
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-700"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {entry.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.user.name} · {roleShortLabels[entry.user.role]} ·{" "}
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            આ અરજી માટે હજી સમયરેખા ઉપલબ્ધ નથી.
          </p>
        )}
      </section>
    </DashboardShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-6 text-slate-900">
        {value}
      </dd>
    </div>
  );
}
