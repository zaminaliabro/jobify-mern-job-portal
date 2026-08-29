# Jobify — PERN Job Portal

A full-stack job portal: candidates browse and apply to jobs, recruiters post jobs and move applicants through a hiring pipeline.

**Stack:** React + Vite + Tailwind + React Router + Axios + Context API · Node + Express · PostgreSQL + Prisma · JWT + bcrypt

---

## Quick start

Requires Node 18+ and a PostgreSQL database (Supabase, Neon, or a local server).

```bash
# 1. Backend
cd server
npm install                       # also runs `prisma generate`
cp .env.example .env              # then fill DATABASE_URL / DIRECT_URL / JWT_SECRET
npm run db:migrate                # creates the tables
npm run seed                      # optional: demo users, jobs, applications
npm run dev                       # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                       # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000`, so no CORS setup is needed in development.

### Demo accounts (after `npm run seed`)

| Role      | Email                | Password    |
| --------- | -------------------- | ----------- |
| Recruiter | recruiter@jobify.com | password123 |
| Candidate | candidate@jobify.com | password123 |

---

## Environment variables (`server/.env`)

| Key              | Notes                                                          |
| ---------------- | -------------------------------------------------------------- |
| `PORT`           | `5000`                                                         |
| `DATABASE_URL`   | Pooled connection (Supabase port `6543`), used by the app       |
| `DIRECT_URL`     | Direct connection (port `5432`), used by `prisma migrate`       |
| `JWT_SECRET`     | Any long random string                                          |
| `JWT_EXPIRES_IN` | `7d`                                                            |
| `CLIENT_URL`     | CORS allowlist — one origin, or several separated by commas     |

Prisma needs both URLs on Supabase: pgbouncer (the pooled URL) cannot run the DDL
that migrations require, so schema changes go over `DIRECT_URL` while the running
app uses the pool.

### Prisma commands

```bash
npm run db:migrate     # create + apply a migration in development
npm run db:deploy      # apply committed migrations (used in production)
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

```
server/
├── prisma/
│   ├── schema.prisma             models, enums, relations
│   └── migrations/               generated SQL, committed
├── config/db.js                  Prisma Client singleton + connection check
├── controllers/                  auth · job · application
├── middleware/
│   ├── authMiddleware.js         protect() + authorize(...roles)
│   └── errorMiddleware.js        notFound + Prisma-aware error handler
├── routes/                       authRoutes · jobRoutes · applicationRoutes
├── utils/                        generateToken · asyncHandler
├── constants.js                  job types, statuses, skill parsing
├── seed.js                       demo data
└── server.js

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

---

## Data model

Three tables, all keyed by a UUID `id`.

**users** — `name, email (unique), password (bcrypt), role (enum: candidate | recruiter), skills text[], location, company, resume, bio, createdAt, updatedAt`

**jobs** — `title, company, description, location, salary, jobType, category, skills text[], recruiterId → users.id, createdAt, updatedAt`

**applications** — `jobId → jobs.id, candidateId → users.id, resume, coverLetter, status (enum: Applied | Shortlisted | Interview | Rejected | Hired), createdAt, updatedAt`

`applications` has a unique constraint on `(jobId, candidateId)`, so a candidate cannot apply to the same job twice. Both foreign keys are `ON DELETE CASCADE`: deleting a job removes its applications, and deleting a user removes their jobs and applications.

`role` and `status` are real Postgres enums. `jobType` is text validated in the controller against `JOB_TYPES` — the API values contain hyphens (`"Full-time"`), which are not valid Prisma enum identifiers.

---

## Production build

```bash
cd client && npm run build     # outputs client/dist
cd ../server && npm start
```

---

## Deployment

The frontend and backend deploy separately. Config for both is committed:
`vercel.json` (frontend) and `render.yaml` (backend).

### 1. Database — Supabase

Create a project, then **Project Settings → Database → Connection string**. Copy
both the pooled URI (port `6543`) and the direct URI (port `5432`).

### 2. Backend — Render

**New → Blueprint**, pick this repo. Render reads `render.yaml`: it builds from
`server/`, runs `prisma migrate deploy`, and generates a secure `JWT_SECRET`.
Fill three values in the dashboard:

| Variable       | Value                                                     |
| -------------- | --------------------------------------------------------- |
| `DATABASE_URL` | Supabase pooled URI (`6543`)                               |
| `DIRECT_URL`   | Supabase direct URI (`5432`)                               |
| `CLIENT_URL`   | your Vercel URL — comma-separated to allow several origins |

`CLIENT_URL` drives the CORS allowlist. Leave it unset only in development, where
an empty value allows every origin.

### 3. Frontend — Vercel

`vercel.json` at the repo root points the build at `client/` and rewrites
non-API paths to `index.html`, so client-side routes survive a refresh. Add one
environment variable in **Settings → Environment Variables**:

```
VITE_API_URL = https://<your-service>.onrender.com/api
```

Then **redeploy** — Vite bakes env vars in at build time, so adding the variable
alone will not change an existing build.

### Notes

- Generate a fresh `JWT_SECRET` for production; never reuse the development one.
- Render's free tier sleeps after ~15 minutes idle, so the first request is slow.
- Prefer a single host? Serve `client/dist` from Express and skip Vercel entirely.
