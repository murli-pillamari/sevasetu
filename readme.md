# SevaSetu – સેવા સેતુ

**Gujarati-first income certificate application workflow demonstration**

SevaSetu is a technical demonstration for organizing income certificate
applications across Clerk, Talati, Deputy Mamlatdar, and Mamlatdar roles. It
provides an assigned-case dashboard, a staged review workflow, an application
history, and optional AI assistance limited to document metadata.

This is not an official Gujarat Government system or a substitute for local
rules and procedures. The workflow and document checklist are illustrative.

## Problem and intended users

The demonstration addresses the difficulty of tracking application ownership,
pending work, review remarks, and decisions across administrative roles. It is
intended for Clerks, Talatis, Deputy Mamlatdars, and Mamlatdars evaluating a
shared digital workflow. Synthetic data is used for demonstration.

## Implemented functionality

- **Authentication and roles:** Credentials-based sign-in for Clerk, Talati,
  Deputy Mamlatdar, Mamlatdar, and Admin. Demo passwords are bcrypt-hashed.
- **Dashboard:** Total, pending, needs-attention (returned plus open cases
  submitted more than seven days ago), approved, rejected, and assigned-to-me
  counts, with recent applications and status distribution. Admin dashboard/list
  queries include all applications; other roles see their assigned applications
  in those views.
- **Application management:** Clerks can create applications. The list supports
  application number, applicant name, mobile, status, and district search or
  filtering, with pagination.
- **Workflow:** The configured stages are document scrutiny (Clerk), field
  verification (Talati), Deputy review, and final decision (Mamlatdar).
  Assigned stage officers can record remarks and forward or return applications.
  The Mamlatdar makes the final approve/reject decision; a rejection requires a
  reason. Workflow changes use database transactions and server-side role and
  assignment checks.
- **Return and correction:** A returned case goes to its original active Clerk.
  The Clerk can edit its existing application details and resubmit it with
  correction remarks. Its application ID and reference number are retained.
- **History:** The details page shows officer remarks and an audit timeline with
  the recorded action, actor, role, and date.
- **Gujarati-first UI:** Important navigation, labels, statuses, and workflow
  actions are Gujarati-first, with English terminology where useful.

### Current document and field-review limits

The Prisma schema contains a `Document` model, and the details page displays a
checklist and any document records already in the database. However, the
application has **no document upload, preview/download, file storage, or
document verification interface**. It also has no dedicated field inspection
form, evidence upload, or field-report capture; the Talati uses the shared
workflow remarks and transition controls. Do not treat these as implemented
capabilities.

The checklist in `src/lib/applications/presentation.ts` is a static
demonstration list, not an official or administrator-configurable government
requirement.

## AI assistance

AI is advisory only. The AI review action is available to the assigned Clerk
during document scrutiny. If `OPENAI_API_KEY` is configured, the server sends
the configured checklist, document record types/statuses, and a
preliminary-review flag to the OpenAI Chat Completions API. It does **not** send
uploaded file contents, applicant identity, or application form details.

The service validates successful AI output with Zod and saves it to
`AIAnalysis`. It also computes missing checklist items locally. If no document
records exist, the result is preliminary checklist assistance only. If the key
is missing or the API is unavailable, the UI labels the local checklist as a
manual fallback—not AI-generated findings. Manual officer review remains
available.

The current AI integration does not perform document extraction or OCR, compare
applicant details to document contents, summarize field reports, or prepare a
final decision summary. AI never approves, rejects, or determines eligibility;
officers retain decision authority. The OpenAI package is installed, but this
review calls the API using server-side `fetch`.

## Technology

| Area | Implemented technology |
|---|---|
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Forms and validation | Native forms, React Server Actions, React `useActionState`, Zod 4 |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Authentication | Auth.js v5 Credentials provider, JWT sessions, bcryptjs |
| AI review | OpenAI Chat Completions API via server-side `fetch`; Zod response validation |
| Deployment target | Vercel (deployment configuration documented below) |

