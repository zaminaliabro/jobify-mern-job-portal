# Jobify — PERN Job Portal

A full-stack job portal: candidates browse and apply to jobs, recruiters post jobs and move applicants through a hiring pipeline.

**Stack:** React + Vite + Tailwind + React Router + Axios + Context API · Node + Express · PostgreSQL + Prisma · JWT + bcrypt

Frontend and API deploy together as a single Vercel project.

---

## Quick start

Requires Node 18+ and a PostgreSQL database (Supabase, Neon, or a local server).

```bash
npm install                  # root deps; also runs `prisma generate`
cp .env.example .env         # then fill DATABASE_URL / DIRECT_URL / JWT_SECRET
npm run db:migrate           # create the tables
npm run seed                 # optional: demo users, jobs, applications

npm run dev                  # API   -> http://localhost:5000
npm run dev:client           # client -> http://localhost:5173   (second terminal)
```

Vite proxies `/api` to `http://localhost:5000`, so no CORS setup is needed in development.

### Demo accounts (after `npm run seed`)

| Role      | Email                | Password    |
| --------- | -------------------- | ----------- |
| Recruiter | recruiter@jobify.com | password123 |
| Candidate | candidate@jobify.com | password123 |

---

## Environment variables (`.env` at the repo root)

| Key              | Notes                                                              |
| ---------------- | ------------------------------------------------------------------ |
| `PORT`           | `5000` — local API only; Vercel assigns its own                     |
| `DATABASE_URL`   | Supabase **session-mode pooler** URI, port `5432`                   |
| `DIRECT_URL`     | The same URI — Prisma uses it for migrations                        |
| `JWT_SECRET`     | Any long random string                                              |
| `JWT_EXPIRES_IN` | `7d`                                                                |
| `CLIENT_URL`     | CORS allowlist. Empty allows any origin; unused when same-origin    |

Two Supabase hosts to avoid:

- `db.<ref>.supabase.co` resolves to **IPv6 only** and is unreachable from IPv4-only networks (`P1001: Can't reach database server`).
- The **transaction pooler** on port `6543` stalls migrations.

Use `aws-0-<region>.pooler.supabase.com:5432` for both variables.

### Prisma commands

```bash
npm run db:migrate     # create + apply a migration in development
npm run db:deploy      # apply committed migrations (used in the Vercel build)
npm run db:generate    # regenerate the Prisma Client
npm run db:studio      # browse the data in a GUI
```

---

## Features

**Auth** — register (candidate or recruiter), login, logout, JWT in `localStorage`, bcrypt-hashed passwords, protected routes on both client and server.

**Candidate** — browse jobs, keyword search, filter by location / job type / salary range / category, sort, paginate, view job details, apply with resume link + cover letter (one application per job), track every application and its status, edit profile and skills.

**Recruiter** — post, edit and delete jobs (deleting a job cascades to its applications), see applicant counts per job, review each applicant's profile, skills, resume and cover letter, and move them through `Applied → Shortlisted → Interview → Rejected → Hired`.

**Dashboard** — role-aware stats computed in the database with a `groupBy`: applications by status for candidates; jobs posted, total applicants, shortlisted and hired for recruiters.

---

## API

All protected routes take `Authorization: Bearer <token>`.

### Auth

| Method | Route                | Access  | Description               |
| ------ | -------------------- | ------- | ------------------------- |
| POST   | `/api/auth/register` | Public  | Create account, get token |
| POST   | `/api/auth/login`    | Public  | Login, get token          |
| GET    | `/api/auth/me`       | Private | Current user              |
| PUT    | `/api/auth/profile`  | Private | Update own profile        |

### Jobs

| Method | Route                    | Access    | Description                        |
| ------ | ------------------------ | --------- | ---------------------------------- |
| GET    | `/api/jobs`              | Public    | List with search/filter/pagination |
| GET    | `/api/jobs/:id`          | Public    | Single job                         |
| POST   | `/api/jobs`              | Recruiter | Create                             |
| PUT    | `/api/jobs/:id`          | Owner     | Update                             |
| DELETE | `/api/jobs/:id`          | Owner     | Delete (cascades applications)     |
| GET    | `/api/jobs/recruiter/my` | Recruiter | Own jobs + applicant counts        |

`GET /api/jobs` query params: `search`, `location`, `jobType`, `category`, `minSalary`, `maxSalary`, `recruiter`, `sort` (`newest` \| `oldest` \| `salary-high` \| `salary-low`), `page`, `limit`.

`search` matches `title`, `company` and `description` case-insensitively. It also matches `skills`, but only on a whole tag — Postgres text arrays support exact element matching, not substrings.

### Applications

