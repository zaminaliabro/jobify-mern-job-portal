import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { MapPinIcon, WalletIcon, ClockIcon } from "./Icons.jsx";
import { formatSalary, timeAgo } from "../utils/format.js";

const typeTone = {
  "Full-time": "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
  "Part-time": "bg-violet-500/12 text-violet-600 ring-violet-500/25 dark:text-violet-400",
  Internship: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
  Contract: "bg-cyan-500/12 text-cyan-600 ring-cyan-500/25 dark:text-cyan-400",
  Remote: "bg-brand-500/12 text-brand-600 ring-brand-500/25 dark:text-brand-300",
};

const JobCard = ({ job }) => (
  <article className="card group relative flex flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
    <div className="flex items-start gap-3.5">
      <Avatar name={job.company} size="md" />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-ink-900 transition group-hover:text-brand-700">
          <Link to={`/jobs/${job.id}`} className="before:absolute before:inset-0">
            {job.title}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-sm text-ink-500">{job.company}</p>
      </div>

      <span
        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${
          typeTone[job.jobType] || typeTone["Full-time"]
        }`}
      >
        {job.jobType}
      </span>
    </div>

    <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
      {job.description}
    </p>

    {job.skills?.length > 0 && (
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="chip">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="chip text-ink-400">+{job.skills.length - 4}</span>
        )}
      </div>
    )}

    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4">
      <span className="meta">
        <MapPinIcon size={14} className="text-ink-400" />
        {job.location}
      </span>
      <span className="meta font-semibold text-ink-700">
        <WalletIcon size={14} className="text-ink-400" />
        {formatSalary(job.salary)}
      </span>
      <span className="meta ml-auto text-ink-400">
        <ClockIcon size={14} />
        {timeAgo(job.createdAt)}
      </span>
    </div>
  </article>
);

export default JobCard;
