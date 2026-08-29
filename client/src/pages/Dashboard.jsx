import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  applicationApi,
  jobApi,
  getErrorMessage,
} from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
import { formatSalary } from "../components/JobCard.jsx";

const CandidateDashboard = ({ stats, applications }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Applications" value={stats.totalApplications} />
      <StatCard label="Pending" value={stats.pending} accent="text-slate-600" />
      <StatCard label="Shortlisted" value={stats.shortlisted} accent="text-amber-600" />
      <StatCard label="Interview" value={stats.interview} accent="text-brand-600" />
      <StatCard label="Hired" value={stats.hired} accent="text-emerald-600" />
    </div>

    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">My applications</h2>

      {applications.length === 0 ? (
        <div className="card mt-4 text-center text-sm text-slate-500">
          You have not applied to any job yet.{" "}
          <Link to="/jobs" className="font-medium text-brand-600">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Applied on</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {app.job ? (
                      <Link to={`/jobs/${app.job._id}`} className="hover:text-brand-600">
                        {app.job.title}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Job removed</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{app.job?.company || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </>
);

const RecruiterDashboard = ({ stats, jobs, onDelete }) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Jobs Posted" value={stats.jobsPosted} />
      <StatCard label="Total Applicants" value={stats.totalApplicants} />
      <StatCard label="Shortlisted" value={stats.shortlisted} accent="text-amber-600" />
      <StatCard label="Hired" value={stats.hired} accent="text-emerald-600" />
    </div>

    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My job posts</h2>
        <Link to="/jobs/new" className="btn-primary">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card mt-4 text-center text-sm text-slate-500">
          No jobs posted yet. Create your first opening.
        </div>
      ) : (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Salary</th>
                <th className="px-5 py-3">Applicants</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <Link to={`/jobs/${job._id}`} className="hover:text-brand-600">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{job.location}</td>
                  <td className="px-5 py-3 text-slate-600">{formatSalary(job.salary)}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600">
                      {job.applicantCount}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/jobs/${job._id}/applicants`}
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        Applicants
                      </Link>
                      <Link
                        to={`/jobs/${job._id}/edit`}
                        className="text-xs font-medium text-slate-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(job._id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  </>
);

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
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      const { data } = await applicationApi.stats();
      setStats(data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isRecruiter ? "Recruiter dashboard" : "Candidate dashboard"}
        </h1>
        <p className="text-sm text-slate-500">Welcome back, {user.name}.</p>
      </header>

      <Alert type="error" message={error} />

      {stats &&
        (isRecruiter ? (
          <RecruiterDashboard stats={stats} jobs={jobs} onDelete={handleDelete} />
        ) : (
          <CandidateDashboard stats={stats} applications={applications} />
        ))}
    </div>
  );
};

export default Dashboard;
