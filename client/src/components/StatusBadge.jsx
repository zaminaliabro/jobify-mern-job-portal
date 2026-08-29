const colors = {
  Applied: "bg-slate-100 text-slate-700",
  Shortlisted: "bg-amber-100 text-amber-700",
  Interview: "bg-brand-50 text-brand-600",
  Rejected: "bg-red-100 text-red-700",
  Hired: "bg-emerald-100 text-emerald-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
      colors[status] || colors.Applied
    }`}
  >
    {status}
  </span>
);

export default StatusBadge;
