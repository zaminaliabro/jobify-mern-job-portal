import { useTheme } from "../context/ThemeContext.jsx";
import { MoonIcon, SunIcon } from "./Icons.jsx";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <SunIcon
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <MoonIcon
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
