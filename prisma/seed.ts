import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import {
  ApplicationStatus,
  Prisma,
  PrismaClient,
  UserRole,
  WorkflowStage,
  WorkflowTaskStatus,
} from "@prisma/client";

const demoPassword = "SevaSetuDemo2026!";

const userSeeds = [
  {
    id: "demo-user-clerk",
    name: "Kiran Patel",
    email: "clerk@sevasetu.demo",
    role: UserRole.CLERK,
    office: "Ahmedabad City Office",
  },
  {
    id: "demo-user-talati",
    name: "Mehul Parmar",
    email: "talati@sevasetu.demo",
    role: UserRole.TALATI,
    office: "Daskroi Taluka Office",
  },
  {
    id: "demo-user-deputy",
    name: "Nisha Desai",
    email: "deputy@sevasetu.demo",
    role: UserRole.DEPUTY_MAMLATDAR,
    office: "Ahmedabad Deputy Mamlatdar Office",
  },
  {
    id: "demo-user-mamlatdar",
    name: "Rakesh Shah",
    email: "mamlatdar@sevasetu.demo",
    role: UserRole.MAMLATDAR,
    office: "Ahmedabad Mamlatdar Office",
  },
  {
    id: "demo-user-admin",
    name: "SevaSetu Administrator",
    email: "admin@sevasetu.demo",
    role: UserRole.ADMIN,
    office: "SevaSetu Demonstration",
  },
] satisfies Array<{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  office: string;
}>;

