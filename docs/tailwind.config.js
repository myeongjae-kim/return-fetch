import flowbitePlugin from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [flowbitePlugin],
  theme: {},
};

export default config;
