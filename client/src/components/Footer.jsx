import { Link } from "react-router-dom";
import { BriefcaseIcon } from "./Icons.jsx";
import { CATEGORIES } from "../constants.js";

const Footer = () => (
  <footer className="mt-20 border-t border-ink-200 bg-white">
    <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BriefcaseIcon size={17} />
          </span>
          <span className="text-lg font-bold text-ink-900">Jobify</span>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">
          A job portal where candidates apply in one click and recruiters run their whole
          hiring pipeline in one dashboard.
        </p>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-900">
          Explore
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          <li>
            <Link to="/jobs" className="transition hover:text-brand-600">
              Browse all jobs
            </Link>
          </li>
          <li>
            <Link to="/register" className="transition hover:text-brand-600">
              Create an account
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="transition hover:text-brand-600">
              Dashboard
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink-900">
          Categories
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-ink-500">
          {CATEGORIES.slice(0, 5).map((category) => (
            <li key={category}>
              <Link
                to={`/jobs?category=${encodeURIComponent(category)}`}
                className="transition hover:text-brand-600"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="border-t border-ink-100">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-[13px] text-ink-400 sm:flex-row">
        <p>© {new Date().getFullYear()} Jobify. All rights reserved.</p>
        <p>Built with React, Node, Express &amp; MongoDB</p>
      </div>
    </div>
  </footer>
);

export default Footer;