const applicationSeeds: Array<{
  applicationNo: string;
  applicantName: string;
  applicantNameGu: string;
  phone: string;
  address: string;
  district: string;
  taluka: string;
  annualIncome: string;
  familyMembers: number;
  incomePurpose: string;
  status: ApplicationStatus;
  currentStage: WorkflowStage;
  assignedEmail: string;
  daysAgo: number;
  tasks: Array<{
    stage: WorkflowStage;
    status: WorkflowTaskStatus;
    assignedEmail: string;
    remarks: string | null;
    daysAgo: number;
  }>;
}> = [
  {
    applicationNo: "2026-GJ-0001",
    applicantName: "Aarav Patel",
    applicantNameGu: "આરવ પટેલ",
    phone: "9000000001",
    address: "Near Gram Panchayat, Sanand",
    district: "Ahmedabad",
    taluka: "Sanand",
    annualIncome: "185000.00",
    familyMembers: 4,
    incomePurpose: "Education assistance",
    status: ApplicationStatus.SUBMITTED,
    currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
    assignedEmail: "clerk@sevasetu.demo",
    daysAgo: 1,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.PENDING,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: null,
        daysAgo: 1,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0002",
    applicantName: "રમીલાબેન ઠાકોર",
    applicantNameGu: "રમીલાબેન ઠાકોર",
    phone: "9000000002",
    address: "Ward 4, Dholka",
    district: "Ahmedabad",
    taluka: "Dholka",
    annualIncome: "96000.00",
    familyMembers: 5,
    incomePurpose: "Scholarship application",
    status: ApplicationStatus.SUBMITTED,
    currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
    assignedEmail: "clerk@sevasetu.demo",
    daysAgo: 2,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.PENDING,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: null,
        daysAgo: 2,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0003",
    applicantName: "Imran Sheikh",
    applicantNameGu: "ઇમરાન શેખ",
    phone: "9000000003",
    address: "Station Road, Kalol",
    district: "Gandhinagar",
    taluka: "Kalol",
    annualIncome: "240000.00",
    familyMembers: 6,
    incomePurpose: "Fee concession",
    status: ApplicationStatus.DOCUMENT_REVIEW,
    currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
    assignedEmail: "clerk@sevasetu.demo",
    daysAgo: 4,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Income proof is under review.",
        daysAgo: 3,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0004",
    applicantName: "હેતલબેન જોષી",
    applicantNameGu: "હેતલબેન જોષી",
    phone: "9000000004",
    address: "Shivranjani Area, Ahmedabad",
    district: "Ahmedabad",
    taluka: "Ahmedabad City",
    annualIncome: "315000.00",
    familyMembers: 3,
    incomePurpose: "Hostel fee support",
    status: ApplicationStatus.DOCUMENT_REVIEW,
    currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
    assignedEmail: "clerk@sevasetu.demo",
    daysAgo: 5,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Address document needs a manual check.",
        daysAgo: 4,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0005",
    applicantName: "Jayesh Makwana",
    applicantNameGu: "જયેશ મકવાણા",
    phone: "9000000005",
    address: "Main Bazar, Anand",
    district: "Anand",
    taluka: "Anand",
    annualIncome: "142500.00",
    familyMembers: 5,
    incomePurpose: "Education assistance",
    status: ApplicationStatus.FIELD_VERIFICATION,
    currentStage: WorkflowStage.FIELD_VERIFICATION,
    assignedEmail: "talati@sevasetu.demo",
    daysAgo: 8,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 7,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "talati@sevasetu.demo",
        remarks: null,
        daysAgo: 3,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0006",
    applicantName: "Fatimaben Mansuri",
    applicantNameGu: "ફાતીમાબેન મન્સૂરી",
    phone: "9000000006",
    address: "Borsad Road, Petlad",
    district: "Anand",
    taluka: "Petlad",
    annualIncome: "208000.00",
    familyMembers: 7,
    incomePurpose: "Government scholarship",
    status: ApplicationStatus.FIELD_VERIFICATION,
    currentStage: WorkflowStage.FIELD_VERIFICATION,
    assignedEmail: "talati@sevasetu.demo",
    daysAgo: 9,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 8,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Visit is scheduled.",
        daysAgo: 4,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0007",
    applicantName: "Chirag Solanki",
    applicantNameGu: "ચિરાગ સોલંકી",
    phone: "9000000007",
    address: "Near Bus Stand, Visnagar",
    district: "Mehsana",
    taluka: "Visnagar",
    annualIncome: "172000.00",
    familyMembers: 4,
    incomePurpose: "Education assistance",
    status: ApplicationStatus.DEPUTY_REVIEW,
    currentStage: WorkflowStage.DEPUTY_REVIEW,
    assignedEmail: "deputy@sevasetu.demo",
    daysAgo: 12,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 11,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Field report submitted.",
        daysAgo: 5,
      },
      {
        stage: WorkflowStage.DEPUTY_REVIEW,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "deputy@sevasetu.demo",
        remarks: null,
        daysAgo: 2,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0008",
    applicantName: "કવિતાબેન પરમાર",
    applicantNameGu: "કવિતાબેન પરમાર",
    phone: "9000000008",
    address: "Lunawada Road, Santrampur",
    district: "Mahisagar",
    taluka: "Santrampur",
    annualIncome: "118000.00",
    familyMembers: 6,
    incomePurpose: "Student fee assistance",
    status: ApplicationStatus.DEPUTY_REVIEW,
    currentStage: WorkflowStage.DEPUTY_REVIEW,
    assignedEmail: "deputy@sevasetu.demo",
    daysAgo: 13,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 12,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Field report submitted.",
        daysAgo: 6,
      },
      {
        stage: WorkflowStage.DEPUTY_REVIEW,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "deputy@sevasetu.demo",
        remarks: "Reviewing field observations.",
        daysAgo: 2,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0009",
    applicantName: "Mitesh Rathod",
    applicantNameGu: "મિતેશ રાઠોડ",
    phone: "9000000009",
    address: "Station Road, Palanpur",
    district: "Banaskantha",
    taluka: "Palanpur",
    annualIncome: "276000.00",
    familyMembers: 5,
    incomePurpose: "Education assistance",
    status: ApplicationStatus.FINAL_REVIEW,
    currentStage: WorkflowStage.FINAL_DECISION,
    assignedEmail: "mamlatdar@sevasetu.demo",
    daysAgo: 16,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 15,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Field report submitted.",
        daysAgo: 10,
      },
      {
        stage: WorkflowStage.DEPUTY_REVIEW,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "deputy@sevasetu.demo",
        remarks: "Forwarded for final decision.",
        daysAgo: 5,
      },
      {
        stage: WorkflowStage.FINAL_DECISION,
        status: WorkflowTaskStatus.IN_PROGRESS,
        assignedEmail: "mamlatdar@sevasetu.demo",
        remarks: null,
        daysAgo: 2,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0010",
    applicantName: "ભૂમિકાબેન ગોહિલ",
    applicantNameGu: "ભૂમિકાબેન ગોહિલ",
    phone: "9000000010",
    address: "Gondal Road, Jetpur",
    district: "Rajkot",
    taluka: "Jetpur",
    annualIncome: "89000.00",
    familyMembers: 4,
    incomePurpose: "Scholarship application",
    status: ApplicationStatus.RETURNED,
    currentStage: WorkflowStage.DOCUMENT_SCRUTINY,
    assignedEmail: "clerk@sevasetu.demo",
    daysAgo: 18,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.RETURNED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Please provide a clearer copy of the income proof.",
        daysAgo: 3,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0011",
    applicantName: "Pooja Trivedi",
    applicantNameGu: "પૂજા ત્રિવેદી",
    phone: "9000000011",
    address: "College Road, Nadiad",
    district: "Kheda",
    taluka: "Nadiad",
    annualIncome: "156000.00",
    familyMembers: 3,
    incomePurpose: "Educational fee support",
    status: ApplicationStatus.APPROVED,
    currentStage: WorkflowStage.FINAL_DECISION,
    assignedEmail: "mamlatdar@sevasetu.demo",
    daysAgo: 24,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 23,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Field report submitted.",
        daysAgo: 18,
      },
      {
        stage: WorkflowStage.DEPUTY_REVIEW,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "deputy@sevasetu.demo",
        remarks: "Forwarded for final decision.",
        daysAgo: 12,
      },
      {
        stage: WorkflowStage.FINAL_DECISION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "mamlatdar@sevasetu.demo",
        remarks: "Approved by the authorized officer.",
        daysAgo: 7,
      },
    ],
  },
  {
    applicationNo: "2026-GJ-0012",
    applicantName: "Nirav Barot",
    applicantNameGu: "નિરવ બારોટ",
    phone: "9000000012",
    address: "Modasa Highway, Bayad",
    district: "Aravalli",
    taluka: "Bayad",
    annualIncome: "420000.00",
    familyMembers: 5,
    incomePurpose: "Education assistance",
    status: ApplicationStatus.REJECTED,
    currentStage: WorkflowStage.FINAL_DECISION,
    assignedEmail: "mamlatdar@sevasetu.demo",
    daysAgo: 30,
    tasks: [
      {
        stage: WorkflowStage.DOCUMENT_SCRUTINY,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "clerk@sevasetu.demo",
        remarks: "Documents reviewed.",
        daysAgo: 29,
      },
      {
        stage: WorkflowStage.FIELD_VERIFICATION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "talati@sevasetu.demo",
        remarks: "Field report submitted.",
        daysAgo: 23,
      },
      {
        stage: WorkflowStage.DEPUTY_REVIEW,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "deputy@sevasetu.demo",
        remarks: "Forwarded with observations for final decision.",
        daysAgo: 16,
      },
      {
        stage: WorkflowStage.FINAL_DECISION,
        status: WorkflowTaskStatus.COMPLETED,
        assignedEmail: "mamlatdar@sevasetu.demo",
        remarks: "Rejected by the authorized officer after review.",
        daysAgo: 10,
      },
    ],
  },
];

