import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jobApi, applicationApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatSalary } from "../components/JobCard.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applying, setApplying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resume: "", coverLetter: "" });

  useEffect(() => {
    setLoading(true);
    jobApi
      .get(id)
      .then(({ data }) => setJob(data.job))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.resume) setForm((f) => ({ ...f, resume: user.resume }));
  }, [user]);

  const isOwner = isRecruiter && job?.recruiter?._id === user?._id;

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setApplying(true);
    try {
      await applicationApi.apply(id, form);
      setSuccess("Application submitted. Track it from your dashboard.");
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this job and all its applications?")) return;
    try {
      await jobApi.remove(id);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading job..." />;
  if (!job) return <Alert type="error" message={error || "Job not found"} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/jobs" className="text-sm text-brand-600">
        Back to jobs
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-500">
              {job.company} · {job.location}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {job.jobType}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase text-slate-400">Salary</dt>
            <dd className="mt-1 text-sm font-medium">{formatSalary(job.salary)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Category</dt>
            <dd className="mt-1 text-sm font-medium">{job.category}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Location</dt>
            <dd className="mt-1 text-sm font-medium">{job.location}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Posted</dt>
            <dd className="mt-1 text-sm font-medium">
              {new Date(job.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>

        <section className="mt-6">
          <h2 className="text-base font-semibold text-slate-900">Job description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {job.description}
          </p>
        </section>

        {job.skills?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-semibold text-slate-900">Required skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 space-y-3">
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />

          {!isAuthenticated && (
            <Link to="/login" className="btn-primary">
              Login to apply
            </Link>
          )}

          {isCandidate && !showForm && !success && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Apply for this job
            </button>
          )}

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/jobs/${job._id}/edit`} className="btn-outline">
                Edit job
              </Link>
              <Link to={`/jobs/${job._id}/applicants`} className="btn-primary">
                View applicants
              </Link>
              <button onClick={handleDelete} className="btn-danger">
                Delete job
              </button>
            </div>
          )}
        </div>

        {isCandidate && showForm && (
          <form onSubmit={handleApply} className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <div>
              <label className="label" htmlFor="resume">
                Resume link
              </label>
              <input
                id="resume"
                className="input"
                placeholder="https://drive.google.com/..."
                value={form.resume}
                onChange={(e) => setForm({ ...form, resume: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="coverLetter">
                Cover letter
              </label>
              <textarea
                id="coverLetter"
                rows={5}
                className="input"
                placeholder="Why are you a good fit for this role?"
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={applying}>
                {applying ? "Submitting..." : "Submit application"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
