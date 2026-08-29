import Application, { APPLICATION_STATUSES } from "../models/Application.js";
import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Private (candidate)
export const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const already = await Application.findOne({
    job: job._id,
    candidate: req.user._id,
  });

  if (already) {
    res.status(400);
    throw new Error("You have already applied to this job");
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    resume: req.body.resume || req.user.resume,
    coverLetter: req.body.coverLetter || "",
  });

  res.status(201).json({ success: true, application });
});

// @desc    Applications of the logged-in candidate
// @route   GET /api/applications/my
// @access  Private (candidate)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({
      path: "job",
      select: "title company location jobType salary category recruiter",
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
});

// @desc    Applicants for one job
// @route   GET /api/applications/job/:jobId
// @access  Private (owner recruiter)
export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view applicants for this job");
  }

  const applications = await Application.find({ job: job._id })
    .populate("candidate", "name email skills location resume bio")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: applications.length,
    job: { _id: job._id, title: job.title, company: job.company },
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

  const application = await Application.findById(req.params.id).populate("job");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  if (application.job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  application.status = status;
  await application.save();

  res.json({ success: true, application });
});

// @desc    Dashboard stats for current user (role aware)
// @route   GET /api/applications/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  if (req.user.role === "candidate") {
    const rows = await Application.aggregate([
      { $match: { candidate: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
    rows.forEach((r) => (byStatus[r._id] = r.count));

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

  const jobs = await Job.find({ recruiter: req.user._id }).select("_id");
  const jobIds = jobs.map((j) => j._id);

  const rows = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => (byStatus[r._id] = r.count));

  res.json({
    success: true,
    role: "recruiter",
    stats: {
      jobsPosted: jobs.length,
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
  const jobs = await Job.find({ recruiter: req.user._id }).select("_id");

  const applications = await Application.find({ job: { $in: jobs.map((j) => j._id) } })
    .populate("candidate", "name email skills location resume")
    .populate("job", "title company location")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
});
