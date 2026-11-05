"use client";

import { useActionState } from "react";
import {
  correctAndResubmitApplicationAction,
  createApplicationAction,
  type ApplicationFormState,
} from "@/app/dashboard/applications/actions";
import type { ApplicationInput } from "@/lib/applications/validation";

const fields: Array<{
  name: keyof ApplicationInput;
  label: string;
  type: string;
  required: boolean;
  inputMode?: "numeric" | "decimal" | "text";
}> = [
  {
    name: "applicantName",
    label: "અરજદારનું નામ (Applicant name)",
    type: "text",
    required: true,
  },
  {
    name: "applicantNameGu",
    label: "અરજદારનું નામ ગુજરાતીમાં (Gujarati name)",
    type: "text",
    required: false,
  },
  {
    name: "phone",
    label: "મોબાઇલ નંબર (Mobile number)",
    type: "tel",
    required: true,
    inputMode: "numeric",
  },
  {
    name: "district",
    label: "જિલ્લો (District)",
    type: "text",
    required: true,
  },
  {
    name: "taluka",
    label: "તાલુકો (Taluka)",
    type: "text",
    required: true,
  },
  {
    name: "familyMembers",
    label: "કુટુંબના સભ્યો (Family members)",
    type: "number",
    required: true,
    inputMode: "numeric",
  },
  {
    name: "annualIncome",
    label: "વાર્ષિક કુટુંબ આવક રૂપિયા (Annual family income, INR)",
    type: "number",
    required: true,
    inputMode: "decimal",
  },
];

export function ApplicationForm({
  applicationId,
  initialValues,
}: {
  applicationId?: string;
  initialValues?: ApplicationInput;
}) {
  const isCorrection = Boolean(applicationId && initialValues);
  const [state, formAction, isPending] = useActionState<
    ApplicationFormState,
    FormData
  >(
    isCorrection ? correctAndResubmitApplicationAction : createApplicationAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      {applicationId ? (
        <input name="applicationId" type="hidden" value={applicationId} />
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              className="mb-2 block text-sm font-medium text-slate-800"
              htmlFor={field.name}
            >
              {field.label}
              {field.required ? <span aria-hidden="true"> *</span> : null}
            </label>
            <input
              aria-describedby={
                state?.errors?.[field.name] ? `${field.name}-error` : undefined
              }
              aria-invalid={Boolean(state?.errors?.[field.name])}
              autoComplete={
                field.name === "phone"
                  ? "tel"
                  : field.name === "applicantName"
                    ? "name"
                    : "off"
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              id={field.name}
              inputMode={field.inputMode}
              max={field.name === "familyMembers" ? 50 : undefined}
              min={
                field.name === "familyMembers" || field.name === "annualIncome"
                  ? 1
                  : undefined
              }
              name={field.name}
              required={field.required}
              defaultValue={initialValues?.[field.name]}
              step={field.name === "annualIncome" ? "0.01" : undefined}
              type={field.type}
            />
            {state?.errors?.[field.name] ? (
              <p
                className="mt-1 text-sm text-red-700"
                id={`${field.name}-error`}
              >
                {state.errors[field.name]}
              </p>
            ) : null}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="address"
          >
            સરનામું (Address) *
          </label>
          <textarea
            aria-describedby={state?.errors?.address ? "address-error" : undefined}
            aria-invalid={Boolean(state?.errors?.address)}
            className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            id="address"
            maxLength={500}
            name="address"
            defaultValue={initialValues?.address}
            required
          />
          {state?.errors?.address ? (
            <p className="mt-1 text-sm text-red-700" id="address-error">
              {state.errors.address}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="incomePurpose"
          >
            પ્રમાણપત્રનો હેતુ (Purpose of certificate) *
          </label>
          <textarea
            aria-describedby={
              state?.errors?.incomePurpose
                ? "incomePurpose-error"
                : undefined
            }
            aria-invalid={Boolean(state?.errors?.incomePurpose)}
            className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            id="incomePurpose"
            maxLength={500}
            name="incomePurpose"
            defaultValue={initialValues?.incomePurpose}
            required
          />
          {state?.errors?.incomePurpose ? (
            <p
              className="mt-1 text-sm text-red-700"
              id="incomePurpose-error"
            >
              {state.errors.incomePurpose}
            </p>
          ) : null}
        </div>
      </div>

      {isCorrection ? (
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-800"
            htmlFor="correctionRemarks"
          >
            સુધારાની નોંધ (Correction remarks) *
          </label>
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            id="correctionRemarks"
            maxLength={1000}
            minLength={3}
            name="correctionRemarks"
            required
          />
        </div>
      ) : null}

      {state?.message ? (
        <p aria-live="polite" className="text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        className="rounded-lg bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? isCorrection
            ? "સુધારા સાચવી ફરી મોકલી રહ્યા છીએ…"
            : "અરજી સાચવી રહ્યા છીએ…"
          : isCorrection
            ? "સુધારા સાચવી ફરી મોકલો"
            : "અરજી નોંધો (Create application)"}
      </button>
    </form>
  );
}
