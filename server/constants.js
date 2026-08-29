export const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

export const APPLICATION_STATUSES = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
];

export const ROLES = ["candidate", "recruiter"];

// "React, Node.js" | ["React","Node.js"] -> ["React","Node.js"]
export const normalizeSkills = (skills) => {
  if (skills === undefined || skills === null) return undefined;
  const list = Array.isArray(skills) ? skills : String(skills).split(",");
  return list.map((skill) => String(skill).trim()).filter(Boolean);
};
