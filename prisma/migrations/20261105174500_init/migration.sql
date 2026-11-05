-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLERK', 'TALATI', 'DEPUTY_MAMLATDAR', 'MAMLATDAR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'DOCUMENT_REVIEW', 'FIELD_VERIFICATION', 'DEPUTY_REVIEW', 'FINAL_REVIEW', 'RETURNED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkflowStage" AS ENUM ('DOCUMENT_SCRUTINY', 'FIELD_VERIFICATION', 'DEPUTY_REVIEW', 'FINAL_DECISION');

-- CreateEnum
CREATE TYPE "WorkflowTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'RETURNED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "office" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantNameGu" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "annualIncome" DECIMAL(12,2) NOT NULL,
    "familyMembers" INTEGER NOT NULL,
    "incomePurpose" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "currentStage" "WorkflowStage" NOT NULL DEFAULT 'DOCUMENT_SCRUTINY',
    "assignedUserId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "extractedData" JSONB,
    "verifiedById" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTask" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "stage" "WorkflowStage" NOT NULL,
    "status" "WorkflowTaskStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "model" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_active_idx" ON "User"("role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationNo_key" ON "Application"("applicationNo");

-- CreateIndex
CREATE INDEX "Application_status_currentStage_idx" ON "Application"("status", "currentStage");

-- CreateIndex
CREATE INDEX "Application_assignedUserId_status_idx" ON "Application"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "Application_submittedAt_idx" ON "Application"("submittedAt");

-- CreateIndex
CREATE INDEX "Document_applicationId_status_idx" ON "Document"("applicationId", "status");

-- CreateIndex
CREATE INDEX "Document_verifiedById_idx" ON "Document"("verifiedById");

-- CreateIndex
CREATE INDEX "WorkflowTask_applicationId_stage_status_idx" ON "WorkflowTask"("applicationId", "stage", "status");

-- CreateIndex
CREATE INDEX "WorkflowTask_assignedToId_status_idx" ON "WorkflowTask"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_applicationId_createdAt_idx" ON "AuditLog"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIAnalysis_applicationId_createdAt_idx" ON "AIAnalysis"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "AIAnalysis_reviewedById_idx" ON "AIAnalysis"("reviewedById");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTask" ADD CONSTRAINT "WorkflowTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
