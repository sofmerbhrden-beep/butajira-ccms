/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EA",
        "paper-line": "#DCD5C2",
        ink: "#1C211D",
        forest: "#123A26",
        "forest-dark": "#0B2418",
        "forest-light": "#1E5138",
        gold: "#B8863B",
        "gold-light": "#D9B876",
        stamp: "#8C2F2A",

        // shadcn/ui theme tokens - mapped to the palette above via CSS variables in index.css
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', '"Noto Sans Ethiopic"', "Georgia", "serif"],
        sans: [
          '"IBM Plex Sans"',
          '"Noto Sans Ethiopic"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"IBM Plex Mono"', '"Noto Sans Ethiopic"', "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
