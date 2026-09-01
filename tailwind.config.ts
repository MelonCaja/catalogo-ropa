import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#161513",
          muted: "#6b665f",
          faint: "#9b958c",
        },
        paper: {
          DEFAULT: "#f7f5f0",
          soft: "#efece4",
          line: "#e0dcd2",
        },
      },
      letterSpacing: {
        wordmark: "0.36em",
        meta: "0.18em",
        wide: "0.14em",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "sheet-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 160ms ease-out",
        "sheet-in": "sheet-in 220ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
