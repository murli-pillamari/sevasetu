import { ApplicationStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const pageSize = 10;

export type ApplicationViewer = {
  id: string;
  role: UserRole;
};

export function applicationVisibilityWhere(
  user: ApplicationViewer,
): Prisma.ApplicationWhereInput {
  return user.role === UserRole.ADMIN ? {} : { assignedUserId: user.id };
}

export async function getDashboardData(user: ApplicationViewer) {
  const visibility = applicationVisibilityWhere(user);
  const [total, statusGroups, assignedToUser, staleOpen, recentApplications] =
    await Promise.all([
      prisma.application.count({ where: visibility }),
      prisma.application.groupBy({
        by: ["status"],
        where: visibility,
        _count: { _all: true },
      }),
      prisma.application.count({ where: { assignedUserId: user.id } }),
      prisma.application.count({
        where: {
          ...visibility,
          status: {
            in: [
              ApplicationStatus.SUBMITTED,
              ApplicationStatus.DOCUMENT_REVIEW,
              ApplicationStatus.FIELD_VERIFICATION,
              ApplicationStatus.DEPUTY_REVIEW,
              ApplicationStatus.FINAL_REVIEW,
            ],
          },
          submittedAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.application.findMany({
        where: visibility,
        orderBy: { submittedAt: "desc" },
        take: 5,
        select: {
          id: true,
          applicationNo: true,
          applicantName: true,
          status: true,
          currentStage: true,
          submittedAt: true,
          assignedUser: { select: { name: true } },
        },
      }),
    ]);

  const counts = Object.fromEntries(
    statusGroups.map(({ status, _count }) => [status, _count._all]),
  ) as Partial<Record<ApplicationStatus, number>>;
  const pending = Object.entries(counts).reduce(
    (sum, [status, count]) =>
      status !== ApplicationStatus.APPROVED &&
      status !== ApplicationStatus.REJECTED
        ? sum + (count ?? 0)
        : sum,
    0,
  );
  const needsAttention =
    (counts[ApplicationStatus.RETURNED] ?? 0) + staleOpen;

  return {
    total,
    pending,
    needsAttention,
    approved: counts[ApplicationStatus.APPROVED] ?? 0,
    rejected: counts[ApplicationStatus.REJECTED] ?? 0,
    assignedToUser,
    counts,
    recentApplications,
  };
}

export async function getApplicationList(
  user: ApplicationViewer,
  input: {
    q: string;
    status: ApplicationStatus | "";
    district: string;
    page: number;
  },
) {
  const where: Prisma.ApplicationWhereInput = {
    AND: [
      applicationVisibilityWhere(user),
      input.q
        ? {
            OR: [
              { applicationNo: { contains: input.q, mode: "insensitive" } },
              { applicantName: { contains: input.q, mode: "insensitive" } },
              { applicantNameGu: { contains: input.q, mode: "insensitive" } },
              { phone: { contains: input.q } },
            ],
          }
        : {},
      input.status
        ? { status: input.status }
        : {},
      input.district
        ? { district: { contains: input.district, mode: "insensitive" } }
        : {},
    ],
  };
  const total = await prisma.application.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(input.page, pageCount);
  const applications = await prisma.application.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      applicationNo: true,
      applicantName: true,
      applicantNameGu: true,
      district: true,
      taluka: true,
      status: true,
      currentStage: true,
      submittedAt: true,
      assignedUser: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return {
    applications,
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function getApplicationDetails(
  user: ApplicationViewer,
  applicationId: string,
) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      ...(user.role === UserRole.ADMIN
        ? {}
        : {
            OR: [
              { assignedUserId: user.id },
              { workflowTasks: { some: { assignedToId: user.id } } },
              { auditLogs: { some: { userId: user.id } } },
            ],
          }),
    },
    include: {
      assignedUser: {
        select: { id: true, name: true, role: true, office: true },
      },
      documents: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          fileName: true,
          status: true,
          remarks: true,
          extractedData: true,
          createdAt: true,
        },
      },
      workflowTasks: {
        orderBy: { createdAt: "asc" },
        include: {
          assignedTo: { select: { id: true, name: true, role: true } },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      },
      aiAnalyses: {
        where: { analysisType: "DOCUMENT_SCRUTINY" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          outputData: true,
          model: true,
          createdAt: true,
        },
      },
    },
  });
}
