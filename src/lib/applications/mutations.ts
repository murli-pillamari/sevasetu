import {
  ApplicationStatus,
  Prisma,
  UserRole,
  WorkflowStage,
  WorkflowTaskStatus,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { applicationInputSchema } from "@/lib/applications/validation";
import { prisma } from "@/lib/prisma";

const stageConfiguration: Record<
  WorkflowStage,
  {
    role: UserRole;
    statuses: readonly ApplicationStatus[];
    nextStage?: WorkflowStage;
    nextStatus?: ApplicationStatus;
  }
> = {
  DOCUMENT_SCRUTINY: {
    role: UserRole.CLERK,
    statuses: [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.DOCUMENT_REVIEW,
    ],
    nextStage: WorkflowStage.FIELD_VERIFICATION,
    nextStatus: ApplicationStatus.FIELD_VERIFICATION,
  },
  FIELD_VERIFICATION: {
    role: UserRole.TALATI,
    statuses: [ApplicationStatus.FIELD_VERIFICATION],
    nextStage: WorkflowStage.DEPUTY_REVIEW,
    nextStatus: ApplicationStatus.DEPUTY_REVIEW,
  },
  DEPUTY_REVIEW: {
    role: UserRole.DEPUTY_MAMLATDAR,
    statuses: [ApplicationStatus.DEPUTY_REVIEW],
    nextStage: WorkflowStage.FINAL_DECISION,
    nextStatus: ApplicationStatus.FINAL_REVIEW,
  },
  FINAL_DECISION: {
    role: UserRole.MAMLATDAR,
    statuses: [ApplicationStatus.FINAL_REVIEW],
  },
};

const roleForStage: Record<WorkflowStage, UserRole> = {
  DOCUMENT_SCRUTINY: UserRole.CLERK,
  FIELD_VERIFICATION: UserRole.TALATI,
  DEPUTY_REVIEW: UserRole.DEPUTY_MAMLATDAR,
  FINAL_DECISION: UserRole.MAMLATDAR,
};

const expectedStatusForStage: Record<WorkflowStage, ApplicationStatus> = {
  DOCUMENT_SCRUTINY: ApplicationStatus.DOCUMENT_REVIEW,
  FIELD_VERIFICATION: ApplicationStatus.FIELD_VERIFICATION,
  DEPUTY_REVIEW: ApplicationStatus.DEPUTY_REVIEW,
  FINAL_DECISION: ApplicationStatus.FINAL_REVIEW,
};

type Actor = {
  id: string;
  name: string;
  role: UserRole;
};

type WorkflowIntent =
  | "forward"
  | "return"
  | "approve"
  | "reject"
  | "remark";

export class ApplicationActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationActionError";
  }
}

