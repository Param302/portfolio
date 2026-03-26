import { Analytics } from "@vercel/analytics/react";
import { Geist, Inter, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/ThemeContext";
import {
  allKeywords,
  faqSchema,
  organizationSchema,
  personSchema,
  profilePageSchema,
  siteConfig,
  websiteSchema,
} from "@/app/data/seoData";

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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | itsparam.in",
  },
  description: siteConfig.shortBio,
  applicationName: "itsparam.in",
  keywords: allKeywords,
  category: "technology",
  creator: siteConfig.name,
  publisher: siteConfig.name,
  classification: "Portfolio",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.siteName,
    title: siteConfig.title,
    description: siteConfig.shortBio,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI engineer portfolio`,
      },
      {
        url: `${siteConfig.url}/og-image-square.png`,
        width: 1200,
        height: 1200,
        alt: `${siteConfig.name} profile image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.creator,
    title: siteConfig.title,
    description: siteConfig.shortBio,
    images: [`${siteConfig.url}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "itsparam.in",
  },
  verification: {
    google: "WO5xWIFDFFe6h7lIEMnhEEMK7rDztpeIoiTKkHe7OLs",
    other: {
      "msvalidate.01": "D3DA4D66F5C210EDBD5F78589E4A7DD1",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DK123XJTT0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DK123XJTT0');
          `}
        </Script>
        <meta name="theme-color" content="#0B0F19" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${headingFont.variable} ${descriptionFont.variable} ${accentFont.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
