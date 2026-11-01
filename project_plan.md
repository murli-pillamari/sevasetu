# SevaSetu – Project Implementation Plan

## 1. Project Objective

Build a working, Gujarati-first government workflow management application for processing income certificate applications.

The application must demonstrate:
- Realistic administrative workflow.
- Role-based access.
- AI-assisted document review.
- Human-controlled decisions.
- Application traceability.
- Clean and responsive user experience.

## 2. Architecture

Use a modular monolith architecture with Next.js App Router.

### Architecture Layers

1. Presentation Layer
   - Gujarati dashboard
   - Application management
   - Document management
   - Field verification
   - AI assistant
   - Audit timeline

2. Application Layer
   - Authentication
   - Authorization
   - Workflow management
   - Application services
   - Validation

3. Data Layer
   - PostgreSQL
   - Prisma ORM
   - Database transactions

4. AI Layer
   - Document extraction
   - Missing document detection
   - Data discrepancy analysis
   - Field report summarization
   - Final review summary

5. Storage Layer
   - Document uploads
   - Secure file references

## 3. User Roles

### CLERK
- View assigned applications.
- Review applicant information.
- Review documents.
- Verify document completeness.
- Forward applications to field verification.
- Return incomplete applications.

### TALATI
- View assigned field verification cases.
- Review applicant information.
- Record field observations.
- Upload inspection evidence.
- Submit verification findings.

### DEPUTY_MAMLATDAR
- Review submitted verification reports.
- Examine application evidence.
- Add review remarks.
- Forward applications to the final authority or return them for clarification.

### MAMLATDAR
- Review completed applications.
- Examine AI assistance and supporting evidence.
- Approve applications.
- Reject applications with reasons.
- Return applications for clarification.

### ADMIN
- Manage demonstration users.
- View system-level statistics.
- Configure application settings.

Note: The Deputy Mamlatdar stage is included as an additional review stage in this demonstration workflow. The precise local delegation of authority must be verified before treating this as an official procedure.

## 4. Application Lifecycle

Proposed statuses:

- SUBMITTED
- DOCUMENT_REVIEW
- FIELD_VERIFICATION
- DEPUTY_REVIEW
- FINAL_REVIEW
- RETURNED
- APPROVED
- REJECTED

Workflow:

1. Applicant application is submitted.
2. Clerk reviews documents.
3. Clerk forwards to Talati.
4. Talati completes field verification.
5. Deputy Mamlatdar reviews the verification.
6. Mamlatdar makes the final decision.

Return flow:
- Any authorized reviewing officer can return an application with a reason.
- Returned applications must retain their history.
- The clerk handles corrections and resubmission.

Rejection and approval are terminal states.

## 5. Database Models

### User
- id
- name
- email
- passwordHash
- role
- office
- active
- createdAt
- updatedAt

### Application
- id
- applicationNo
- applicantName
- applicantNameGu
- phone
- address
- district
- taluka
- annualIncome
- familyMembers
- incomePurpose
- status
- currentStage
- assignedUserId
- submittedAt
- updatedAt
- completedAt

### Document
- id
- applicationId
- type
- fileName
- fileUrl
- mimeType
- status
- extractedData
- verifiedById
- remarks
- createdAt

### WorkflowTask
- id
- applicationId
- assignedToId
- stage
- status
- remarks
- startedAt
- completedAt
- createdAt

### AuditLog
- id
- applicationId
- userId
- action
- description
- metadata
- createdAt

### AIAnalysis
- id
- applicationId
- analysisType
- inputData
- outputData
- confidence
- model
- reviewedById
- reviewedAt
- createdAt

Use relational constraints, indexes, transactions and server-side validation.

## 6. AI Features

### Document Extraction
Extract:
- Applicant name
- Document type
- Income information
- Relevant dates
- Other configured fields

### Missing Document Detection
Compare uploaded documents with the configurable document checklist.

### Discrepancy Detection
Compare application details with extracted document details.

### Field Report Summary
Summarize Talati inspection notes.

### Final Review Summary
Prepare a concise summary of:
- Application information
- Document verification results
- Field verification findings
- Potential inconsistencies
- Outstanding issues

AI output must always be advisory. Officers retain complete decision authority.

## 7. Main Screens

1. Login
2. Dashboard
3. Application List
4. Application Details
5. Document Verification
6. Field Verification
7. Review Panel
8. Application History
9. User Management

## 8. API Design

- POST /api/auth/login
- GET /api/dashboard
- GET /api/applications
- POST /api/applications
- GET /api/applications/[id]
- POST /api/applications/[id]/documents
- POST /api/applications/[id]/ai/analyze
- POST /api/applications/[id]/verify-document
- POST /api/applications/[id]/workflow/complete
- POST /api/applications/[id]/return
- POST /api/applications/[id]/decision
- GET /api/applications/[id]/history

Every API must verify the authenticated user and their authorization.

## 9. Development Roadmap

### Phase 1 – Foundation
- Create Next.js project.
- Configure TypeScript and Tailwind.
- Install and configure Prisma.
- Connect PostgreSQL.
- Create database schema.
- Run initial migration.
- Seed demo users and applications.

### Phase 2 – Authentication and Dashboard
- Implement authentication.
- Add role-based authorization.
- Create dashboard layout.
- Add Gujarati navigation.
- Display application statistics.

### Phase 3 – Application Management
- Application listing.
- Application details.
- Search and filters.
- Document uploads.
- Document verification.

### Phase 4 – Workflow Engine
- Implement state transitions.
- Implement task assignment.
- Add field verification.
- Add Deputy Mamlatdar review.
- Implement final decisions.
- Record audit logs.

### Phase 5 – AI Assistance
- Integrate OpenAI.
- Implement document extraction.
- Implement missing document checks.
- Implement discrepancy detection.
- Implement report summaries.
- Add officer review controls.

### Phase 6 – Testing and Deployment
- Test all roles.
- Test workflow transitions.
- Test unauthorized API access.
- Test document handling.
- Deploy to Vercel.
- Configure production database.
- Write README.
- Record walkthrough video.

## 10. Quality Requirements

- TypeScript strict mode.
- Reusable components.
- Modular business logic.
- Zod validation.
- Secure authentication.
- Server-side authorization.
- Responsive design.
- Meaningful error handling.
- No hardcoded secrets.
- No direct AI-driven official decisions.
- Every application action must be traceable.

## 11. Success Criteria

A reviewer must be able to:

1. Log in using different demo roles.
2. View pending applications.
3. Open an application.
4. Review documents.
5. Use AI assistance.
6. Complete document scrutiny.
7. Record field verification.
8. Review the application.
9. Approve, reject or return it.
10. Inspect the complete activity history.

The complete workflow must work end to end.
