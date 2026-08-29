const styles = {
  Applied: { pill: "bg-ink-100 text-ink-600", dot: "bg-ink-400" },
  Shortlisted: { pill: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  Interview: { pill: "bg-brand-100 text-brand-700", dot: "bg-brand-500" },
  Rejected: { pill: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  Hired: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const StatusBadge = ({ status }) => {
  const style = styles[status] || styles.Applied;
  return (
    <span className={`pill ${style.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
