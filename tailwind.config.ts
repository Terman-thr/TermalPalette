import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at 20% 20%, #1e293b, #0f172a)",
      },
      colors: {
        panel: "#111827",
        accent: "#38bdf8",
        muted: "#94a3b8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        mono: [
          "'Fira Code'",
          "'SFMono-Regular'",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Liberation Mono'",
          "'Courier New'",
          "monospace",
        ],
      },
      borderRadius: {
        "4xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 40px 120px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
