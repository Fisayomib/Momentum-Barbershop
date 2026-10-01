import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#08090C",
        panel: "#0F1116",
        panel2: "#14171F",
        line: "#1E222C",
        line2: "#2A2F3B",
        ink: "#E6E8EC",
        muted: "#8A91A0",
        faint: "#5A6170",
        brand: "#5EE7C4",
        brandDim: "#1E4A42",
        gold: "#E5B769",
        pos: "#34D399",
        neg: "#F87171",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
