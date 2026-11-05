"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { requireAuthenticatedUser, requireRole } from "@/lib/auth/authorization";
import {
  ApplicationActionError,
  createApplication,
  correctAndResubmitApplication,
  performWorkflowAction,
} from "@/lib/applications/mutations";
import {
  applicationInputSchema,
  workflowInputSchema,
  type ApplicationInput,
} from "@/lib/applications/validation";

export type ApplicationFormState =
  | {
      errors?: Partial<Record<keyof ApplicationInput, string>>;
      message?: string;
    }
  | undefined;

export type WorkflowFormState =
  | {
      error?: string;
      success?: string;
    }
  | undefined;

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createApplicationAction(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const actor = await requireRole([UserRole.CLERK]);
  const parsed = applicationInputSchema.safeParse({
    applicantName: formString(formData, "applicantName"),
    applicantNameGu: formString(formData, "applicantNameGu"),
    phone: formString(formData, "phone"),
    address: formString(formData, "address"),
    district: formString(formData, "district"),
    taluka: formString(formData, "taluka"),
    annualIncome: formString(formData, "annualIncome"),
    familyMembers: formString(formData, "familyMembers"),
    incomePurpose: formString(formData, "incomePurpose"),
  });

  if (!parsed.success) {
    const errors: Partial<Record<keyof ApplicationInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in errors === false) {
        errors[field as keyof ApplicationInput] =
          field === "phone"
            ? "10 અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો."
            : "આ માહિતી તપાસો.";
      }
    }
    return { errors, message: "કૃપા કરીને જરૂરી વિગતો તપાસો." };
  }

  let application: Awaited<ReturnType<typeof createApplication>>;
  try {
    application = await createApplication(parsed.data, actor);
  } catch (error) {
    if (error instanceof ApplicationActionError) {
      return { message: error.message };
    }
    console.error("Application creation failed:", error);
    return {
      message: "અરજી બનાવી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  redirect(`/dashboard/applications/${application.id}`);
}

export async function correctAndResubmitApplicationAction(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const actor = await requireRole([UserRole.CLERK]);
  const parsed = applicationInputSchema.safeParse({
    applicantName: formString(formData, "applicantName"),
    applicantNameGu: formString(formData, "applicantNameGu"),
    phone: formString(formData, "phone"),
    address: formString(formData, "address"),
    district: formString(formData, "district"),
    taluka: formString(formData, "taluka"),
    annualIncome: formString(formData, "annualIncome"),
    familyMembers: formString(formData, "familyMembers"),
    incomePurpose: formString(formData, "incomePurpose"),
  });

  if (!parsed.success) {
    const errors: Partial<Record<keyof ApplicationInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && field in errors === false) {
        errors[field as keyof ApplicationInput] =
          field === "phone"
            ? "10 અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો."
            : "આ માહિતી તપાસો.";
      }
    }
    return { errors, message: "કૃપા કરીને જરૂરી વિગતો તપાસો." };
  }

  const applicationId = formString(formData, "applicationId");
  if (!applicationId) {
    return { message: "અરજી ઓળખી શકાઈ નથી. ફરીથી ખોલીને પ્રયાસ કરો." };
  }

  try {
    await correctAndResubmitApplication(
      applicationId,
      parsed.data,
      formString(formData, "correctionRemarks"),
      actor,
    );
  } catch (error) {
    if (error instanceof ApplicationActionError) {
      return { message: error.message };
    }
    console.error("Application correction and resubmission failed:", error);
    return {
      message: "સુધારા સાચવી ફરી મોકલી શકાઈ નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath(`/dashboard/applications/${applicationId}`);
  redirect(`/dashboard/applications/${applicationId}`);
}

export async function workflowAction(
  _previousState: WorkflowFormState,
  formData: FormData,
): Promise<WorkflowFormState> {
  const actor = await requireAuthenticatedUser();
  const parsed = workflowInputSchema.safeParse({
    applicationId: formString(formData, "applicationId"),
    intent: formString(formData, "intent"),
    remarks: formString(formData, "remarks"),
  });

  if (!parsed.success) {
    return { error: "કાર્યવાહીની વિગતો માન્ય નથી." };
  }

  try {
    await performWorkflowAction(
      parsed.data.applicationId,
      parsed.data.intent,
      parsed.data.remarks,
      actor,
    );
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    revalidatePath(`/dashboard/applications/${parsed.data.applicationId}`);
    return { success: "કાર્યવાહી સફળતાપૂર્વક સાચવાઈ." };
  } catch (error) {
    if (error instanceof ApplicationActionError) {
      return { error: error.message };
    }
    console.error("Application workflow action failed:", error);
    return { error: "કાર્યવાહી પૂર્ણ થઈ શકી નથી. ફરી પ્રયાસ કરો." };
  }
}
