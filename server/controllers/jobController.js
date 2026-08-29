import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { JOB_TYPES, normalizeSkills } from "../constants.js";

const recruiterSelect = {
  select: { id: true, name: true, email: true, company: true, location: true },
};

const sortMap = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "salary-high": { salary: "desc" },
  "salary-low": { salary: "asc" },
};

const assertJobType = (jobType, res) => {
  if (jobType !== undefined && !JOB_TYPES.includes(jobType)) {
    res.status(400);
    throw new Error(`Job type must be one of: ${JOB_TYPES.join(", ")}`);
  }
};

// @desc    List jobs (search + filters + pagination)
// @route   GET /api/jobs
// @access  Public
export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    jobType,
    category,
    minSalary,
    maxSalary,
    recruiter,
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      // Scalar string lists only support exact element matching in Prisma,
      // so a skill matches on the whole tag rather than a substring.
      { skills: { has: search } },
    ];
  }

  if (location) where.location = { contains: location, mode: "insensitive" };
  if (jobType) where.jobType = jobType;
  if (category) where.category = category;
  if (recruiter) where.recruiterId = recruiter;

  if (minSalary || maxSalary) {
    where.salary = {};
    if (minSalary) where.salary.gte = Number(minSalary);
    if (maxSalary) where.salary.lte = Number(maxSalary);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { recruiter: recruiterSelect },
      orderBy: sortMap[sort] || sortMap.newest,
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    prisma.job.count({ where }),
  ]);

  res.json({
    success: true,
    count: jobs.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / perPage) || 1,
    jobs,
  });
});

// @desc    Single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { recruiter: recruiterSelect },
  });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json({ success: true, job });
});

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (recruiter)
export const createJob = asyncHandler(async (req, res) => {
  const { title, company, description, location, salary, jobType, category, skills } =
    req.body;

  if (!title || !description || !location) {
    res.status(400);
    throw new Error("Title, description and location are required");
  }

  assertJobType(jobType, res);

  const job = await prisma.job.create({
    data: {
      title: String(title).trim(),
      company: String(company || req.user.company || "").trim(),
      description,
      location: String(location).trim(),
      salary: Number(salary) || 0,
      jobType: jobType || "Full-time",
      category: category || "Other",
      skills: normalizeSkills(skills) ?? [],
      recruiterId: req.user.id,
    },
    include: { recruiter: recruiterSelect },
  });

  res.status(201).json({ success: true, job });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (owner recruiter)
export const updateJob = asyncHandler(async (req, res) => {
  const existing = await prisma.job.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (existing.recruiterId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this job");
  }

  assertJobType(req.body.jobType, res);

  const data = {};
  ["title", "company", "description", "location", "jobType", "category"].forEach((f) => {
    if (req.body[f] !== undefined) data[f] = req.body[f];
  });
  if (req.body.salary !== undefined) data.salary = Number(req.body.salary) || 0;

  const nextSkills = normalizeSkills(req.body.skills);
  if (nextSkills !== undefined) data.skills = nextSkills;

  const job = await prisma.job.update({
    where: { id: req.params.id },
    data,
    include: { recruiter: recruiterSelect },
  });

  res.json({ success: true, job });
});

// @desc    Delete job (applications cascade in the schema)
// @route   DELETE /api/jobs/:id
// @access  Private (owner recruiter)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.recruiterId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this job");
  }

  await prisma.job.delete({ where: { id: job.id } });

  res.json({ success: true, message: "Job removed" });
});

// @desc    Jobs posted by the logged-in recruiter
// @route   GET /api/jobs/recruiter/my
// @access  Private (recruiter)
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  res.json({
    success: true,
    count: jobs.length,
    jobs: jobs.map(({ _count, ...job }) => ({
      ...job,
      applicantCount: _count.applications,
    })),
  });
});
