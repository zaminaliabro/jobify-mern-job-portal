const StatCard = ({ label, value, accent = "text-slate-900" }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`mt-1 text-3xl font-bold ${accent}`}>{value}</p>
  </div>
);

export default StatCard;
