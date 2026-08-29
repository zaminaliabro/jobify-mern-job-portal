import prisma from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { APPLICATION_STATUSES } from "../constants.js";

const candidateSelect = {
  select: {
    id: true,
    name: true,
    email: true,
    skills: true,
    location: true,
    resume: true,
    bio: true,
  },
};

// Turn [{ status, _count }] into a full zero-filled map.
const tallyByStatus = (groups) => {
  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  groups.forEach((g) => (byStatus[g.status] = g._count._all));
  return byStatus;
};

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (candidate)
export const applyToJob = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const already = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId: job.id, candidateId: req.user.id } },
  });

  if (already) {
    res.status(400);
    throw new Error("You have already applied to this job");
  }

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: req.user.id,
      resume: req.body.resume || req.user.resume || "",
      coverLetter: req.body.coverLetter || "",
    },
  });

  res.status(201).json({ success: true, application });
});

// @desc    Applications of the logged-in candidate
// @route   GET /api/applications/my
// @access  Private (candidate)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { candidateId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          jobType: true,
          salary: true,
          category: true,
          recruiterId: true,
        },
      },
    },
  });

  res.json({ success: true, count: applications.length, applications });
});

// @desc    Applicants for one job
// @route   GET /api/applications/job/:jobId
// @access  Private (owner recruiter)
export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.recruiterId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to view applicants for this job");
  }

  const applications = await prisma.application.findMany({
    where: { jobId: job.id },
    orderBy: { createdAt: "desc" },
    include: { candidate: candidateSelect },
  });

  res.json({
    success: true,
    count: applications.length,
    job: { id: job.id, title: job.title, company: job.company },
    applications,
  });
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (owner recruiter)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!APPLICATION_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${APPLICATION_STATUSES.join(", ")}`);
  }

  const existing = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: { job: { select: { recruiterId: true } } },
  });

  if (!existing) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (existing.job.recruiterId !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
    include: { candidate: candidateSelect },
  });

  res.json({ success: true, application });
});

// @desc    Role-aware dashboard stats
// @route   GET /api/applications/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  if (req.user.role === "candidate") {
    const groups = await prisma.application.groupBy({
      by: ["status"],
      where: { candidateId: req.user.id },
      _count: { _all: true },
    });

    const byStatus = tallyByStatus(groups);

    return res.json({
      success: true,
      role: "candidate",
      stats: {
        totalApplications: Object.values(byStatus).reduce((a, b) => a + b, 0),
        pending: byStatus.Applied,
        shortlisted: byStatus.Shortlisted,
        interview: byStatus.Interview,
        rejected: byStatus.Rejected,
        hired: byStatus.Hired,
        byStatus,
      },
    });
  }

  const [jobsPosted, groups] = await Promise.all([
    prisma.job.count({ where: { recruiterId: req.user.id } }),
    prisma.application.groupBy({
      by: ["status"],
      where: { job: { recruiterId: req.user.id } },
      _count: { _all: true },
    }),
  ]);

  const byStatus = tallyByStatus(groups);

  res.json({
    success: true,
    role: "recruiter",
    stats: {
      jobsPosted,
      totalApplicants: Object.values(byStatus).reduce((a, b) => a + b, 0),
      shortlisted: byStatus.Shortlisted,
      interview: byStatus.Interview,
      rejected: byStatus.Rejected,
      hired: byStatus.Hired,
      byStatus,
    },
  });
});

// @desc    All applicants across the recruiter's jobs
// @route   GET /api/applications/recruiter/all
// @access  Private (recruiter)
export const getRecruiterApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { job: { recruiterId: req.user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      candidate: candidateSelect,
      job: { select: { id: true, title: true, company: true, location: true } },
    },
  });

  res.json({ success: true, count: applications.length, applications });
});
