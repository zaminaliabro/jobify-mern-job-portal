import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applicationApi, getErrorMessage } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
import { APPLICATION_STATUSES } from "../constants.js";

const Applicants = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

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

  const handleStatusChange = async (applicationId, status) => {
    setError("");
    setSavingId(applicationId);
    try {
      await applicationApi.updateStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader label="Loading applicants..." />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-brand-600">
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Applicants{job ? ` — ${job.title}` : ""}
        </h1>
        <p className="text-sm text-slate-500">
          {applications.length} candidate{applications.length === 1 ? "" : "s"} applied
        </p>
      </div>

      <Alert type="error" message={error} />

      {applications.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          No applications for this job yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <article key={app._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {app.candidate?.name || "Unknown candidate"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {app.candidate?.email}
                    {app.candidate?.location ? ` · ${app.candidate.location}` : ""}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              {app.candidate?.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {app.coverLetter && (
                <div className="mt-4">
                  <h3 className="text-xs uppercase text-slate-400">Cover letter</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                    {app.coverLetter}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-4 text-sm">
                  {app.resume ? (
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-600 hover:underline"
                    >
                      View resume
                    </a>
                  ) : (
                    <span className="text-slate-400">No resume link</span>
                  )}
                  <span className="text-slate-400">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Status</span>
                  <select
                    className="input w-40"
                    value={app.status}
                    disabled={savingId === app._id}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
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
    </div>
  );
};

export default Applicants;
