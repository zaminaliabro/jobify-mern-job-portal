/** @type {import('tailwindcss').Config} */

// Every neutral and tint is a CSS variable holding an "R G B" triple, so a
// single class like `bg-ink-50` resolves to the right colour in either theme
// and opacity modifiers (`bg-ink-900/40`) still work.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const scale = (prefix, steps) =>
  Object.fromEntries(steps.map((step) => [step, token(`${prefix}-${step}`)]));

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      colors: {
        // Page background, cards, and every neutral text tone.
        surface: token("surface"),
        ink: scale("ink", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        brand: {
          ...scale("brand", [50, 100, 200]),
          300: "#93bbfd",
          400: "#6096fa",
          500: "#3b73f6",
          600: "#2555eb",
          700: "#1d42d8",
          800: "#1e37af",
          900: "#1e328a",
          950: "#172154",
        },
      },
      fontSize: {
        // Slightly tighter leading than Tailwind's defaults, which suits Inter.
        xs: ["0.75rem", { lineHeight: "1.05rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.4rem" }],
        md: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.0625rem", { lineHeight: "1.6rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "1.95rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.05" }],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(var(--shadow) / 0.05), 0 1px 3px 0 rgb(var(--shadow) / 0.07)",
        lift: "0 4px 12px -2px rgb(var(--shadow) / 0.10), 0 2px 6px -2px rgb(var(--shadow) / 0.06)",
        pop: "0 12px 32px -8px rgb(var(--shadow) / 0.22)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { "fade-up": "fade-up 0.35s ease-out both" },
    },
  },
  plugins: [],
};
