import {
  ApplicationStatus,
  UserRole,
  WorkflowStage,
  WorkflowTaskStatus,
} from "@prisma/client";

export const statusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: "સબમિટ થયેલ (Submitted)",
  DOCUMENT_REVIEW: "દસ્તાવેજ સમીક્ષા (Document review)",
  FIELD_VERIFICATION: "ક્ષેત્ર ચકાસણી (Field verification)",
  DEPUTY_REVIEW: "નાયબ સમીક્ષા (Deputy review)",
  FINAL_REVIEW: "અંતિમ સમીક્ષા (Final review)",
  RETURNED: "સુધારા માટે પરત (Returned)",
  APPROVED: "મંજૂર (Approved)",
  REJECTED: "નામંજૂર (Rejected)",
};

export const statusStyles: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-sky-50 text-sky-800 ring-sky-700/15",
  DOCUMENT_REVIEW: "bg-indigo-50 text-indigo-800 ring-indigo-700/15",
  FIELD_VERIFICATION: "bg-amber-50 text-amber-800 ring-amber-700/15",
  DEPUTY_REVIEW: "bg-violet-50 text-violet-800 ring-violet-700/15",
  FINAL_REVIEW: "bg-teal-50 text-teal-800 ring-teal-700/15",
  RETURNED: "bg-orange-50 text-orange-800 ring-orange-700/15",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-700/15",
  REJECTED: "bg-red-50 text-red-800 ring-red-700/15",
};

export const stageLabels: Record<WorkflowStage, string> = {
  DOCUMENT_SCRUTINY: "દસ્તાવેજ ચકાસણી (Document scrutiny)",
  FIELD_VERIFICATION: "ક્ષેત્ર ચકાસણી (Field verification)",
  DEPUTY_REVIEW: "નાયબ મામલતદાર સમીક્ષા (Deputy review)",
  FINAL_DECISION: "અંતિમ નિર્ણય (Final decision)",
};

export const taskStatusLabels: Record<WorkflowTaskStatus, string> = {
  PENDING: "બાકી (Pending)",
  IN_PROGRESS: "ચાલુ (In progress)",
  COMPLETED: "પૂર્ણ (Completed)",
  RETURNED: "પરત (Returned)",
};

export const roleShortLabels: Record<UserRole, string> = {
  CLERK: "ક્લાર્ક",
  TALATI: "તલાટી",
  DEPUTY_MAMLATDAR: "નાયબ મામલતદાર",
  MAMLATDAR: "મામલતદાર",
  ADMIN: "વહીવટકર્તા",
};

export const requiredDocuments = [
  { type: "IDENTITY_PROOF", label: "ઓળખનો પુરાવો (Identity proof)" },
  { type: "RESIDENCE_PROOF", label: "રહેઠાણનો પુરાવો (Residence proof)" },
  { type: "INCOME_PROOF", label: "આવકનો પુરાવો (Income proof)" },
  { type: "FAMILY_DETAILS", label: "કુટુંબની વિગતો (Family details)" },
] as const;

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("gu-IN", {
    dateStyle: "medium",
  }).format(date);
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat("gu-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
