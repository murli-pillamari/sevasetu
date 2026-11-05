"use client";

import { useActionState } from "react";
import {
  analyzeDocumentsAction,
} from "@/app/dashboard/applications/ai-actions";
import type {
  DocumentReview,
  DocumentReviewState,
} from "@/lib/applications/ai-review";

export function AIReviewSection({
  applicationId,
  available,
  canRequest,
  initialResult,
  preliminaryOnly,
}: {
  applicationId: string;
  available: boolean;
  canRequest: boolean;
  initialResult?: DocumentReview;
  preliminaryOnly: boolean;
}) {
  const initialState: DocumentReviewState = initialResult
    ? {
        result: initialResult,
        message:
          "અગાઉના AI સૂચનો ફક્ત અધિકારીની સમીક્ષા માટે છે; કોઈ નિર્ણય આપમેળે લેવાતો નથી.",
      }
    : undefined;
  const [state, formAction, isPending] = useActionState(
    analyzeDocumentsAction,
    initialState,
  );
  const result = state?.result ?? initialResult;

  return (
    <section
      aria-labelledby="ai-review-heading"
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900" id="ai-review-heading">
            AI દસ્તાવેજ સહાય (AI document assistance)
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            AI માત્ર સંભવિત ખામીઓ અને સ્પષ્ટતા માટેના પ્રશ્નો સૂચવે છે. તે
            પાત્રતા નક્કી કરતું નથી અને કોઈ નિર્ણય લેતું નથી.
          </p>
        </div>
        {canRequest ? (
          <form action={formAction}>
            <input name="applicationId" type="hidden" value={applicationId} />
            <button
              className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "AI તપાસ ચાલુ છે…" : "AI દ્વારા તપાસો"}
            </button>
          </form>
        ) : null}
      </div>

      {!available && !state?.unavailable ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          AI સેવા ગોઠવેલી નથી. તપાસ બટનથી સ્થાનિક ચેકલિસ્ટ અને મેટાડેટા આધારિત
          હાથથી સમીક્ષા સૂચનો મળશે; AI વગર પણ અધિકારી કાર્યપ્રવાહ ચાલુ રાખી શકે છે.
        </div>
      ) : null}

      {canRequest && preliminaryOnly ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          કોઈ દસ્તાવેજ અપલોડ નથી. તપાસ ફક્ત પ્રાથમિક ચેકલિસ્ટ સમીક્ષા અને સામાન્ય
          મેટાડેટા સૂચનો સુધી મર્યાદિત રહેશે; દસ્તાવેજ સામગ્રીનું વિશ્લેષણ શક્ય નથી.
        </p>
      ) : null}

      {state?.unavailable ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-950"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {state?.error ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.message && result && !state.unavailable ? (
        <p
          aria-live="polite"
          className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {result ? (
        <ReviewLists review={result} manualFallback={state?.unavailable === true} />
      ) : null}
    </section>
  );
}

function ReviewLists({
  review,
  manualFallback = false,
}: {
  review: DocumentReview;
  manualFallback?: boolean;
}) {
  const lists = [
    {
      label: "સંભવિત ખૂટતા દસ્તાવેજો",
      items: review.missingDocuments,
    },
    { label: "વિસંગતતાઓ", items: review.inconsistencies },
    { label: "માનવીય સમીક્ષા જરૂરી", items: review.potentialIssues },
    {
      label: "સ્પષ્ટતા માટે સૂચિત પ્રશ્નો",
      items: review.clarificationQuestions,
    },
    {
      label: "અધિકારી માટે સૂચિત પગલાં",
      items: review.suggestedOfficerActions,
    },
  ];

  return (
    <div className="mt-4">
      {manualFallback ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
          હાથથી ચેકલિસ્ટ આધારિત સમીક્ષા — AI દ્વારા બનાવેલા તારણો નથી
        </p>
      ) : null}
      <p className="mb-3 text-xs font-medium text-slate-500">
        સમીક્ષા વ્યાપ:{" "}
        {review.reviewScope === "PRELIMINARY_CHECKLIST"
          ? "પ્રાથમિક ચેકલિસ્ટ (દસ્તાવેજો ઉપલબ્ધ નથી)"
          : "દસ્તાવેજ મેટાડેટા בלבד"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {lists.map(({ label, items }) => (
          <div className="rounded-lg border border-slate-200 p-4" key={label}>
            <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
            {items.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {items.map((item, index) => (
                  <li key={`${label}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                કોઈ સૂચન નથી; અધિકારીએ સ્વતંત્ર ચકાસણી કરવી.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