| Method | Route                             | Access    | Description                |
| ------ | --------------------------------- | --------- | -------------------------- |
| POST   | `/api/applications/:jobId`        | Candidate | Apply (blocks duplicates)  |
| GET    | `/api/applications/my`            | Candidate | Own applications           |
| GET    | `/api/applications/job/:jobId`    | Owner     | Applicants for one job     |
| GET    | `/api/applications/recruiter/all` | Recruiter | Applicants across all jobs |
| PUT    | `/api/applications/:id/status`    | Owner     | Change application status  |
| GET    | `/api/applications/stats`         | Private   | Role-aware dashboard stats |

Errors come back as `{ success: false, message }` with a matching HTTP status.

---

## Project structure

One dependency tree at the root — Vercel installs once for both the API and the client build.

```
api/
└── index.js                      Vercel serverless entry; exports the Express app

server/
├── prisma/
│   ├── schema.prisma             models, enums, relations
│   └── migrations/               generated SQL, committed
├── app.js                        builds the Express app (no listen)
├── server.js                     local entry: connect, then listen
├── config/db.js                  Prisma Client singleton + connection check
├── controllers/                  auth · job · application
├── middleware/
│   ├── authMiddleware.js         protect() + authorize(...roles)
│   └── errorMiddleware.js        notFound + Prisma-aware error handler
├── routes/                       authRoutes · jobRoutes · applicationRoutes
├── utils/                        generateToken · asyncHandler
├── constants.js                  job types, statuses, skill parsing
└── seed.js                       demo data

client/src/
├── components/                   Navbar · Footer · JobCard · ProtectedRoute · Avatar
│                                 AuthLayout · Loader · Alert · StatCard · StatusBadge
│                                 EmptyState · Skeleton · Icons
├── pages/                        Home · Login · Register · Jobs · JobDetails
│                                 Dashboard · Profile · JobForm · Applicants · NotFound
├── context/AuthContext.jsx       session state, revalidated against /auth/me
├── services/api.js               axios instance + token interceptor
├── utils/format.js               salary, relative time, initials
├── constants.js
├── App.jsx                       routes
└── main.jsx
```

`api/index.js` exports the same app that `npm run dev` runs locally, so there is one codebase for both. It performs no explicit connect step — Prisma opens its connection lazily on the first query, which is what a cold-started function needs.

---

## Data model

Three tables, all keyed by a UUID `id`.

**users** — `name, email (unique), password (bcrypt), role (enum: candidate | recruiter), skills text[], location, company, resume, bio, createdAt, updatedAt`

**jobs** — `title, company, description, location, salary, jobType, category, skills text[], recruiterId → users.id, createdAt, updatedAt`

**applications** — `jobId → jobs.id, candidateId → users.id, resume, coverLetter, status (enum: Applied | Shortlisted | Interview | Rejected | Hired), createdAt, updatedAt`

`applications` has a unique constraint on `(jobId, candidateId)`, so a candidate cannot apply to the same job twice. Both foreign keys are `ON DELETE CASCADE`: deleting a job removes its applications, and deleting a user removes their jobs and applications.

`role` and `status` are real Postgres enums. `jobType` is text validated in the controller against `JOB_TYPES` — the API values contain hyphens (`"Full-time"`), which are not valid Prisma enum identifiers.

---

## Deployment — Vercel

Frontend and API ship as one project, so they share an origin: the browser calls `/api/...` directly, and neither CORS config nor a `VITE_API_URL` is needed.

```
vercel.json
├── buildCommand      npm run vercel-build
│                     -> prisma generate, prisma migrate deploy, vite build
├── outputDirectory   client/dist        static site
├── functions         api/index.js       the Express app, serverless
└── rewrites          /api/*  -> the function
                      /*      -> index.html   (SPA routes survive a refresh)
```

### Setup

1. **Database** — create a Supabase project. Under **Project Settings → Database → Connection string**, copy the session-mode pooler URI (`aws-0-<region>.pooler.supabase.com:5432`). See the host warnings above.

2. **Vercel** — import the repo, then add these under **Settings → Environment Variables** for Production, Preview and Development:

   | Variable       | Value                       |
   | -------------- | --------------------------- |
   | `DATABASE_URL` | Supabase session-pooler URI |
   | `DIRECT_URL`   | the same URI                |
   | `JWT_SECRET`   | a long random string        |

   Leave `CLIENT_URL` unset — same origin, nothing to allowlist.

3. **Deploy.** The build runs `prisma migrate deploy`, so the schema is applied automatically.

### Notes

- Generate a fresh `JWT_SECRET` for production; never reuse a development one.
- Serverless functions cold-start, so the first request after an idle period is slower.
- If you outgrow the session pooler's connection limit, point `DATABASE_URL` at the transaction pooler (`:6543` with `?pgbouncer=true`) and keep `DIRECT_URL` on `:5432` for migrations.
