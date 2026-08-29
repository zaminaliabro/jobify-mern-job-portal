import { AlertIcon, CheckCircleIcon } from "./Icons.jsx";

const variants = {
  error: {
    box: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    Icon: AlertIcon,
  },
  success: {
    box: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircleIcon,
  },
  info: {
    box: "border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300",
    Icon: AlertIcon,
  },
};

const Alert = ({ type = "info", message }) => {
  if (!message) return null;
  const { box, Icon: VariantIcon } = variants[type] || variants.info;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${box}`}
    >
      <VariantIcon size={17} className="mt-px" />
      <span>{message}</span>
    </div>
  );
};

export default Alert;
