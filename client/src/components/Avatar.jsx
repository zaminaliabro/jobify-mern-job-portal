import { initials } from "../utils/format.js";

// Deterministic tint per name so the same company always gets the same colour.
const tints = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
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
