const tones = {
  default: "bg-ink-500/12 text-ink-500",
  brand: "bg-brand-500/15 text-brand-600 dark:text-brand-300",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const StatCard = ({ label, value, icon: IconCmp, tone = "default", hint }) => (
  <div className="card-p">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-ink-500">{label}</p>
        <p className="tnum mt-2 text-3xl font-bold tracking-tight text-ink-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      </div>
      {IconCmp && (
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            tones[tone] || tones.default
          }`}
        >
          <IconCmp size={19} />
        </span>
      )}
    </div>
  </div>
);

export default StatCard;
