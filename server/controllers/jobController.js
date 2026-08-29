import Job from "../models/Job.js";
import Application from "../models/Application.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all jobs (search + filters + pagination)
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

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }

  if (location) query.location = { $regex: location, $options: "i" };
  if (jobType) query.jobType = jobType;
  if (category) query.category = category;
  if (recruiter) query.recruiter = recruiter;

  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "salary-high": { salary: -1 },
    "salary-low": { salary: 1 },
  };

  const pageNum = Math.max(1, Number(page));
  const perPage = Math.min(50, Math.max(1, Number(limit)));

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate("recruiter", "name email company")
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * perPage)
      .limit(perPage),
    Job.countDocuments(query),
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

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "recruiter",
    "name email company location"
  );

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

  const job = await Job.create({
    title,
    company: company || req.user.company,
    description,
    location,
    salary,
    jobType,
    category,
    skills: normalizeSkills(skills),
    recruiter: req.user._id,
  });

  res.status(201).json({ success: true, job });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (owner recruiter)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this job");
  }

  const fields = [
    "title",
    "company",
    "description",
    "location",
    "salary",
    "jobType",
    "category",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) job[f] = req.body[f];
  });
  if (req.body.skills !== undefined) job.skills = normalizeSkills(req.body.skills);

  const updated = await job.save();

  res.json({ success: true, job: updated });
});

// @desc    Delete job (and its applications)
// @route   DELETE /api/jobs/:id
// @access  Private (owner recruiter)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this job");
  }

  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  res.json({ success: true, message: "Job removed" });
});

// @desc    Jobs posted by the logged-in recruiter
// @route   GET /api/jobs/recruiter/my
// @access  Private (recruiter)
export const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

  const counts = await Application.aggregate([
    { $match: { job: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  res.json({
    success: true,
    count: jobs.length,
    jobs: jobs.map((j) => ({
      ...j.toObject(),
      applicantCount: countMap[j._id.toString()] || 0,
    })),
  });
});

function normalizeSkills(skills) {
  if (skills === undefined) return undefined;
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