export async function createApplication(
  input: unknown,
  actor: Actor,
): Promise<{ id: string; applicationNo: string }> {
  if (actor.role !== UserRole.CLERK) {
    throw new ApplicationActionError(
      "ફક્ત ક્લાર્ક નવી અરજી બનાવી શકે છે.",
    );
  }

  const parsed = applicationInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApplicationActionError(
      "અરજીની વિગતો તપાસો અને બધી જરૂરી માહિતી ભરો.",
    );
  }

  const data = parsed.data;
  const applicationNo = `GJ-${new Date().getFullYear()}-${randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;

  return prisma.$transaction(async (transaction) => {
    const application = await transaction.application.create({
      data: {
        applicationNo,
        applicantName: data.applicantName,
        applicantNameGu: data.applicantNameGu || null,
        phone: data.phone,
        address: data.address,
        district: data.district,
        taluka: data.taluka,
        annualIncome: new Prisma.Decimal(data.annualIncome),
        familyMembers: data.familyMembers,
        incomePurpose: data.incomePurpose,
        status: ApplicationStatus.SUBMITTED,
        currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
        assignedUserId: actor.id,
      },
    });

    await transaction.workflowTask.create({
      data: {
        applicationId: application.id,
        assignedToId: actor.id,
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    await transaction.auditLog.create({
      data: {
        applicationId: application.id,
        userId: actor.id,
        action: "APPLICATION_CREATED",
        description: "નવી આવક પ્રમાણપત્ર અરજી દાખલ કરી.",
        metadata: {
          applicationNo,
          stage: WorkflowStage.DOCUMENT_SCRUTINY,
        },
      },
    });

    return { id: application.id, applicationNo };
  });
}

export async function correctAndResubmitApplication(
  applicationId: string,
  input: unknown,
  remarks: string,
  actor: Actor,
): Promise<void> {
  if (actor.role !== UserRole.CLERK) {
    throw new ApplicationActionError(
      "ફક્ત ક્લાર્ક પરત કરેલી અરજીમાં સુધારો કરી શકે છે.",
    );
  }

  const parsed = applicationInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApplicationActionError(
      "અરજીની વિગતો તપાસો અને બધી જરૂરી માહિતી ભરો.",
    );
  }

  const correctionRemarks = remarks.trim();
  if (correctionRemarks.length < 3 || correctionRemarks.length > 1000) {
    throw new ApplicationActionError(
      "સુધારાની નોંધમાં ઓછામાં ઓછા 3 અક્ષર લખો.",
    );
  }

  await prisma.$transaction(async (transaction) => {
    const application = await transaction.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNo: true,
        status: true,
        currentStage: true,
        assignedUserId: true,
      },
    });

    if (
      !application ||
      application.status !== ApplicationStatus.RETURNED ||
      application.assignedUserId !== actor.id
    ) {
      throw new ApplicationActionError(
        "આ પરત કરેલી અરજીમાં સુધારો કરવાની પરવાનગી નથી.",
      );
    }

    const stageRole = roleForStage[application.currentStage];
    const nextAssignedUserId =
      stageRole === UserRole.CLERK
        ? actor.id
        : await findActiveOfficer(transaction, stageRole);
    const restoredStatus = expectedStatusForStage[application.currentStage];
    const data = parsed.data;
    const updated = await transaction.application.updateMany({
      where: {
        id: application.id,
        status: ApplicationStatus.RETURNED,
        currentStage: application.currentStage,
        assignedUserId: actor.id,
      },
      data: {
        applicantName: data.applicantName,
        applicantNameGu: data.applicantNameGu || null,
        phone: data.phone,
        address: data.address,
        district: data.district,
        taluka: data.taluka,
        annualIncome: new Prisma.Decimal(data.annualIncome),
        familyMembers: data.familyMembers,
        incomePurpose: data.incomePurpose,
        status: restoredStatus,
        assignedUserId: nextAssignedUserId,
        completedAt: null,
      },
    });

    if (updated.count !== 1) {
      throw new ApplicationActionError(
        "અરજી બદલાઈ ગઈ છે. ફરીથી ખોલીને પ્રયાસ કરો.",
      );
    }

    const now = new Date();
    await transaction.workflowTask.create({
      data: {
        applicationId: application.id,
        assignedToId: nextAssignedUserId,
        stage: application.currentStage,
        status: WorkflowTaskStatus.IN_PROGRESS,
        remarks: correctionRemarks,
        startedAt: now,
      },
    });

    await transaction.auditLog.createMany({
      data: [
        {
          applicationId: application.id,
          userId: actor.id,
          action: "APPLICATION_CORRECTED",
          description: "ક્લાર્કે પરત કરેલી અરજીની વિગતો સુધારી.",
          metadata: {
            applicationNo: application.applicationNo,
            stage: application.currentStage,
            remarks: correctionRemarks,
          },
          createdAt: now,
        },
        {
          applicationId: application.id,
          userId: actor.id,
          action: "APPLICATION_RESUBMITTED",
          description: "સુધારા પછી અરજી ફરી સમીક્ષા માટે મોકલી.",
          metadata: {
            previousStatus: ApplicationStatus.RETURNED,
            status: restoredStatus,
            stage: application.currentStage,
            assignedUserId: nextAssignedUserId,
            remarks: correctionRemarks,
          },
          createdAt: now,
        },
      ],
    });
  });
}

async function findActiveOfficer(
  transaction: Prisma.TransactionClient,
  role: UserRole,
) {
  const officer = await transaction.user.findFirst({
    where: { role, active: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  if (!officer) {
    throw new ApplicationActionError(
      "આગળના તબક્કા માટે કોઈ સક્રિય અધિકારી ઉપલબ્ધ નથી.",
    );
  }

  return officer.id;
}

async function findAssignedClerk(
  transaction: Prisma.TransactionClient,
  applicationId: string,
) {
  const task = await transaction.workflowTask.findFirst({
    where: {
      applicationId,
      stage: WorkflowStage.DOCUMENT_SCRUTINY,
      assignedTo: {
        is: { role: UserRole.CLERK, active: true },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { assignedToId: true },
  });

  if (!task?.assignedToId) {
    throw new ApplicationActionError(
      "અરજી પરત કરવા માટે સક્રિય સોંપાયેલ ક્લાર્ક મળ્યો નથી.",
    );
  }

  return task.assignedToId;
}

async function getActionableApplication(
  transaction: Prisma.TransactionClient,
  applicationId: string,
  actor: Actor,
) {
  const application = await transaction.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      applicationNo: true,
      status: true,
      currentStage: true,
      assignedUserId: true,
    },
  });

  if (!application) {
    throw new ApplicationActionError("અરજી મળી નથી.");
  }

  if (application.assignedUserId !== actor.id) {
    throw new ApplicationActionError(
      "આ અરજી તમને સોંપવામાં આવી નથી.",
    );
  }

  return application;
}

async function findOpenTask(
  transaction: Prisma.TransactionClient,
  applicationId: string,
  stage: WorkflowStage,
  actorId: string,
) {
  const task = await transaction.workflowTask.findFirst({
    where: {
      applicationId,
      stage,
      status: {
        in: [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.IN_PROGRESS],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!task) {
    throw new ApplicationActionError(
      "આ તબક્કા માટે ચાલુ કાર્ય મળ્યું નથી.",
    );
  }

  if (task.assignedToId !== actorId) {
    throw new ApplicationActionError(
      "આ તબક્કાનું કાર્ય તમને સોંપાયેલું નથી.",
    );
  }

  return task;
}

export async function performWorkflowAction(
  applicationId: string,
  intent: WorkflowIntent,
  remarks: string,
  actor: Actor,
): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const application = await getActionableApplication(
      transaction,
      applicationId,
      actor,
    );

    const stage = application.currentStage;
    const configuration = stageConfiguration[stage];

    if (actor.role !== configuration.role) {
      throw new ApplicationActionError(
        "તમારી ભૂમિકા આ તબક્કે કાર્યવાહી કરવાની પરવાનગી આપતી નથી.",
      );
    }

    if (!configuration.statuses.includes(application.status)) {
      throw new ApplicationActionError(
        "અરજીની હાલની સ્થિતિ આ કાર્યવાહી માટે માન્ય નથી.",
      );
    }

    if (
      (intent === "return" || intent === "reject" || intent === "remark") &&
      remarks.length < 3
    ) {
      throw new ApplicationActionError(
        "નોંધ ઉમેરવા, પરત કરવા અથવા નામંજૂર કરવા માટે કારણ લખવું જરૂરી છે.",
      );
    }

    if (intent === "forward" && !configuration.nextStage) {
      throw new ApplicationActionError(
        "અંતિમ સમીક્ષા પછી અરજી આગળ મોકલી શકાતી નથી.",
      );
    }

    if (
      (intent === "approve" || intent === "reject") &&
      stage !== WorkflowStage.FINAL_DECISION
    ) {
      throw new ApplicationActionError(
        "મંજૂરી અથવા નામંજૂરીનો નિર્ણય ફક્ત મામલતદાર લઈ શકે છે.",
      );
    }

    const currentTask = await findOpenTask(
      transaction,
      application.id,
      stage,
      actor.id,
    );
    const now = new Date();
    let nextStatus = application.status;
    let nextStage = stage;
    let nextAssignedUserId = actor.id;
    let taskStatus: WorkflowTaskStatus = WorkflowTaskStatus.COMPLETED;
    let action = "WORKFLOW_REMARK_ADDED";
    let description = "કાર્યપ્રવાહમાં અધિકારીની નોંધ ઉમેરાઈ.";
    let completedAt: Date | null = null;
    let nextTask: { stage: WorkflowStage; assignedToId: string } | null = null;

    if (intent === "forward" && configuration.nextStage && configuration.nextStatus) {
      nextStage = configuration.nextStage;
      nextStatus = configuration.nextStatus;
      nextAssignedUserId = await findActiveOfficer(
        transaction,
        roleForStage[nextStage],
      );
      nextTask = { stage: nextStage, assignedToId: nextAssignedUserId };
      action = "APPLICATION_FORWARDED";
      description = "અરજી આગળના કાર્યપ્રવાહ તબક્કે મોકલી.";
    } else if (intent === "return") {
      nextStatus = ApplicationStatus.RETURNED;
      nextAssignedUserId = await findAssignedClerk(
        transaction,
        application.id,
      );
      taskStatus = WorkflowTaskStatus.RETURNED;
      action = "APPLICATION_RETURNED";
      description = "સુધારા માટે અરજી પરત મોકલી.";
    } else if (intent === "approve" || intent === "reject") {
      nextStatus =
        intent === "approve"
          ? ApplicationStatus.APPROVED
          : ApplicationStatus.REJECTED;
      completedAt = now;
      action =
        intent === "approve" ? "APPLICATION_APPROVED" : "APPLICATION_REJECTED";
      description =
        intent === "approve"
          ? "અધિકૃત અધિકારીએ અરજી મંજૂર કરી."
          : "અધિકૃત અધિકારીએ અરજી નામંજૂર કરી.";
    } else if (intent === "remark") {
      taskStatus = currentTask.status;
    }

    await transaction.workflowTask.update({
      where: { id: currentTask.id },
      data: {
        remarks: remarks || currentTask.remarks,
        status: taskStatus,
        completedAt: taskStatus === WorkflowTaskStatus.COMPLETED ||
          taskStatus === WorkflowTaskStatus.RETURNED
          ? now
          : null,
      },
    });

    const updated = await transaction.application.updateMany({
      where: {
        id: application.id,
        status: application.status,
        currentStage: stage,
        assignedUserId: actor.id,
      },
      data: {
        status: nextStatus,
        currentStage: nextStage,
        assignedUserId: nextAssignedUserId,
        completedAt,
      },
    });

    if (updated.count !== 1) {
      throw new ApplicationActionError(
        "અરજી બદલાઈ ગઈ છે. ફરીથી ખોલીને પ્રયાસ કરો.",
      );
    }

    if (nextTask) {
      await transaction.workflowTask.create({
        data: {
          applicationId: application.id,
          assignedToId: nextTask.assignedToId,
          stage: nextTask.stage,
          status: WorkflowTaskStatus.IN_PROGRESS,
          startedAt: now,
        },
      });
    }

    await transaction.auditLog.create({
      data: {
        applicationId: application.id,
        userId: actor.id,
        action,
        description,
        metadata: {
          previousStatus: application.status,
          status: nextStatus,
          previousStage: stage,
          stage: nextStage,
          remarks: remarks || null,
        },
      },
    });
  });
}

export async function authorizeAnalysis(applicationId: string, actor: Actor) {
  if (actor.role !== UserRole.CLERK) {
    throw new ApplicationActionError(
      "દસ્તાવેજ સમીક્ષાની મદદ ફક્ત ક્લાર્ક માટે ઉપલબ્ધ છે.",
    );
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      assignedUserId: actor.id,
      currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
      status: {
        in: [ApplicationStatus.SUBMITTED, ApplicationStatus.DOCUMENT_REVIEW],
      },
    },
    select: {
      id: true,
      applicationNo: true,
      applicantName: true,
      applicantNameGu: true,
      phone: true,
      address: true,
      district: true,
      taluka: true,
      annualIncome: true,
      familyMembers: true,
      incomePurpose: true,
      documents: {
        select: { type: true, status: true },
      },
    },
  });

  if (!application) {
    throw new ApplicationActionError(
      "દસ્તાવેજ સમીક્ષા માટે આ અરજી તમને સોંપાયેલી નથી.",
    );
  }

  return application;
}
