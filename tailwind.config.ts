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
        plata: "#B8BEC4",
        crema: "#FAF6EC",
      },
    },
  },
  plugins: [],
};
export default config;
