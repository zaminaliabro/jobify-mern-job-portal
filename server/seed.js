import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Job from "./models/Job.js";
import Application from "./models/Application.js";

dotenv.config();

const recruiters = [
  {
    name: "Ayesha Khan",
    email: "recruiter@jobify.com",
    password: "password123",
    role: "recruiter",
    company: "Zamin Tech",
    location: "Karachi",
  },
];

const candidates = [
  {
    name: "Bilal Ahmed",
    email: "candidate@jobify.com",
    password: "password123",
    role: "candidate",
    location: "Lahore",
    skills: ["React", "Node.js", "MongoDB"],
    resume: "https://example.com/resume/bilal.pdf",
  },
  {
    name: "Sana Malik",
    email: "sana@jobify.com",
    password: "password123",
    role: "candidate",
    location: "Islamabad",
    skills: ["Figma", "UI Design", "CSS"],
  },
];

const jobTemplates = [
  {
    title: "React Frontend Developer",
    description:
      "Build and ship customer-facing features with React and Tailwind. You will work closely with design and backend teams.",
    location: "Karachi",
    salary: 150000,
    jobType: "Full-time",
    category: "Frontend",
    skills: ["React", "Tailwind", "JavaScript"],
  },
  {
    title: "Node.js Backend Engineer",
    description:
      "Design REST APIs, model data in MongoDB, and keep our services fast and reliable.",
    location: "Lahore",
    salary: 180000,
    jobType: "Full-time",
    category: "Backend",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    title: "MERN Stack Intern",
    description:
      "Six-month paid internship for someone eager to learn the full MERN stack on real products.",
    location: "Remote",
    salary: 40000,
    jobType: "Internship",
    category: "Full Stack",
    skills: ["React", "Node.js", "Git"],
  },
  {
    title: "Product Designer",
    description:
      "Own the end-to-end design process from research and wireframes to polished UI.",
    location: "Islamabad",
    salary: 130000,
    jobType: "Contract",
    category: "Design",
    skills: ["Figma", "UI Design", "Prototyping"],
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  const createdRecruiters = await User.create(recruiters);
  const createdCandidates = await User.create(candidates);
  const recruiter = createdRecruiters[0];

  const jobs = await Job.create(
    jobTemplates.map((job) => ({
      ...job,
      company: recruiter.company,
      recruiter: recruiter._id,
    }))
  );

  await Application.create([
    {
      job: jobs[0]._id,
      candidate: createdCandidates[0]._id,
      resume: createdCandidates[0].resume,
      coverLetter: "I have 3 years of React experience and would love to join.",
      status: "Shortlisted",
    },
    {
      job: jobs[1]._id,
      candidate: createdCandidates[0]._id,
      coverLetter: "Strong Node and MongoDB background.",
      status: "Interview",
    },
    {
      job: jobs[3]._id,
      candidate: createdCandidates[1]._id,
      coverLetter: "Portfolio attached, 4 years of product design.",
      status: "Applied",
    },
  ]);

  console.log("Seed complete");
  console.log("  Recruiter: recruiter@jobify.com / password123");
  console.log("  Candidate: candidate@jobify.com / password123");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.connection.close();
  process.exit(1);
});
