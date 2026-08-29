import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jobApi, getErrorMessage } from "../services/api.js";
import JobCard from "../components/JobCard.jsx";
import Alert from "../components/Alert.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { JobListSkeleton } from "../components/Skeleton.jsx";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CloseIcon,
  FilterIcon,
  MapPinIcon,
  SearchIcon,
} from "../components/Icons.jsx";
import { CATEGORIES, JOB_TYPES } from "../constants.js";

const emptyFilters = {
  search: "",
  location: "",
  jobType: "",
  category: "",
  minSalary: "",
  maxSalary: "",
  sort: "newest",
};

const cleaned = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined));

const FilterPanel = ({ filters, onChange, onSubmit, onReset }) => (
  <form onSubmit={onSubmit} className="space-y-5">
    <div>
      <label className="label" htmlFor="search">
        Keyword
      </label>
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          id="search"
          name="search"
          className="input pl-9"
          placeholder="React, Node…"
          value={filters.search}
          onChange={onChange}
        />
      </div>
    </div>

    <div>
      <label className="label" htmlFor="location">
        Location
      </label>
      <div className="relative">
        <MapPinIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          id="location"
          name="location"
          className="input pl-9"
          placeholder="Karachi"
          value={filters.location}
          onChange={onChange}
        />
      </div>
    </div>

    <div>
      <span className="label">Job type</span>
      <div className="flex flex-wrap gap-1.5">
        {["", ...JOB_TYPES].map((type) => (
          <label
            key={type || "all"}
            className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              filters.jobType === type
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            <input
              type="radio"
              name="jobType"
              value={type}
              checked={filters.jobType === type}
              onChange={onChange}
              className="sr-only"
            />
            {type || "All"}
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className="label" htmlFor="category">
        Category
      </label>
      <select
        id="category"
        name="category"
        className="input"
        value={filters.category}
        onChange={onChange}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

    <div>
      <span className="label">Salary range (PKR)</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="minSalary"
          type="number"
          min="0"
          className="input"
          placeholder="Min"
          value={filters.minSalary}
          onChange={onChange}
          aria-label="Minimum salary"
        />
        <input
          name="maxSalary"
          type="number"
          min="0"
          className="input"
          placeholder="Max"
          value={filters.maxSalary}
          onChange={onChange}
          aria-label="Maximum salary"
        />
      </div>
    </div>

    <div className="flex gap-2 pt-1">
      <button type="submit" className="btn-primary flex-1">
        Apply filters
      </button>
      <button type="button" onClick={onReset} className="btn-outline">
        Reset
      </button>
    </div>
  </form>
);

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(emptyFilters);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchJobs = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await jobApi.list(cleaned({ ...activeFilters, page: activePage }));
      setJobs(data.jobs);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      setError(getErrorMessage(err));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever the URL query changes (covers links coming from Home too)
  useEffect(() => {
    const fromUrl = { ...emptyFilters, ...Object.fromEntries(searchParams.entries()) };
    const urlPage = Number(searchParams.get("page")) || 1;
    setFilters(fromUrl);
    setPage(urlPage);
    fetchJobs(fromUrl, urlPage);
  }, [searchParams, fetchJobs]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setDrawerOpen(false);
    setSearchParams(cleaned(filters));
  };

  const resetFilters = () => {
    setDrawerOpen(false);
    setSearchParams({});
  };

  const goToPage = (nextPage) => {
    setSearchParams(cleaned({ ...filters, page: nextPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeChips = Object.entries(cleaned(filters)).filter(
    ([key, value]) => key !== "sort" || value !== "newest"
  );

  const removeChip = (key) => setSearchParams(cleaned({ ...filters, [key]: "" }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Browse jobs</h1>
        <p className="mt-1 text-sm text-ink-500">
          {loading ? "Searching…" : `${meta.total} role${meta.total === 1 ? "" : "s"} found`}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        {/* ---------- desktop sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="card-p sticky top-24">
            <div className="mb-4 flex items-center gap-2">
              <FilterIcon size={16} className="text-ink-400" />
              <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
            </div>
            <FilterPanel
              filters={filters}
              onChange={handleChange}
              onSubmit={applyFilters}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <section>
          {/* ---------- toolbar ---------- */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-outline btn-sm lg:hidden"
            >
              <FilterIcon size={15} />
              Filters
            </button>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeChips.map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => removeChip(key)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                    title={`Remove ${key} filter`}
                  >
                    {value}
                    <CloseIcon size={12} />
                  </button>
                ))}
                <button onClick={resetFilters} className="text-xs text-ink-400 underline">
                  clear all
                </button>
              </div>
            )}

            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-ink-500">Sort</span>
              <select
                name="sort"
                className="input w-auto py-1.5 text-[13px]"
                value={filters.sort}
                onChange={(e) =>
                  setSearchParams(cleaned({ ...filters, sort: e.target.value }))
                }
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="salary-high">Salary: high to low</option>
                <option value="salary-low">Salary: low to high</option>
              </select>
            </label>
          </div>

          <Alert type="error" message={error} />

          {/* ---------- results ---------- */}
          {loading ? (
            <JobListSkeleton count={6} />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title="No jobs match these filters"
              description="Try removing a filter or widening your salary range."
              action={
                <button onClick={resetFilters} className="btn-primary">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {meta.pages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2">
                  <button
                    className="btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ArrowLeftIcon size={15} />
                    Previous
                  </button>

                  <span className="px-3 text-sm text-ink-500">
                    Page <span className="font-semibold text-ink-900">{meta.page}</span> of{" "}
                    {meta.pages}
                  </span>

                  <button
                    className="btn-outline btn-sm"
                    disabled={page >= meta.pages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next
                    <ArrowRightIcon size={15} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {/* ---------- mobile filter drawer ---------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[19rem] flex-col bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} className="btn-ghost btn-sm">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel
                filters={filters}
                onChange={handleChange}
                onSubmit={applyFilters}
                onReset={resetFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
