const EmptyState = ({ icon: IconCmp, title, description, action }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    {IconCmp && (
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
        <IconCmp size={22} />
      </span>
    )}
    <h3 className="text-base font-semibold text-ink-900">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
