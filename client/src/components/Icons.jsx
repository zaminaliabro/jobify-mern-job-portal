// Inline SVG icon set — zero dependencies, inherits currentColor and font size.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

const Icon = ({ children, size = 16, className = "", ...rest }) => (
  <svg
    {...base}
    width={size}
    height={size}
    className={`shrink-0 ${className}`}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const MapPinIcon = (p) => (
  <Icon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const BriefcaseIcon = (p) => (
  <Icon {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20" />
  </Icon>
);

export const WalletIcon = (p) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1" />
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
    <circle cx="17" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
);

export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const UsersIcon = (p) => (
  <Icon {...p}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
    <circle cx="9.5" cy="7" r="3.5" />
    <path d="M21 20v-1.5a4 4 0 0 0-3-3.87M16.5 4a3.5 3.5 0 0 1 0 6.8" />
  </Icon>
);

export const UserIcon = (p) => (
  <Icon {...p}>
    <path d="M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const FileIcon = (p) => (
  <Icon {...p}>
    <path d="M14 3v5h5" />
    <path d="M19 21V8l-5-5H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2Z" />
  </Icon>
);

export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);

export const CheckCircleIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Icon>
);

export const AlertIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16h.01" />
  </Icon>
);

export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Icon>
);

export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M20 12H5M11 18l-6-6 6-6" />
  </Icon>
);

export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const PencilIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 6.5 3 3" />
  </Icon>
);

export const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </Icon>
);

export const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
  </Icon>
);

export const GaugeIcon = (p) => (
  <Icon {...p}>
    <path d="M4 19a9 9 0 1 1 16 0" />
    <path d="m12 15 4-5" />
  </Icon>
);

export const SparkIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18.1l-1.8-5.5L4.7 10.8 10.2 9 12 3.5Z" />
  </Icon>
);

export const BuildingIcon = (p) => (
  <Icon {...p}>
    <path d="M3 21h18M5 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M15 21V11h2a2 2 0 0 1 2 2v8" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </Icon>
);

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const FilterIcon = (p) => (
  <Icon {...p}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </Icon>
);

export const ExternalIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-8 8" />
    <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Icon>
);

export const SendIcon = (p) => (
  <Icon {...p}>
    <path d="M21 3 10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
  </Icon>
);

export default Icon;

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
  </Icon>
);
