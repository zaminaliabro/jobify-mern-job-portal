import { Link } from "react-router-dom";
import { ArrowLeftIcon, SearchIcon } from "../components/Icons.jsx";

const NotFound = () => (
  <div className="flex flex-col items-center py-24 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
      <SearchIcon size={24} />
    </span>
    <p className="mt-6 text-5xl font-extrabold tracking-tight text-ink-900">404</p>
    <h1 className="mt-2 text-lg font-semibold">This page doesn't exist</h1>
    <p className="mt-1.5 max-w-sm text-sm text-ink-500">
      The link may be broken, or the job you were looking for has been removed.
    </p>
    <div className="mt-7 flex gap-3">
      <Link to="/" className="btn-outline">
        <ArrowLeftIcon size={15} />
        Back home
      </Link>
      <Link to="/jobs" className="btn-primary">
        Browse jobs
      </Link>
    </div>
  </div>
);

export default NotFound;
