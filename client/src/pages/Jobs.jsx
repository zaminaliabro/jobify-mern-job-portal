import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jobApi, getErrorMessage } from "../services/api.js";
import JobCard from "../components/JobCard.jsx";
import Loader from "../components/Loader.jsx";
import Alert from "../components/Alert.jsx";
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

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(emptyFilters);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries({ ...activeFilters, page: activePage }).filter(
          ([, value]) => value !== "" && value !== undefined
        )
      );
      const { data } = await jobApi.list(params);
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
    setSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))
    );
  };

  const resetFilters = () => setSearchParams({});

  const goToPage = (nextPage) => {
    setSearchParams(
      Object.fromEntries(
        Object.entries({ ...filters, page: nextPage }).filter(([, v]) => v !== "")
      )
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="card h-fit">
        <h2 className="text-base font-semibold text-slate-900">Filters</h2>

        <form onSubmit={applyFilters} className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="search">
              Keyword
            </label>
            <input
              id="search"
              name="search"
              className="input"
              placeholder="React, Node..."
              value={filters.search}
              onChange={handleChange}
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
              placeholder="Karachi"
              value={filters.location}
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
              value={filters.jobType}
              onChange={handleChange}
            >
              <option value="">All types</option>
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
              value={filters.category}
              onChange={handleChange}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="minSalary">
                Min salary
              </label>
              <input
                id="minSalary"
                name="minSalary"
                type="number"
                min="0"
                className="input"
                value={filters.minSalary}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="maxSalary">
                Max salary
              </label>
              <input
                id="maxSalary"
                name="maxSalary"
                type="number"
                min="0"
                className="input"
                value={filters.maxSalary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              className="input"
              value={filters.sort}
              onChange={handleChange}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary-high">Salary: high to low</option>
              <option value="salary-low">Salary: low to high</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              Apply
            </button>
            <button type="button" onClick={resetFilters} className="btn-outline">
              Reset
            </button>
          </div>
        </form>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Jobs</h1>
          <span className="text-sm text-slate-500">{meta.total} results</span>
        </div>

        <Alert type="error" message={error} />

        {loading ? (
          <Loader label="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">
            No jobs match these filters. Try widening your search.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {meta.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  className="btn-outline"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {meta.page} of {meta.pages}
                </span>
                <button
                  className="btn-outline"
                  disabled={page >= meta.pages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Jobs;
