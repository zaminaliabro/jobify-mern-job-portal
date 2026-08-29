-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('candidate', 'recruiter');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'candidate',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "resume" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" INTEGER NOT NULL DEFAULT 0,
    "jobType" TEXT NOT NULL DEFAULT 'Full-time',
    "category" TEXT NOT NULL DEFAULT 'Other',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recruiterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "resume" TEXT NOT NULL DEFAULT '',
    "coverLetter" TEXT NOT NULL DEFAULT '',
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'Applied',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "jobs_recruiterId_idx" ON "public"."jobs"("recruiterId");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "public"."jobs"("createdAt");

-- CreateIndex
CREATE INDEX "applications_candidateId_idx" ON "public"."applications"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_candidateId_key" ON "public"."applications"("jobId", "candidateId");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
