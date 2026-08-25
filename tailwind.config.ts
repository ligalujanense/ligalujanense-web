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
        background: "var(--background)",
        foreground: "var(--foreground)",
        dorado: {
          DEFAULT: "#D9A441",
          claro: "#E8BE6B",
          oscuro: "#B5842E",
        },
        azul: {
          DEFAULT: "#4A90C4",
          oscuro: "#2C5F82",
        },
        marino: {
          DEFAULT: "#0B2A4D",
          oscuro: "#071B33",
          claro: "#123B6B",
        },
        plata: "#B8BEC4",
        crema: "#F7F5F0",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
