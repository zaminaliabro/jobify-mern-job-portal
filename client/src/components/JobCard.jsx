import { Link } from "react-router-dom";

export const formatSalary = (salary) =>
  salary ? `PKR ${Number(salary).toLocaleString()}` : "Not disclosed";

const JobCard = ({ job }) => (
  <article className="card transition hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
        <p className="text-sm text-slate-500">
          {job.company} · {job.location}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
        {job.jobType}
      </span>
    </div>

    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

    {job.skills?.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {job.skills.slice(0, 5).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
          >
            {skill}
          </span>
        ))}
      </div>
    )}

    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700">
        {formatSalary(job.salary)}
      </span>
      <Link to={`/jobs/${job._id}`} className="btn-primary">
        View details
      </Link>
    </div>
  </article>
);

export default JobCard;
