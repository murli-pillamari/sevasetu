import { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  CLERK: "ક્લાર્ક (Clerk)",
  TALATI: "તલાટી (Talati)",
  DEPUTY_MAMLATDAR: "નાયબ મામલતદાર (Deputy Mamlatdar)",
  MAMLATDAR: "મામલતદાર (Mamlatdar)",
  ADMIN: "વહીવટકર્તા (Administrator)",
};

export const dashboardSections: Record<
  UserRole,
  Array<{ id: string; label: string; description: string }>
> = {
  CLERK: [
    {
      id: "applications",
      label: "અરજીઓ (Applications)",
      description: "અરજીઓની યાદી અને પ્રાથમિક સમીક્ષા અહીં ઉપલબ્ધ થશે.",
    },
    {
      id: "documents",
      label: "દસ્તાવેજ ચકાસણી (Document review)",
      description: "અરજીના દસ્તાવેજોની ચકાસણી અહીં ઉપલબ્ધ થશે.",
    },
  ],
  TALATI: [
    {
      id: "field-verification",
      label: "ક્ષેત્ર ચકાસણી (Field verification)",
      description: "સોંપાયેલ ક્ષેત્ર ચકાસણીની વિગતો અહીં ઉપલબ્ધ થશે.",
    },
    {
      id: "tasks",
      label: "કાર્યસૂચિ (Assigned tasks)",
      description: "તમને સોંપાયેલાં કાર્યો અહીં ઉપલબ્ધ થશે.",
    },
  ],
  DEPUTY_MAMLATDAR: [
    {
      id: "review",
      label: "સમીક્ષા (Deputy review)",
      description: "ચકાસણી માટે મોકલાયેલી અરજીઓ અહીં ઉપલબ્ધ થશે.",
    },
    {
      id: "tasks",
      label: "કાર્યસૂચિ (Assigned tasks)",
      description: "તમને સોંપાયેલાં કાર્યો અહીં ઉપલબ્ધ થશે.",
    },
  ],
  MAMLATDAR: [
    {
      id: "final-review",
      label: "અંતિમ સમીક્ષા (Final review)",
      description: "અંતિમ નિર્ણય માટેની અરજીઓ અહીં ઉપલબ્ધ થશે.",
    },
    {
      id: "decisions",
      label: "નિર્ણયો (Decisions)",
      description: "અધિકૃત નિર્ણયોનો સારાંશ અહીં ઉપલબ્ધ થશે.",
    },
  ],
  ADMIN: [
    {
      id: "users",
      label: "કર્મચારી વ્યવસ્થાપન (Staff)",
      description: "કર્મચારી વ્યવસ્થાપન સુવિધાઓ અહીં ઉપલબ્ધ થશે.",
    },
    {
      id: "offices",
      label: "કચેરીઓ (Offices)",
      description: "કચેરી વ્યવસ્થાપન સુવિધાઓ અહીં ઉપલબ્ધ થશે.",
    },
  ],
};

export const roleDashboardDescriptions: Record<UserRole, string> = {
  CLERK: "અરજીઓ અને દસ્તાવેજોની પ્રાથમિક સમીક્ષા માટેનું કાર્યસ્થળ.",
  TALATI: "સોંપાયેલ ક્ષેત્ર ચકાસણી કાર્યો માટેનું કાર્યસ્થળ.",
  DEPUTY_MAMLATDAR: "ક્ષેત્ર ચકાસણી અહેવાલોની સમીક્ષા માટેનું કાર્યસ્થળ.",
  MAMLATDAR: "અરજીઓની અંતિમ સમીક્ષા માટેનું કાર્યસ્થળ.",
  ADMIN: "સિસ્ટમ અને કર્મચારી વ્યવસ્થાપન માટેનું કાર્યસ્થળ.",
};
