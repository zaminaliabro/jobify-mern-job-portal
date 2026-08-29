import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";
import {
  BriefcaseIcon,
  ChevronDownIcon,
  CloseIcon,
  GaugeIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  UserIcon,
} from "./Icons.jsx";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
      <BriefcaseIcon size={17} />
    </span>
    <span className="text-lg font-bold tracking-tight text-ink-900">Jobify</span>
  </Link>
);

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickAway = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEscape = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-ink-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-sm font-medium text-ink-700 sm:inline">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDownIcon size={15} className="text-ink-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-pop"
        >
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            <span className="mt-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {user.role}
            </span>
          </div>

          <div className="p-1.5">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
            >
              <GaugeIcon size={16} className="text-ink-400" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
            >
              <UserIcon size={16} className="text-ink-400" />
              My profile
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogoutIcon size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/jobs" className={linkClass}>
              Browse jobs
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecruiter && (
            <Link to="/jobs/new" className="btn-primary btn-sm hidden sm:inline-flex">
              <PlusIcon size={15} />
              Post a job
            </Link>
          )}

          {isAuthenticated ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Get started
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost btn-sm md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-ink-200/70 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <NavLink to="/jobs" className={linkClass}>
              Browse jobs
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={linkClass}>
                  My profile
                </NavLink>
                {isRecruiter && (
                  <NavLink to="/jobs/new" className={linkClass}>
                    Post a job
                  </NavLink>
                )}
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="btn-outline flex-1">
                  Login
                </Link>
                <Link to="/register" className="btn-primary flex-1">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
