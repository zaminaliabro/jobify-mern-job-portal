import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api.js";
import Alert from "../components/Alert.jsx";

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
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hire talent or find your next role.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Alert type="error" message={error} />

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
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
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
              className="input"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <span className="label">I am a</span>
            <div className="grid grid-cols-2 gap-3">
              {["candidate", "recruiter"].map((role) => (
                <label
                  key={role}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm capitalize transition ${
                    form.role === role
                      ? "border-brand-500 bg-brand-50 text-brand-600"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={form.role === role}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-medium text-brand-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
