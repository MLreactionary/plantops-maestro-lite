import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        panel: "#111b2e",
        panelAlt: "#17243b",
        border: "#2d3c55",
        text: "#d7dfeb",
        muted: "#8ea2bf",
        accent: "#4f8cff",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444"
      }
    },
  },
  plugins: [],
};

export default config;