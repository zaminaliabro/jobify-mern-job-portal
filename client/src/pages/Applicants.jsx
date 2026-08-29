import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applicationApi, getErrorMessage } from "../services/api.js";
import Avatar from "../components/Avatar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { TableSkeleton } from "../components/Skeleton.jsx";
import {
  ArrowLeftIcon,
  ClockIcon,
  ExternalIcon,
  MapPinIcon,
  UsersIcon,
} from "../components/Icons.jsx";
import { APPLICATION_STATUSES } from "../constants.js";
import { timeAgo } from "../utils/format.js";

const Applicants = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    applicationApi
      .forJob(id)
      .then(({ data }) => {
        setJob(data.job);
        setApplications(data.applications);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
    applications.forEach((a) => (byStatus[a.status] += 1));
    return byStatus;
  }, [applications]);

  const visible =
    tab === "All" ? applications : applications.filter((a) => a.status === tab);

  const handleStatusChange = async (applicationId, status) => {
    setError("");
    setSavingId(applicationId);
    try {
      await applicationApi.updateStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-brand-600"
      >
        <ArrowLeftIcon size={15} />
        Back to dashboard
      </Link>

      <header className="mb-6">
        <p className="text-sm text-ink-500">Applicants</p>
        <h1 className="mt-0.5 text-2xl font-bold">{job?.title || "Loading…"}</h1>
        {job && (
          <p className="mt-1 text-sm text-ink-500">
            {job.company} · {applications.length} candidate
            {applications.length === 1 ? "" : "s"} applied
          </p>
        )}
      </header>

      <Alert type="error" message={error} />

      {loading ? (
        <TableSkeleton rows={3} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No applications yet"
          description="Once candidates apply to this role, they'll show up here."
          action={
            <Link to={`/jobs/${id}`} className="btn-outline">
              View the job post
            </Link>
          }
        />
      ) : (
        <>
          {/* ---------- status tabs ---------- */}
          <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto border-b border-ink-200 pb-px">
            {["All", ...APPLICATION_STATUSES].map((status) => {
              const count = status === "All" ? applications.length : counts[status];
              const active = tab === status;
              return (
                <button
                  key={status}
                  onClick={() => setTab(status)}
                  className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  {status}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                      active ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title={`No candidates in "${tab}"`}
              description="Move someone into this stage from another tab."
            />
          ) : (
            <div className="space-y-4">
              {visible.map((app) => (
                <article key={app.id} className="card-p">
                  <div className="flex flex-wrap items-start gap-4">
                    <Avatar name={app.candidate?.name || "?"} size="md" />

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-ink-900">
                        {app.candidate?.name || "Unknown candidate"}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <a
                          href={`mailto:${app.candidate?.email}`}
                          className="text-[13px] text-ink-500 hover:text-brand-600"
                        >
                          {app.candidate?.email}
                        </a>
                        {app.candidate?.location && (
                          <span className="meta text-xs">
                            <MapPinIcon size={12} className="text-ink-400" />
                            {app.candidate.location}
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

                  {app.candidate?.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {app.candidate.skills.map((skill) => (
                        <span key={skill} className="chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {app.coverLetter && (
                    <div className="mt-4 rounded-lg bg-ink-50 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                        Cover letter
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                    {app.resume ? (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline btn-sm"
                      >
                        <ExternalIcon size={14} />
                        View resume
                      </a>
                    ) : (
                      <span className="text-[13px] text-ink-400">No resume link</span>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-ink-500">Move to</span>
                      <select
                        className="input w-40 py-1.5 text-[13px]"
                        value={app.status}
                        disabled={savingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applicants;
