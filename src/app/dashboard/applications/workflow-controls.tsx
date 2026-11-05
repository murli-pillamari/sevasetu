"use client";

import type {
  ApplicationStatus,
  UserRole,
  WorkflowStage,
} from "@prisma/client";
import { useActionState } from "react";
import {
  workflowAction,
  type WorkflowFormState,
} from "@/app/dashboard/applications/actions";

const roleForStage: Record<WorkflowStage, UserRole> = {
  DOCUMENT_SCRUTINY: "CLERK",
  FIELD_VERIFICATION: "TALATI",
  DEPUTY_REVIEW: "DEPUTY_MAMLATDAR",
  FINAL_DECISION: "MAMLATDAR",
};

const validStatusForStage: Record<WorkflowStage, readonly ApplicationStatus[]> = {
  DOCUMENT_SCRUTINY: [
    "SUBMITTED",
    "DOCUMENT_REVIEW",
  ],
  FIELD_VERIFICATION: ["FIELD_VERIFICATION"],
  DEPUTY_REVIEW: ["DEPUTY_REVIEW"],
  FINAL_DECISION: ["FINAL_REVIEW"],
};

export function WorkflowControls({
  applicationId,
  assignedUserId,
  currentStage,
  status,
  userId,
  role,
}: {
  applicationId: string;
  assignedUserId: string | null;
  currentStage: WorkflowStage;
  status: ApplicationStatus;
  userId: string;
  role: UserRole;
}) {
  const [state, formAction, isPending] = useActionState<
    WorkflowFormState,
    FormData
  >(workflowAction, undefined);
  const isAssigned = assignedUserId === userId;
  const canActAtStage =
    isAssigned &&
    role === roleForStage[currentStage] &&
    validStatusForStage[currentStage].includes(status);
  if (!canActAtStage) {
    return (
      <p className="text-sm leading-6 text-slate-600">
        આ અરજી તમને සોંપાયેલી ન હોવાથી અથવા તમારી ભૂમિકાનો તબક્કો ન હોવાથી અહીંથી
        કાર્યવાહી ઉપલબ્ધ નથી.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input name="applicationId" type="hidden" value={applicationId} />
      <label
        className="block text-sm font-medium text-slate-800"
        htmlFor="workflow-remarks"
      >
        નોંધ / કારણ (Remarks or reason)
      </label>
      <textarea
        className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        id="workflow-remarks"
        maxLength={1000}
        name="remarks"
        placeholder="જરૂર હોય તો નોંધ અથવા પરત / નામંજૂરીનું કારણ લખો"
      />
      {state?.error ? (
        <p aria-live="polite" className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p aria-live="polite" className="text-sm text-emerald-800" role="status">
          {state.success}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canActAtStage ? (
          <>
            <ActionButton
              disabled={isPending}
              intent="remark"
              label="નોંધ સાચવો (Save remarks)"
              secondary
            />
            {currentStage === "FINAL_DECISION" ? (
              <>
                <ActionButton
                  disabled={isPending}
                  intent="approve"
                  label="મંજૂર કરો (Approve)"
                />
                <ActionButton
                  disabled={isPending}
                  intent="reject"
                  label="નામંજૂર કરો (Reject)"
                  danger
                />
              </>
            ) : (
              <ActionButton
                disabled={isPending}
                intent="forward"
                label="આગળ મોકલો (Forward)"
              />
            )}
            <ActionButton
              disabled={isPending}
              intent="return"
              label="સુધારા માટે પરત કરો (Return)"
              secondary
            />
          </>
        ) : null}
      </div>
      {isPending ? (
        <p aria-live="polite" className="text-sm text-slate-600" role="status">
          કાર્યવાહી સાચવી રહ્યા છીએ…
        </p>
      ) : null}
    </form>
  );
}

function ActionButton({
  intent,
  label,
  disabled,
  secondary = false,
  danger = false,
}: {
  intent: string;
  label: string;
  disabled: boolean;
  secondary?: boolean;
  danger?: boolean;
}) {
  const color = danger
    ? "bg-red-700 text-white hover:bg-red-800"
    : secondary
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : "bg-teal-800 text-white hover:bg-teal-900";
  return (
    <button
      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${color}`}
      disabled={disabled}
      name="intent"
      type="submit"
      value={intent}
    >
      {label}
    </button>
  );
}
