// tailwind.config.js
module.exports = {
  content: [
    "./*.html",
    "./**/*.html", // <--- Make sure this line is correct
    "./src/**/**/*.html", // <--- Make sure this line is correct
    "./src/**/*.{js,ts,jsx,tsx,html}", // <--- Make sure this line is correct
  ],
  theme: {
    extend: {
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
      },
      screens: {
        xsm: "310px",
        "2xsm": "360px",
        "3xsm": "480px", // Adds a new breakpoint for extra-small screens
        "4xsm": "550px", // Adds a new breakpoint for extra-small screens
        "5xsm": "650px", // Adds a new breakpoint for extra-small screens
        md2: "820px", // Adds a new breakpoint for ultra-large screens
        "3md": "850px", // Adds a new breakpoint for ultra-large screens
        "4md": "950px", // Adds a new breakpoint for ultra-large screens
        "2lg": "1100px", // Adds a new breakpoint for ultra-large screens
        "3xl": "1920px", // Adds a new breakpoint for ultra-large screens
      },
    },
  },
  plugins: [],
};
