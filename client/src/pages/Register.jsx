import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api.js";
import Alert from "../components/Alert.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { BuildingIcon, UserIcon } from "../components/Icons.jsx";

const roles = [
  {
    value: "candidate",
    label: "I'm looking for a job",
    icon: UserIcon,
  },
  {
    value: "recruiter",
    label: "I'm hiring",
    icon: BuildingIcon,
  },
];

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute — and it's free."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error" message={error} />

        <div>
          <span className="label">I am here to…</span>
          <div className="grid grid-cols-2 gap-2.5">
            {roles.map(({ value, label, icon: IconCmp }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border p-3 text-center transition ${
                  form.role === value
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/15"
                    : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={form.role === value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <IconCmp
                  size={20}
                  className={`mx-auto ${
                    form.role === value ? "text-brand-600" : "text-ink-400"
                  }`}
                />
                <span
                  className={`mt-2 block text-[13px] font-medium ${
                    form.role === value ? "text-brand-700" : "text-ink-600"
                  }`}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="input"
            placeholder="Bilal Ahmed"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="input"
            placeholder="At least 6 characters"
            minLength={6}
            value={form.password}
            onChange={handleChange}
            required
          />
          <p className="hint">Minimum 6 characters.</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already registered?{" "}
        <Link to="/login" className="link">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
