import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E8891A",
          navy: "#2D3748",
        },
      },
    },
  },
  plugins: [],
};
export default config;
