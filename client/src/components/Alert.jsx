const styles = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-brand-100 bg-brand-50 text-brand-700",
};

const Alert = ({ type = "info", message }) => {
  if (!message) return null;
  return (
    <div className={`rounded-lg border px-4 py-2 text-sm ${styles[type]}`}>{message}</div>
  );
};

export default Alert;
