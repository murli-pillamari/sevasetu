# SevaSetu – સેવા સેતુ

**AI-Assisted Government Application Workflow Management**

SevaSetu is a Gujarati-first workflow management platform designed to help government officers manage income certificate applications through a transparent, structured and efficient digital process.

The platform enables government employees to review applications, verify documents, conduct field inspections, collaborate across administrative stages and make informed decisions with AI assistance.

## Problem Statement

Government officers handling citizen service applications often deal with paper-based processes, document verification, field inspections and multiple approval stages.

This can lead to:
- Delays in application processing.
- Missing or inconsistent documents.
- Difficulty tracking application status.
- Repetitive manual verification.
- Limited visibility into pending workloads.
- Lack of a centralized application history.

SevaSetu aims to simplify this process through a centralized digital workflow.

## Proposed Solution

A role-based application that supports four administrative roles:

1. Clerk / Application Operator
2. Talati – Field Verification Officer
3. Deputy Mamlatdar – Review Officer
4. Mamlatdar – Final Decision Authority

The proposed MVP workflow has three main stages:

### 1. Application and Document Scrutiny
- Review applicant details.
- Check uploaded documents.
- Identify missing information.
- Use AI to extract document information and highlight possible inconsistencies.
- Forward the application or return it for correction.

### 2. Field Verification
- Review applicant residential and income information.
- Record field inspection observations.
- Upload inspection evidence.
- Use AI to summarize field reports.
- Submit verification findings.

### 3. Final Review and Decision
- Review application details and supporting evidence.
- Review AI-generated summaries and warnings.
- Approve, reject or return the application.
- Record the decision and reason.

This is a proposed demonstration workflow and should not be interpreted as a complete representation of every district's official administrative procedure.

## Key Features

- Gujarati-first user interface.
- Role-based authentication and authorization.
- Application dashboard and workload statistics.
- Application search and filtering.
- Document upload and verification.
- AI-assisted document information extraction.
- Missing document detection.
- Field verification management.
- AI-generated review summaries.
- Application approval, rejection and return.
- Complete application audit history.
- Responsive desktop and mobile interface.

## AI Integration

AI is designed to assist government officers, not replace their judgment.

AI capabilities include:
- Extracting relevant information from documents.
- Highlighting potential inconsistencies.
- Identifying potentially missing documents.
- Summarizing field verification reports.
- Preparing decision-support summaries.

All AI-generated information must be reviewed by an authorized officer. AI cannot independently approve or reject an application.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Auth.js |
| Validation | Zod |
| Forms | React Hook Form |
| AI | OpenAI API |
| File Storage | Cloudinary / AWS S3 |
| Deployment | Vercel |

## Impact Measurement

We will evaluate the application using:

- Average application processing time.
- Number of pending applications.
- Document discrepancy rate.
- Application return rate.
- Time spent at each workflow stage.
- Percentage of useful AI-generated flags confirmed by officers.

These are proposed evaluation metrics. Any demonstration results will be clearly identified as simulated data.

## Security and Privacy

- Role-based access control.
- Server-side authorization.
- Secure password hashing.
- Environment-based secret management.
- Input validation.
- Restricted document access.
- Append-only audit history at the application level.
- AI outputs separated from official decisions.

Only synthetic applicant data should be used in the demonstration.

## Running Locally

### Prerequisites
- Node.js LTS
- npm
- PostgreSQL database

### Installation

```bash
git clone YOUR_REPOSITORY_URL
cd sevasetu
npm install
```

Copy `.env.example` to `.env` and set your local values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sevasetu?schema=public"
AUTH_SECRET="replace-with-a-secure-random-value"
OPENAI_API_KEY="replace-with-your-openai-api-key"
```

Validate the Prisma configuration and generate the client:

```bash
npm run db:validate
npm run db:generate
```

This foundation configures PostgreSQL but does not yet define application models,
migrations, or seed data. Those will be added in a later milestone.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Project Status

Development in progress.

See [project_plan.md](project_plan.md) for the implementation roadmap.

## Important Disclaimer

SevaSetu is a technical demonstration project developed for an engineering assessment. It is not an official Gujarat Government application and does not issue legally valid income certificates.
