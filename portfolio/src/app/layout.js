import { Analytics } from "@vercel/analytics/react";
import { Geist, Inter, Instrument_Serif } from "next/font/google";
import "@/app/globals.css";

const headingFont = Geist({
  display: "swap",
  variable: "--font-geist",
  subsets: ["latin"],
});

const descriptionFont = Inter({
  display: "swap",
  variable: "--font-inter",
  subsets: ["latin"],
});

const accentFont = Instrument_Serif({
  display: "swap",
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const themeScript = `
  (function () {
    try {
      var storageKey = "theme-preference";
      var storedTheme = localStorage.getItem(storageKey);
      var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var theme = storedTheme || systemTheme;
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.dataset.theme = theme;
    } catch (error) {
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const metadata = {
  metadataBase: new URL("https://itsparam.dev"),
  title: "Parampreet Singh | AI Engineer",
  description:
    "AI engineer portfolio for Parampreet Singh, focused on intelligent systems, product-minded engineering, and developer-first interfaces.",
  keywords: [
    "Parampreet Singh",
    "itsparam.dev",
    "AI Engineer",
    "Machine Learning Engineer",
    "Next.js Portfolio",
    "Developer Portfolio",
    "Artificial Intelligence",
    "Data Science",
    "IIT Madras",
    "Code Track",
    "E-Pustakalya",
    "Heart Disease Predictor",
  ],
  authors: [{ name: "Parampreet Singh", url: "https://itsparam.dev" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="WO5xWIFDFFe6h7lIEMnhEEMK7rDztpeIoiTKkHe7OLs"
        />
        <meta name="msvalidate.01" content="D3DA4D66F5C210EDBD5F78589E4A7DD1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${headingFont.variable} ${descriptionFont.variable} ${accentFont.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
