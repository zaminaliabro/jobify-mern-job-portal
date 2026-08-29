import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "jobify_theme";
const systemPrefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// "light" | "dark" | "system"
const readStored = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(readStored);
  const [resolved, setResolved] = useState(() =>
    readStored() === "system" ? (systemPrefersDark() ? "dark" : "light") : readStored()
  );

  // Apply the class the Tailwind `dark:` variant keys off.
  useEffect(() => {
    const next = preference === "system" ? (systemPrefersDark() ? "dark" : "light") : preference;
    setResolved(next);
    document.documentElement.classList.toggle("dark", next === "dark");

    try {
      if (preference === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Private mode or blocked storage: the theme still applies for this visit.
    }
  }, [preference]);

  // Follow the OS while the user has not made an explicit choice.
  useEffect(() => {
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      setResolved(e.matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", e.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const toggle = useCallback(
    () => setPreference(resolved === "dark" ? "light" : "dark"),
    [resolved]
  );

  return (
    <ThemeContext.Provider
      value={{ theme: resolved, preference, setPreference, toggle, isDark: resolved === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
