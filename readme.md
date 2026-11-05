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
AUTH_SECRET="paste-a-random-secret-of-at-least-32-characters-here"
AUTH_TRUST_HOST="true"
OPENAI_API_KEY="replace-with-your-openai-api-key"
```

Generate a secret locally with Node.js, then copy its output into `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Do not use the example placeholder as `AUTH_SECRET` or commit a generated secret.

Validate the Prisma configuration and generate the client:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

Set `DATABASE_URL` in `.env` to a PostgreSQL database before running migrations
or the seed script. The seed contains synthetic demonstration applications and
the demo accounts below; do not use these credentials outside local development.
Authentication uses `AUTH_SECRET`, `AUTH_TRUST_HOST`, and `DATABASE_URL` from
`.env`. Set `AUTH_TRUST_HOST=true` only when the application is behind a trusted
host or reverse proxy (including local development). The login checks the
seeded account's bcrypt hash; it does not create or change users or roles.
Unauthenticated users are redirected to `/login`.

### Demo credentials

These are public, local-demonstration-only accounts. All five accounts use the
same password: `SevaSetuDemo2026!`.

| Role | Email |
|---|---|
| Clerk | clerk@sevasetu.demo |
| Talati | talati@sevasetu.demo |
| Deputy Mamlatdar | deputy@sevasetu.demo |
| Mamlatdar | mamlatdar@sevasetu.demo |
| Admin | admin@sevasetu.demo |

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Production Deployment (Vercel)

Use a production PostgreSQL database and configure these variables in the
Vercel project's **Production** environment before deploying:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection used by Prisma at build and runtime. Use the provider's recommended pooled/runtime URL where applicable. |
| `AUTH_SECRET` | Yes | Random secret of at least 32 characters. Generate a unique value; do not use the example placeholder. |
| `AUTH_TRUST_HOST` | Yes for Vercel | Set to `true` so Auth.js trusts the Vercel host/proxy. |
| `OPENAI_API_KEY` | No | Enables AI-assisted review. Without it, officers can still use the manual checklist. |
| `OPENAI_MODEL` | No | OpenAI model name; defaults to `gpt-4o-mini`. |

No `NEXT_PUBLIC_` variables are used. Keep all secrets server-side and out of
Git. `npm run build` generates Prisma Client before running `next build`.

Deployment steps:

1. Create/link the Vercel project and set the variables above for the relevant
   deployment environment. `DATABASE_URL` and `AUTH_SECRET` must also be
   available to the build.
2. Before deploying a schema change, run `npm run db:migrate:deploy` in a
   trusted CI/deployment environment with `DATABASE_URL` set to the production
   PostgreSQL database. This applies checked-in migrations; do not run
   `prisma migrate dev` against production.
3. Deploy the branch to Vercel. The build runs `prisma generate && next build`.
4. For a dedicated public demo deployment only, run `npm run db:seed` against
   that deployment's isolated demo database to create the demo users and
   synthetic applications. The demo credentials are public and include an
   administrator account; never seed them into a real production environment.

Prisma tracks applied migrations in the database and skips them on subsequent
deploys.

## Project Status

Development in progress.

See [project_plan.md](project_plan.md) for the implementation roadmap.

## Important Disclaimer

SevaSetu is a technical demonstration project developed for an engineering assessment. It is not an official Gujarat Government application and does not issue legally valid income certificates.
