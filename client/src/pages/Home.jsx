import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import JobCard from "../components/JobCard.jsx";
import { JobListSkeleton } from "../components/Skeleton.jsx";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckCircleIcon,
  MapPinIcon,
  SearchIcon,
  SendIcon,
  SparkIcon,
  UsersIcon,
} from "../components/Icons.jsx";
import { CATEGORIES } from "../constants.js";

const categoryIcon = {
  Frontend: SparkIcon,
  Backend: BriefcaseIcon,
  "Full Stack": SparkIcon,
  Mobile: BriefcaseIcon,
  DevOps: BriefcaseIcon,
  "Data Science": SparkIcon,
  Design: SparkIcon,
  Marketing: UsersIcon,
  Sales: UsersIcon,
  Other: BriefcaseIcon,
};

const steps = [
  {
    icon: UsersIcon,
    title: "Create your profile",
    body: "Sign up as a candidate or recruiter and add your skills, location and resume.",
  },
  {
    icon: SearchIcon,
    title: "Find the right match",
    body: "Search and filter by location, job type, salary range and category.",
  },
  {
    icon: SendIcon,
    title: "Apply and track",
    body: "Apply in one click, then follow every application through to an offer.",
  },
];

const Hero = ({ total }) => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-ink-200/70 bg-white">
      {/* soft background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10rem,theme(colors.brand.100),transparent)]"
      />

      <div className="container-page relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <SparkIcon size={13} />
            {total > 0 ? `${total} open roles right now` : "Fresh roles added weekly"}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-ink-900 sm:text-5xl">
            Find the job that
            <span className="text-brand-600"> fits your life</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-500">
            Browse openings from growing companies, apply in one click, and track every
            application from a single dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-lift sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                className="input border-transparent pl-10 focus:ring-0"
                placeholder="Job title, company or skill"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search jobs"
              />
            </div>

            <div className="relative flex-1 sm:max-w-[13rem]">
              <MapPinIcon
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                className="input border-transparent pl-10 focus:ring-0"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="Location"
              />
            </div>

            <button type="submit" className="btn-primary sm:px-6">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={15} className="text-emerald-500" />
              Free for candidates
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={15} className="text-emerald-500" />
              One-click apply
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircleIcon size={15} className="text-emerald-500" />
              Live status tracking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    jobApi
      .list({ limit: 6 })
      .then(({ data }) => {
        setJobs(data.jobs);
        setTotal(data.total);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const companies = [...new Set(jobs.map((j) => j.company))];

  return (
    <div>
      <Hero total={total} />

      {/* ---------- stats strip ---------- */}
      <section className="border-b border-ink-200/70 bg-white">
        <div className="container-page grid grid-cols-3 divide-x divide-ink-100 py-6">
          {[
            { icon: BriefcaseIcon, value: total, label: "Open roles" },
            { icon: BuildingIcon, value: companies.length, label: "Companies hiring" },
            { icon: UsersIcon, value: CATEGORIES.length, label: "Categories" },
          ].map(({ icon: IconCmp, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-2">
              <IconCmp size={18} className="text-brand-500" />
              <span className="text-2xl font-bold text-ink-900">{value}</span>
              <span className="text-center text-xs text-ink-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="container-page space-y-16 py-14">
        {/* ---------- categories ---------- */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Browse by category</h2>
              <p className="mt-1 text-sm text-ink-500">
                Jump straight to the kind of work you do.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((category) => {
              const IconCmp = categoryIcon[category] || BriefcaseIcon;
              const count = jobs.filter((j) => j.category === category).length;

              return (
                <Link
                  key={category}
                  to={`/jobs?category=${encodeURIComponent(category)}`}
                  className="card group flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <IconCmp size={17} />
                  </span>
                  <span className="text-sm font-semibold text-ink-900">{category}</span>
                  <span className="text-xs text-ink-400">
                    {count > 0 ? `${count} open` : "Explore"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------- latest jobs ---------- */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Latest openings</h2>
              <p className="mt-1 text-sm text-ink-500">
                Freshly posted roles from companies hiring now.
              </p>
            </div>
            <Link to="/jobs" className="link inline-flex items-center gap-1.5 text-sm">
              View all
              <ArrowRightIcon size={15} />
            </Link>
          </div>

          <div className="mt-5">
            {loading ? (
              <JobListSkeleton count={4} />
            ) : jobs.length === 0 ? (
              <div className="card px-6 py-14 text-center">
                <p className="text-sm text-ink-500">
                  No jobs posted yet — check back soon.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section>
          <div className="text-center">
            <h2 className="text-xl font-bold">How Jobify works</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
              Three steps from signing up to signing an offer.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map(({ icon: IconCmp, title, body }, index) => (
              <div key={title} className="card-p">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <IconCmp size={19} />
                  </span>
                  <span className="text-xs font-bold text-ink-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- cta ---------- */}
        {!isAuthenticated && (
          <section className="overflow-hidden rounded-2xl bg-ink-900 px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white">
              Ready to make your next move?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-300">
              Join as a candidate to apply in one click, or as a recruiter to post roles
              and manage applicants in one place.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn bg-white text-ink-900 hover:bg-ink-100">
                Create free account
              </Link>
              <Link
                to="/jobs"
                className="btn border border-white/25 text-white hover:bg-white/10"
              >
                Browse jobs first
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
