import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="py-24 text-center">
    <p className="text-6xl font-bold text-brand-500">404</p>
    <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
    <Link to="/" className="btn-primary mt-6">
      Back home
    </Link>
  </div>
);

export default NotFound;
