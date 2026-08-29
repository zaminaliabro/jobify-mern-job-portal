// Alpha-based tints read correctly on both a white and a near-black surface,
// unlike the fixed -100 shades which glare in dark mode.
const styles = {
  Applied: { pill: "bg-ink-500/15 text-ink-600", dot: "bg-ink-400" },
  Shortlisted: { pill: "bg-amber-500/15 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  Interview: { pill: "bg-brand-500/15 text-brand-600 dark:text-brand-300", dot: "bg-brand-500" },
  Rejected: { pill: "bg-rose-500/15 text-rose-600 dark:text-rose-400", dot: "bg-rose-500" },
  Hired: { pill: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
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
