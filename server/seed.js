import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import prisma from "./config/db.js";

dotenv.config();

const password = await bcrypt.hash("password123", 10);

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
      "Design REST APIs, model data in PostgreSQL, and keep our services fast and reliable.",
    location: "Lahore",
    salary: 180000,
    jobType: "Full-time",
    category: "Backend",
    skills: ["Node.js", "Express", "PostgreSQL"],
  },
  {
    title: "PERN Stack Intern",
    description:
      "Six-month paid internship for someone eager to learn the full PERN stack on real products.",
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
  // Applications and jobs cascade from users, but clear explicitly so the
  // script is readable and order-independent.
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const recruiter = await prisma.user.create({
    data: {
      name: "Ayesha Khan",
      email: "recruiter@jobify.com",
      password,
      role: "recruiter",
      company: "Zamin Tech",
      location: "Karachi",
    },
  });

  const bilal = await prisma.user.create({
    data: {
      name: "Bilal Ahmed",
      email: "candidate@jobify.com",
      password,
      role: "candidate",
      location: "Lahore",
      skills: ["React", "Node.js", "PostgreSQL"],
      resume: "https://example.com/resume/bilal.pdf",
    },
  });

  const sana = await prisma.user.create({
    data: {
      name: "Sana Malik",
      email: "sana@jobify.com",
      password,
      role: "candidate",
      location: "Islamabad",
      skills: ["Figma", "UI Design", "CSS"],
    },
  });

  const jobs = [];
  for (const template of jobTemplates) {
    jobs.push(
      await prisma.job.create({
        data: { ...template, company: recruiter.company, recruiterId: recruiter.id },
      })
    );
  }

  await prisma.application.createMany({
    data: [
      {
        jobId: jobs[0].id,
        candidateId: bilal.id,
        resume: bilal.resume,
        coverLetter: "I have 3 years of React experience and would love to join.",
        status: "Shortlisted",
      },
      {
        jobId: jobs[1].id,
        candidateId: bilal.id,
        coverLetter: "Strong Node and PostgreSQL background.",
        status: "Interview",
      },
      {
        jobId: jobs[3].id,
        candidateId: sana.id,
        coverLetter: "Portfolio attached, 4 years of product design.",
        status: "Applied",
      },
    ],
  });

  console.log("Seed complete");
  console.log(`  ${jobs.length} jobs, 3 users, 3 applications`);
  console.log("  Recruiter: recruiter@jobify.com / password123");
  console.log("  Candidate: candidate@jobify.com / password123");
};

seed()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
