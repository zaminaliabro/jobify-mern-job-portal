import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobApi } from "../services/api.js";
import JobCard from "../components/JobCard.jsx";
import Loader from "../components/Loader.jsx";
import { CATEGORIES } from "../constants.js";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    jobApi
      .list({ limit: 6 })
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 px-6 py-16 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Find the job that fits your life
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-brand-50">
          Browse openings from top companies, apply in one click, and track every
          application in one dashboard.
        </p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
          <input
            className="input border-transparent text-slate-800"
            placeholder="Job title, company or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn bg-white font-semibold text-brand-600">
            Search
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Browse by category</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/jobs?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-brand-500 hover:text-brand-600"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Latest jobs</h2>
          <Link to="/jobs" className="text-sm font-medium text-brand-600">
            View all
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No jobs posted yet. Check back soon.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