function daysBeforeNow(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function requireUserId(userIdByEmail: ReadonlyMap<string, string>, email: string): string {
  const userId = userIdByEmail.get(email);

  if (!userId) {
    throw new Error(`No seeded user found for ${email}.`);
  }

  return userId;
}

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL must be configured before running the seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await hash(demoPassword, 12);
    const userIdByEmail = new Map<string, string>();

    for (const user of userSeeds) {
      const savedUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          passwordHash,
          active: true,
        },
      });

      userIdByEmail.set(user.email, savedUser.id);
    }

    for (const seed of applicationSeeds) {
      const assignedUserId = requireUserId(userIdByEmail, seed.assignedEmail);

      const submittedAt = daysBeforeNow(seed.daysAgo);
      const completedAt =
        seed.status === ApplicationStatus.APPROVED ||
        seed.status === ApplicationStatus.REJECTED
          ? daysBeforeNow(
              Math.max(
                (seed.tasks.find((task) => task.stage === WorkflowStage.FINAL_DECISION)
                  ?.daysAgo ?? seed.daysAgo) - 1,
                0,
              ),
            )
          : null;

      const application = await prisma.application.upsert({
        where: { applicationNo: seed.applicationNo },
        update: {},
        create: {
          applicationNo: seed.applicationNo,
          applicantName: seed.applicantName,
          applicantNameGu: seed.applicantNameGu,
          phone: seed.phone,
          address: seed.address,
          district: seed.district,
          taluka: seed.taluka,
          annualIncome: new Prisma.Decimal(seed.annualIncome),
          familyMembers: seed.familyMembers,
          incomePurpose: seed.incomePurpose,
          status: seed.status,
          currentStage: seed.currentStage,
          assignedUserId,
          submittedAt,
          completedAt,
        },
      });

      for (const [index, task] of seed.tasks.entries()) {
        const taskAssigneeId = requireUserId(userIdByEmail, task.assignedEmail);

        const taskId = `${application.id}-task-${index + 1}`;
        const startedAt = daysBeforeNow(task.daysAgo);
        const taskCompletedAt =
          task.status === WorkflowTaskStatus.COMPLETED
            ? daysBeforeNow(Math.max(task.daysAgo - 1, 0))
            : null;

        await prisma.workflowTask.upsert({
          where: { id: taskId },
          update: {},
          create: {
            id: taskId,
            applicationId: application.id,
            assignedToId: taskAssigneeId,
            stage: task.stage,
            status: task.status,
            remarks: task.remarks,
            startedAt,
            completedAt: taskCompletedAt,
            createdAt: startedAt,
          },
        });
      }

      const initialAuditId = `${application.id}-audit-submitted`;
      await prisma.auditLog.upsert({
        where: { id: initialAuditId },
        update: {},
        create: {
          id: initialAuditId,
          applicationId: application.id,
          userId: requireUserId(userIdByEmail, "clerk@sevasetu.demo"),
          action: "APPLICATION_SUBMITTED",
          description: "Synthetic demonstration application submitted.",
          metadata: {
            source: "demo-seed",
            synthetic: true,
          } satisfies Prisma.InputJsonObject,
          createdAt: submittedAt,
        },
      });

      const statusAuditId = `${application.id}-audit-status`;
      await prisma.auditLog.upsert({
        where: { id: statusAuditId },
        update: {},
        create: {
          id: statusAuditId,
          applicationId: application.id,
          userId: assignedUserId,
          action: `STATUS_${seed.status}`,
          description: `Synthetic demonstration status: ${seed.status}.`,
          metadata: {
            source: "demo-seed",
            synthetic: true,
            status: seed.status,
            stage: seed.currentStage,
          } satisfies Prisma.InputJsonObject,
          createdAt: daysBeforeNow(Math.max(seed.daysAgo - 1, 0)),
        },
      });
    }

    console.info(
      `Seeded ${userSeeds.length} demo users and ${applicationSeeds.length} synthetic applications.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Database seed failed:", error);
  process.exitCode = 1;
});
