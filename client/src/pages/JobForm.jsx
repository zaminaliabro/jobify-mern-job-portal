import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
import { CATEGORIES, JOB_TYPES } from "../constants.js";

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
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading job..." />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit job" : "Post a new job"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Give candidates a clear picture of the role.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              rows={6}
              className="input"
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
                value={form.salary}
                onChange={handleChange}
              />
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
              Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              className="input"
              placeholder="React, Node.js, MongoDB"
              value={form.skills}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Update job" : "Publish job"}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
