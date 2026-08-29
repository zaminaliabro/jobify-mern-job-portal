import { useState } from "react";
import { authApi, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email} · <span className="capitalize">{user.role}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                value={form.company}
                onChange={handleChange}
              />
            </div>
          ) : (
            <>
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

              <div>
                <label className="label" htmlFor="resume">
                  Resume link
                </label>
                <input
                  id="resume"
                  name="resume"
                  className="input"
                  placeholder="https://drive.google.com/..."
                  value={form.resume}
                  onChange={handleChange}
                />
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
              className="input"
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
