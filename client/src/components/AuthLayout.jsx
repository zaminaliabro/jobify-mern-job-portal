import { Link } from "react-router-dom";
import { BriefcaseIcon, CheckCircleIcon } from "./Icons.jsx";

const highlights = [
  "Search and filter thousands of roles",
  "Apply in one click with a saved resume",
  "Track every application in real time",
  "Recruiters: manage your whole pipeline",
];

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
    {/* ---------- form side ---------- */}
    <div className="flex items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </div>

    {/* ---------- brand side ---------- */}
    <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:items-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_25rem_at_70%_20%,theme(colors.brand.800),transparent)]"
      />

      <div className="relative px-14">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
            <BriefcaseIcon size={19} />
          </span>
          <span className="text-xl font-bold text-white">Jobify</span>
        </Link>

        <h2 className="mt-10 max-w-md text-3xl font-bold leading-tight text-white">
          The shortest path between talent and opportunity.
        </h2>

        <ul className="mt-8 space-y-3.5">
          {highlights.map((line) => (
            <li key={line} className="flex items-start gap-3 text-[15px] text-ink-300">
              <CheckCircleIcon size={18} className="mt-0.5 shrink-0 text-brand-400" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default AuthLayout;
