const Loader = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-3 py-20 text-ink-500">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
    <span className="text-sm">{label}</span>
  </div>
);

export default Loader;
