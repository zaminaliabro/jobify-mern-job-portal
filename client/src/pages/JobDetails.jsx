import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jobApi, applicationApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import Alert from "../components/Alert.jsx";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  SendIcon,
  TrashIcon,
  UsersIcon,
  WalletIcon,
} from "../components/Icons.jsx";
import { formatSalaryFull, timeAgo, formatDate } from "../utils/format.js";

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

  if (loading) return <Loader label="Loading job…" />;

  if (!job) {
    return (
      <EmptyState
        icon={BriefcaseIcon}
        title="Job not found"
        description={error || "This role may have been removed by the recruiter."}
        action={
          <Link to="/jobs" className="btn-primary">
            Browse other jobs
          </Link>
        }
      />
    );
  }

  const facts = [
    { icon: WalletIcon, label: "Salary", value: formatSalaryFull(job.salary) },
    { icon: MapPinIcon, label: "Location", value: job.location },
    { icon: BriefcaseIcon, label: "Job type", value: job.jobType },
    { icon: UsersIcon, label: "Category", value: job.category },
  ];

  return (
    <div className="animate-fade-up">
      <Link
        to="/jobs"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-brand-600"
      >
        <ArrowLeftIcon size={15} />
        Back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ---------- main column ---------- */}
        <div className="space-y-5">
          <div className="card-p">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={job.company} size="lg" />

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold leading-tight">{job.title}</h1>
                <p className="mt-1 text-[15px] font-medium text-ink-600">{job.company}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <span className="meta">
                    <MapPinIcon size={14} className="text-ink-400" />
                    {job.location}
                  </span>
                  <span className="meta">
                    <BriefcaseIcon size={14} className="text-ink-400" />
                    {job.jobType}
                  </span>
                  <span className="meta">
                    <ClockIcon size={14} className="text-ink-400" />
                    Posted {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-100 pt-5 sm:grid-cols-4">
              {facts.map(({ icon: IconCmp, label, value }) => (
                <div key={label}>
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    <IconCmp size={13} />
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-ink-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-p">
            <h2 className="text-base font-semibold">About this role</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-600">
              {job.description}
            </p>

            {job.skills?.length > 0 && (
              <>
                <h2 className="mt-7 text-base font-semibold">Required skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1.5 text-[13px] font-medium text-ink-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ---------- apply form ---------- */}
          {isCandidate && showForm && (
            <div className="card-p animate-fade-up" id="apply">
              <h2 className="text-base font-semibold">Apply for this role</h2>
              <p className="mt-1 text-sm text-ink-500">
                Your profile is shared with the recruiter along with the details below.
              </p>

              <form onSubmit={handleApply} className="mt-5 space-y-4">
                <div>
                  <label className="label" htmlFor="resume">
                    Resume link
                  </label>
                  <input
                    id="resume"
                    className="input"
                    placeholder="https://drive.google.com/…"
                    value={form.resume}
                    onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  />
                  <p className="hint">
                    Paste a public link to your CV. Saved on your profile for next time.
                  </p>
                </div>

                <div>
                  <label className="label" htmlFor="coverLetter">
                    Cover letter
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={6}
                    className="input resize-y"
                    placeholder="Why are you a good fit for this role?"
                    value={form.coverLetter}
                    onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary" disabled={applying}>
                    <SendIcon size={15} />
                    {applying ? "Submitting…" : "Submit application"}
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
            </div>
          )}
        </div>

        {/* ---------- sticky sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-p">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Compensation
            </p>
            <p className="mt-1.5 text-xl font-bold text-ink-900">
              {formatSalaryFull(job.salary)}
            </p>

            <div className="mt-5 space-y-2.5">
              <Alert type="error" message={error} />
              <Alert type="success" message={success} />

              {!isAuthenticated && (
                <>
                  <Link to="/login" className="btn-primary w-full">
                    Login to apply
                  </Link>
                  <p className="text-center text-xs text-ink-400">
                    New here?{" "}
                    <Link to="/register" className="link">
                      Create an account
                    </Link>
                  </p>
                </>
              )}

              {isCandidate && !success && !showForm && (
                <button
                  className="btn-primary w-full"
                  onClick={() => setShowForm(true)}
                >
                  <SendIcon size={15} />
                  Apply now
                </button>
              )}

              {isCandidate && success && (
                <Link to="/dashboard" className="btn-outline w-full">
                  <CheckCircleIcon size={15} className="text-emerald-600" />
                  View my applications
                </Link>
              )}

              {isRecruiter && !isOwner && (
                <p className="rounded-lg bg-ink-50 px-3 py-2.5 text-center text-xs text-ink-500">
                  You are signed in as a recruiter, so you cannot apply.
                </p>
              )}

              {isOwner && (
                <>
                  <Link
                    to={`/jobs/${job._id}/applicants`}
                    className="btn-primary w-full"
                  >
                    <UsersIcon size={15} />
                    View applicants
                  </Link>
                  <Link to={`/jobs/${job._id}/edit`} className="btn-outline w-full">
                    <PencilIcon size={15} />
                    Edit job
                  </Link>
                  <button onClick={handleDelete} className="btn-danger w-full">
                    <TrashIcon size={15} />
                    Delete job
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card-p">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Posted by
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={job.recruiter?.name || job.company} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {job.recruiter?.name || "Recruiter"}
                </p>
                <p className="truncate text-xs text-ink-500">{job.company}</p>
              </div>
            </div>
            <p className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-400">
              Listed on {formatDate(job.createdAt)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;