The project does not currently use shadcn/ui, React Hook Form, Cloudinary, or
AWS S3.

## Evaluation

Possible assessment measures include processing time, pending workload, return
rate, time in each stage, and whether officers find AI metadata observations
useful. These are **proposed evaluation measures**, not metrics currently
collected or reported by the application.

## Security and demonstration limitations

- Authentication, role checks, assignment checks, and input validation are
  performed on the server for protected operations.
- Application lists are scoped to assigned cases except for Admin; details are
  also accessible to users who previously participated in the case workflow.
- Application creation and workflow/correction changes write audit records.
- Secrets are configured through environment variables. Do not commit `.env`
  files or use real applicant information in this demonstration.
- No file upload/storage capability is implemented, so document file access
  controls are not provided.
- Demo users share a public password and include an Admin account. Never use
  these accounts or seed data for real production access.

## Local setup

### Requirements

- Node.js 20.9 or later and npm
- A PostgreSQL database

### Install and configure

```bash
git clone YOUR_REPOSITORY_URL
cd sevasetu
npm install
```

Copy `.env.example` to `.env`. Set `DATABASE_URL` to your PostgreSQL
connection string and set `AUTH_SECRET` to a new random value of at least 32
characters. `AUTH_TRUST_HOST=true` is used for local development. `OPENAI_API_KEY`
is optional; without it, AI review falls back to the manual checklist.
`OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`.

Generate a secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Do not use the example placeholder as `AUTH_SECRET` or commit generated
credentials.

Validate the schema, apply the development migration, and seed synthetic demo
accounts and applications:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the application:

```bash
npm run dev
```

Open <http://localhost:3000>. `npm run build` runs `prisma generate` before
`next build`. Other available commands are `npm run lint`,
`npm run typecheck`, and `npm run db:migrate:deploy` (for applying checked-in
migrations outside development).

### Demo accounts

The seed creates these synthetic demonstration accounts with bcrypt-hashed
passwords. All use the same public demo-only password: `SevaSetuDemo2026!`.
Run `npm run db:seed` before signing in. Do not use these credentials in a real
production environment.

| Role | Email |
|---|---|
| Clerk | clerk@sevasetu.demo |
| Talati | talati@sevasetu.demo |
| Deputy Mamlatdar | deputy@sevasetu.demo |
| Mamlatdar | mamlatdar@sevasetu.demo |
| Admin | admin@sevasetu.demo |

There is no user registration or user-management UI. The seed provisions demo
users; production users must be provisioned through a trusted administrative
process before they can sign in.

## Vercel deployment

Configure these variables in the Vercel project. `DATABASE_URL` and
`AUTH_SECRET` are required for the application/build; set
`AUTH_TRUST_HOST=true` for Auth.js behind Vercel. OpenAI variables are optional.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL URL used by Prisma at build and runtime. |
| `AUTH_SECRET` | Yes | Unique random value with at least 32 characters. |
| `AUTH_TRUST_HOST` | Yes for Vercel | Set to `true` for the Vercel host/proxy. |
| `OPENAI_API_KEY` | No | Enables OpenAI review; manual checklist fallback remains without it. |
| `OPENAI_MODEL` | No | Model name; defaults to `gpt-4o-mini`. |

Before deploying schema changes, set the production `DATABASE_URL` in a trusted
deployment environment and run:

```bash
npm run db:migrate:deploy
```

Do not run `npm run db:migrate` against production; it runs Prisma's development
migration command. Deploy to Vercel after migrations are applied. The configured
build command generates Prisma Client and builds Next.js. Only seed an isolated
demo database if public demo access is explicitly intended; never seed the
known demo accounts into a real production database.

## Project plan

See [project_plan.md](./project_plan.md) for the development roadmap. It
describes planned architecture and features; it is not a statement that every
planned item is implemented.

## Disclaimer

SevaSetu is a technical demonstration for an engineering assessment. It is not
an official Gujarat Government application and does not issue legally valid
income certificates.
