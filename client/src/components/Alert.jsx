import { AlertIcon, CheckCircleIcon } from "./Icons.jsx";

const variants = {
  error: {
    box: "border-rose-200 bg-rose-50 text-rose-700",
    Icon: AlertIcon,
  },
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Icon: CheckCircleIcon,
  },
  info: {
    box: "border-brand-200 bg-brand-50 text-brand-700",
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
