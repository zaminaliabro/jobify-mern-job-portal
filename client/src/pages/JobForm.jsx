import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
import Avatar from "../components/Avatar.jsx";
import { ArrowLeftIcon, MapPinIcon, WalletIcon } from "../components/Icons.jsx";
import { CATEGORIES, JOB_TYPES } from "../constants.js";
import { formatSalary } from "../utils/format.js";

const emptyJob = {
  title: "",
  company: "",
  description: "",
  location: "",
  salary: "",
  jobType: "Full-time",
  category: "Other",
  skills: "",
};

const JobForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ ...emptyJob, company: user?.company || "" });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    jobApi
      .get(id)
      .then(({ data }) => {
        const job = data.job;
        setForm({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          salary: job.salary ?? "",
          jobType: job.jobType,
          category: job.category,
          skills: (job.skills || []).join(", "),
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = { ...form, salary: Number(form.salary) || 0 };

    try {
      const { data } = isEdit
        ? await jobApi.update(id, payload)
        : await jobApi.create(payload);
      navigate(`/jobs/${data.job.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading job…" />;

  const skillList = form.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="animate-fade-up">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-brand-600"
      >
        <ArrowLeftIcon size={15} />
        Back
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? "Edit job" : "Post a new job"}</h1>
        <p className="mt-1 text-sm text-ink-500">
          Give candidates a clear picture of the role and what you expect.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        <form onSubmit={handleSubmit} className="card-p space-y-5">
          <Alert type="error" message={error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="title">
                Job title
              </label>
              <input
                id="title"
                name="title"
                className="input"
                placeholder="React Frontend Developer"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                name="company"
                className="input"
                placeholder="Zamin Tech"
                value={form.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              className="input resize-y"
              placeholder="What the role involves, who you're looking for, and what a typical week looks like…"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                name="location"
                className="input"
                placeholder="Karachi"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="salary">
                Monthly salary (PKR)
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                min="0"
                className="input"
                placeholder="150000"
                value={form.salary}
                onChange={handleChange}
              />
              <p className="hint">Leave blank to show "Not disclosed".</p>
            </div>

            <div>
              <label className="label" htmlFor="jobType">
                Job type
              </label>
              <select
                id="jobType"
                name="jobType"
                className="input"
                value={form.jobType}
                onChange={handleChange}
              >
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="input"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="skills">
              Skills
            </label>
            <input
              id="skills"
              name="skills"
              className="input"
              placeholder="React, Node.js, MongoDB"
              value={form.skills}
              onChange={handleChange}
            />
            <p className="hint">Separate with commas.</p>
          </div>

          <div className="flex gap-2 border-t border-ink-100 pt-5">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Update job" : "Publish job"}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>

        {/* ---------- live preview ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Live preview
          </p>
          <div className="card p-5">
            <div className="flex items-start gap-3.5">
              <Avatar name={form.company || "Company"} size="md" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold text-ink-900">
                  {form.title || "Job title"}
                </h3>
                <p className="mt-0.5 truncate text-sm text-ink-500">
                  {form.company || "Company name"}
                </p>
              </div>
            </div>

            <p className="mt-3.5 line-clamp-3 text-sm leading-relaxed text-ink-500">
              {form.description || "Your job description will appear here…"}
            </p>

            {skillList.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {skillList.slice(0, 4).map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-ink-100 pt-3.5">
              <span className="meta">
                <MapPinIcon size={14} className="text-ink-400" />
                {form.location || "Location"}
              </span>
              <span className="meta font-semibold text-ink-700">
                <WalletIcon size={14} className="text-ink-400" />
                {formatSalary(form.salary)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobForm;
