/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#100D0A",
          900: "#13100D",
          800: "#1B1714",
          700: "#252019",
          600: "#2E2820",
          500: "#3A312A",
          400: "#4A3F35",
        },
        cream: {
          50: "#F8F2E5",
          100: "#F1E9D9",
          200: "#E1D5BE",
        },
        ember: {
          300: "#F2C684",
          400: "#E8B86D",
          500: "#D6A26E",
          600: "#B98052",
        },
        muted: "#8A7E70",
      },
      letterSpacing: {
        editorial: "0.18em",
      },
    },
  },
  plugins: [],
};
