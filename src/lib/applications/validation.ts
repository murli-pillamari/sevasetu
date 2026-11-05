import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

export const applicationInputSchema = z.object({
  applicantName: z.string().trim().min(2).max(120),
  applicantNameGu: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  address: z.string().trim().min(5).max(500),
  district: z.string().trim().min(2).max(100),
  taluka: z.string().trim().min(2).max(100),
  annualIncome: z.coerce.number().finite().positive().max(9_999_999_999.99),
  familyMembers: z.coerce.number().int().min(1).max(50),
  incomePurpose: z.string().trim().min(3).max(500),
});

export const applicationListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  status: z.enum(ApplicationStatus).or(z.literal("")).default(""),
  district: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;

export const workflowInputSchema = z.object({
  applicationId: z.string().min(1),
  intent: z.enum(["forward", "return", "approve", "reject", "remark"]),
  remarks: z.string().trim().max(1000).default(""),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;
