export default function manifest() {
  return {
    name: "Parampreet Singh | itsparam.dev",
    short_name: "itsparam.dev",
    description:
      "AI engineer portfolio for Parampreet Singh, featuring product-minded machine learning work and developer-first systems.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#0B0F19",
    background_color: "#F8FAFC",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    lang: "en",
    categories: ["portfolio", "personal", "developer", "ai", "tech"],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "itsparam.dev homepage preview",
      },
      {
        src: "/og-image-square.png",
        sizes: "1200x1200",
        type: "image/png",
        form_factor: "narrow",
        label: "itsparam.dev profile preview",
      },
    ],
    shortcuts: [
      {
        name: "About",
        short_name: "About",
        url: "/#about",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Work",
        short_name: "Work",
        url: "/#work",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Projects",
        short_name: "Projects",
        url: "/#projects",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        url: "/#contact",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
