import { useState } from "react";
import { authApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import Alert from "../components/Alert.jsx";
import { formatDate } from "../utils/format.js";

const Profile = () => {
  const { user, updateUser, isRecruiter } = useAuth();

  const [form, setForm] = useState({
    name: user.name || "",
    location: user.location || "",
    company: user.company || "",
    bio: user.bio || "",
    resume: user.resume || "",
    skills: (user.skills || []).join(", "),
    password: "",
  });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });
    setSubmitting(true);

    const payload = { ...form };
    if (!payload.password) delete payload.password;

    try {
      const { data } = await authApi.updateProfile(payload);
      updateUser(data.user);
      setForm((f) => ({ ...f, password: "" }));
      setStatus({ error: "", success: "Profile updated" });
    } catch (err) {
      setStatus({ error: getErrorMessage(err), success: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const skillList = form.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="animate-fade-up">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">My profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          Recruiters see this information when you apply.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* ---------- form ---------- */}
        <form onSubmit={handleSubmit} className="card-p space-y-5">
          <Alert type="error" message={status.error} />
          <Alert type="success" message={status.success} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                className="input"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                name="location"
                className="input"
                placeholder="Karachi, Pakistan"
                value={form.location}
                onChange={handleChange}
              />
            </div>
          </div>

          {isRecruiter ? (
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
              />
              <p className="hint">Used as the default company on jobs you post.</p>
            </div>
          ) : (
            <>
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
                {skillList.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {skillList.map((skill) => (
                      <span key={skill} className="chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label" htmlFor="resume">
                  Resume link
                </label>
                <input
                  id="resume"
                  name="resume"
                  className="input"
                  placeholder="https://drive.google.com/…"
                  value={form.resume}
                  onChange={handleChange}
                />
                <p className="hint">Pre-filled whenever you apply to a job.</p>
              </div>
            </>
          )}

          <div>
            <label className="label" htmlFor="bio">
              About
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="input resize-y"
              placeholder={
                isRecruiter
                  ? "Tell candidates about your company…"
                  : "A short intro about your experience…"
              }
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <div className="border-t border-ink-100 pt-5">
            <label className="label" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="input sm:max-w-xs"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={handleChange}
            />
            <p className="hint">Minimum 6 characters if you change it.</p>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>

        {/* ---------- summary card ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-p text-center">
            <Avatar name={user.name} size="lg" className="mx-auto" />
            <h2 className="mt-3 text-base font-semibold text-ink-900">{user.name}</h2>
            <p className="truncate text-sm text-ink-500">{user.email}</p>
            <span className="mt-3 inline-block rounded-md bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {user.role}
            </span>

            <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-4 text-left text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-400">Location</dt>
                <dd className="truncate font-medium text-ink-700">
                  {user.location || "—"}
                </dd>
              </div>
              {isRecruiter && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-400">Company</dt>
                  <dd className="truncate font-medium text-ink-700">
                    {user.company || "—"}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-400">Member since</dt>
                <dd className="font-medium text-ink-700">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Profile;
