import { initials } from "../utils/format.js";

// Deterministic tint per name so the same company always gets the same colour.
// Alpha fills keep these legible on either theme.
const tints = [
  "bg-brand-500/15 text-brand-600 dark:text-brand-300",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
];

const tintFor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return tints[hash % tints.length];
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
};

const Avatar = ({ name, size = "md", className = "" }) => (
  <span
    className={`inline-flex items-center justify-center rounded-xl font-bold ${
      sizes[size]
    } ${tintFor(name)} ${className}`}
    title={name}
  >
    {initials(name)}
  </span>
);

export default Avatar;
