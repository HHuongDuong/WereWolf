import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["EB Garamond", "sans-serif"],
        serif: ["Cinzel", "serif"],
        accent: ["IM Fell English", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
