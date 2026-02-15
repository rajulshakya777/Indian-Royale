import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4A843",
          light: "#E8C97A",
          dark: "#B8892E",
        },
        maroon: {
          DEFAULT: "#800020",
          light: "#A0003A",
          dark: "#600018",
        },
        cream: {
          DEFAULT: "#FFF8E7",
          dark: "#F5ECD3",
        },
        royal: {
          dark: "#1a0a00",
          brown: "#2d1810",
        },
      },
      fontFamily: {
        heading: ["Georgia", "serif"],
        body: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
