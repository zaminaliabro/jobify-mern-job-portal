import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applicationApi, jobApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { StatsSkeleton, TableSkeleton } from "../components/Skeleton.jsx";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SparkIcon,
  TrashIcon,
  UsersIcon,
} from "../components/Icons.jsx";
import { formatSalary, formatDate, timeAgo } from "../utils/format.js";

/* ------------------------------------------------------------------ */
/*  Candidate                                                          */
/* ------------------------------------------------------------------ */

const CandidateDashboard = ({ stats, applications }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Applications"
        value={stats.totalApplications}
        icon={FileIcon}
        tone="brand"
      />
      <StatCard label="Pending" value={stats.pending} icon={ClockIcon} />
      <StatCard
        label="Shortlisted"
        value={stats.shortlisted}
        icon={SparkIcon}
        tone="amber"
      />
      <StatCard
        label="Interview"
        value={stats.interview}
        icon={UsersIcon}
        tone="brand"
      />
      <StatCard
        label="Hired"
        value={stats.hired}
        icon={CheckCircleIcon}
        tone="emerald"
      />
    </div>

    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">My applications</h2>
        <Link to="/jobs" className="link text-sm">
          Find more jobs
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileIcon}
          title="No applications yet"
          description="Browse open roles and apply — everything you send shows up here."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-ink-100">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-ink-50/60"
            >
              <Avatar name={app.job?.company || "?"} size="sm" />

              <div className="min-w-0 flex-1">
                {app.job ? (
                  <Link
                    to={`/jobs/${app.job.id}`}
                    className="truncate text-sm font-semibold text-ink-900 hover:text-brand-600"
                  >
                    {app.job.title}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-ink-400">
                    Job no longer available
                  </span>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-xs text-ink-500">{app.job?.company || "—"}</span>
                  {app.job?.location && (
                    <span className="meta text-xs">
                      <MapPinIcon size={12} className="text-ink-400" />
                      {app.job.location}
                    </span>
                  )}
                  <span className="meta text-xs text-ink-400">
                    <ClockIcon size={12} />
                    Applied {timeAgo(app.createdAt)}
                  </span>
                </div>
              </div>

              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </section>
  </>
);

/* ------------------------------------------------------------------ */
/*  Recruiter                                                          */
/* ------------------------------------------------------------------ */

const RecruiterDashboard = ({ stats, jobs, onDelete }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Jobs posted"
        value={stats.jobsPosted}
        icon={BriefcaseIcon}
        tone="brand"
      />
      <StatCard label="Total applicants" value={stats.totalApplicants} icon={UsersIcon} />
      <StatCard
        label="Shortlisted"
        value={stats.shortlisted}
        icon={SparkIcon}
        tone="amber"
      />
      <StatCard
        label="Hired"
        value={stats.hired}
        icon={CheckCircleIcon}
        tone="emerald"
      />
    </div>

    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">My job posts</h2>
        <Link to="/jobs/new" className="btn-primary btn-sm">
          <PlusIcon size={15} />
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No jobs posted yet"
          description="Create your first opening and start receiving applications."
          action={
            <Link to="/jobs/new" className="btn-primary">
              <PlusIcon size={15} />
              Post your first job
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-ink-100">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center gap-4 p-4 transition hover:bg-ink-50/60"
            >
              <Avatar name={job.company} size="sm" />

              <div className="min-w-0 flex-1">
                <Link
                  to={`/jobs/${job.id}`}
                  className="truncate text-sm font-semibold text-ink-900 hover:text-brand-600"
                >
                  {job.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="meta text-xs">
                    <MapPinIcon size={12} className="text-ink-400" />
                    {job.location}
                  </span>
                  <span className="text-xs font-medium text-ink-600">
                    {formatSalary(job.salary)}
                  </span>
                  <span className="text-xs text-ink-400">
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              <Link
                to={`/jobs/${job.id}/applicants`}
                className={`pill transition ${
                  job.applicantCount > 0
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "bg-ink-100 text-ink-500"
                }`}
              >
                <UsersIcon size={13} />
                {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="btn-ghost btn-sm"
                  title="Edit job"
                >
                  <PencilIcon size={15} />
                </Link>
                <button
                  onClick={() => onDelete(job.id)}
                  className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                  title="Delete job"
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </>
);

/* ------------------------------------------------------------------ */

const Dashboard = () => {
  const { user, isRecruiter } = useAuth();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const statsRes = await applicationApi.stats();
        if (isRecruiter) {
          const jobsRes = await jobApi.mine();
          if (!cancelled) setJobs(jobsRes.data.jobs);
        } else {
          const appsRes = await applicationApi.mine();
          if (!cancelled) setApplications(appsRes.data.applications);
        }
        if (!cancelled) setStats(statsRes.data.stats);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isRecruiter]);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    try {
      await jobApi.remove(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      const { data } = await applicationApi.stats();
      setStats(data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-up">
      <header className="mb-6">
        <p className="text-sm text-ink-500">
          {isRecruiter ? "Recruiter dashboard" : "Candidate dashboard"}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
      </header>

      <Alert type="error" message={error} />

      {loading ? (
        <>
          <StatsSkeleton count={isRecruiter ? 4 : 5} />
          <div className="mt-8">
            <TableSkeleton rows={4} />
          </div>
        </>
      ) : (
        stats &&
        (isRecruiter ? (
          <RecruiterDashboard stats={stats} jobs={jobs} onDelete={handleDelete} />
        ) : (
          <CandidateDashboard stats={stats} applications={applications} />
        ))
      )}
    </div>
  );
};

export default Dashboard;
