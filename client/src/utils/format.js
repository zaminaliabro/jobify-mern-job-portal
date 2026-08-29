export const formatSalary = (salary) => {
  const n = Number(salary);
  if (!n) return "Not disclosed";
  if (n >= 100000) return `PKR ${(n / 1000).toFixed(0)}k`;
  return `PKR ${n.toLocaleString()}`;
};

export const formatSalaryFull = (salary) => {
  const n = Number(salary);
  return n ? `PKR ${n.toLocaleString()} / month` : "Not disclosed";
};

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [name, secondsPerUnit] of units) {
    const value = Math.floor(seconds / secondsPerUnit);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase() || "?";
