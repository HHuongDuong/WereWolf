import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-eb-garamond)", "sans-serif"],
        serif: ["var(--font-cinzel)", "serif"],
        accent: ["var(--font-im-fell-english)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
