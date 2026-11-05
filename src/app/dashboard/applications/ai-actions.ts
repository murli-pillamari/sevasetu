"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { analyzeDocuments } from "@/lib/applications/ai-review";
import { ApplicationActionError } from "@/lib/applications/mutations";

export async function analyzeDocumentsAction(
  _previousState: Awaited<ReturnType<typeof analyzeDocuments>>,
  formData: FormData,
) {
  const applicationId = formData.get("applicationId");
  if (typeof applicationId !== "string" || applicationId.length === 0) {
    return { error: "અરજીની ઓળખ માન્ય નથી." };
  }

  const actor = await requireAuthenticatedUser();

  try {
    const result = await analyzeDocuments(applicationId, actor);
    revalidatePath(`/dashboard/applications/${applicationId}`);
    return result;
  } catch (error) {
    if (error instanceof ApplicationActionError) {
      return { error: error.message };
    }
    console.error("Document review analysis failed:", error);
    return {
      error:
        "AI સમીક્ષા પૂર્ણ થઈ શકી નથી. અધિકારી તરીકે દસ્તાવેજો જાતે ચકાસો.",
    };
  }
}
