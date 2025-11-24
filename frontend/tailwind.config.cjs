module.exports = {
  content: [
    "./index.html",
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
