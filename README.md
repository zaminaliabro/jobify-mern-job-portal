# Jobify — MERN Job Portal

A full-stack job portal: candidates browse and apply to jobs, recruiters post jobs and move applicants through a hiring pipeline.

**Stack:** React + Vite + Tailwind + React Router + Axios + Context API · Node + Express + MongoDB + Mongoose · JWT + bcrypt

---

## Quick start

Requires Node 18+ and a running MongoDB (local `mongod` or an Atlas URI).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET
npm run seed              # optional: demo users, jobs, applications
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000`, so no CORS setup is needed in development.

### Demo accounts (after `npm run seed`)

| Role      | Email                   | Password    |
| --------- | ----------------------- | ----------- |
| Recruiter | recruiter@jobify.com    | password123 |
| Candidate | candidate@jobify.com    | password123 |

---

## Environment variables (`server/.env`)

| Key              | Example                                 |
| ---------------- | --------------------------------------- |
| `PORT`           | `5000`                                  |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/jobify`      |
| `JWT_SECRET`     | any long random string                  |
| `JWT_EXPIRES_IN` | `7d`                                    |
| `CLIENT_URL`     | `http://localhost:5173`                 |

---

## Features

**Auth** — register (candidate or recruiter), login, logout, JWT in `localStorage`, bcrypt-hashed passwords, protected routes on both client and server.

**Candidate** — browse jobs, keyword search, filter by location / job type / salary range / category, sort, paginate, view job details, apply with resume link + cover letter (one application per job), track every application and its status, edit profile and skills.

**Recruiter** — post, edit and delete jobs (deleting a job removes its applications), see applicant counts per job, review each applicant's profile, skills, resume and cover letter, and move them through `Applied → Shortlisted → Interview → Rejected → Hired`.

**Dashboard** — role-aware stats computed server-side with a Mongo aggregation: applications by status for candidates; jobs posted, total applicants, shortlisted and hired for recruiters.

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

| Method | Route                     | Access    | Description                        |
| ------ | ------------------------- | --------- | ---------------------------------- |
| GET    | `/api/jobs`               | Public    | List with search/filter/pagination |
| GET    | `/api/jobs/:id`           | Public    | Single job                         |
| POST   | `/api/jobs`               | Recruiter | Create                             |
| PUT    | `/api/jobs/:id`           | Owner     | Update                             |
| DELETE | `/api/jobs/:id`           | Owner     | Delete (cascades applications)     |
| GET    | `/api/jobs/recruiter/my`  | Recruiter | Own jobs + applicant counts        |

`GET /api/jobs` query params: `search`, `location`, `jobType`, `category`, `minSalary`, `maxSalary`, `recruiter`, `sort` (`newest` \| `oldest` \| `salary-high` \| `salary-low`), `page`, `limit`.

### Applications

| Method | Route                              | Access    | Description                  |
| ------ | ---------------------------------- | --------- | ---------------------------- |
| POST   | `/api/applications/:jobId`         | Candidate | Apply (blocks duplicates)    |
| GET    | `/api/applications/my`             | Candidate | Own applications             |
| GET    | `/api/applications/job/:jobId`     | Owner     | Applicants for one job       |
| GET    | `/api/applications/recruiter/all`  | Recruiter | Applicants across all jobs   |
| PUT    | `/api/applications/:id/status`     | Owner     | Change application status    |
| GET    | `/api/applications/stats`          | Private   | Role-aware dashboard stats   |

Errors come back as `{ success: false, message }` with a matching HTTP status.

---

## Project structure

```
server/
├── config/db.js                  Mongo connection
├── controllers/                  auth · job · application
├── middleware/
│   ├── authMiddleware.js         protect() + authorize(...roles)
│   └── errorMiddleware.js        notFound + central error handler
├── models/                       User · Job · Application
├── routes/                       authRoutes · jobRoutes · applicationRoutes
├── utils/                        generateToken · asyncHandler
├── seed.js                       demo data
└── server.js

client/src/
├── components/                   Navbar · Footer · JobCard · ProtectedRoute
│                                 Loader · Alert · StatCard · StatusBadge
├── pages/                        Home · Login · Register · Jobs · JobDetails
│                                 Dashboard · Profile · JobForm · Applicants · NotFound
├── context/AuthContext.jsx       session state, revalidated against /auth/me
├── services/api.js               axios instance + token interceptor
├── constants.js
├── App.jsx                       routes
└── main.jsx
```

---

## Data models

**User** — `name, email (unique), password (hashed, select:false), role: candidate|recruiter, skills[], location, company, resume, bio, timestamps`

**Job** — `title, company, description, location, salary, jobType, category, skills[], recruiter → User, timestamps`

**Application** — `job → Job, candidate → User, resume, coverLetter, status, timestamps` with a unique compound index on `(job, candidate)` so a candidate cannot apply twice.

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

### 1. Database — MongoDB Atlas

Create a free cluster, add a database user, and under **Network Access** allow
`0.0.0.0/0` so your host can reach it. Copy the connection string.

### 2. Backend — Render

Render reads `render.yaml` automatically: **New → Blueprint**, pick this repo.
It builds from `server/`, generates a secure `JWT_SECRET` for you, and leaves two
values for you to fill in the dashboard:

| Variable     | Value                                                     |
| ------------ | --------------------------------------------------------- |
| `MONGO_URI`  | your Atlas connection string                               |
| `CLIENT_URL` | your Vercel URL — comma-separated to allow several origins |

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
