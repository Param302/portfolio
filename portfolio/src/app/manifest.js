export default function manifest() {
  return {
    name: "Parampreet Singh | itsparam.dev",
    short_name: "itsparam.dev",
    description:
      "AI engineer portfolio for Parampreet Singh, featuring product-minded machine learning work and developer-first systems.",
    start_url: "/",
    display: "standalone",
    theme_color: "#0B0F19",
    background_color: "#F8FAFC",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    lang: "en",
    categories: ["portfolio", "personal", "developer", "ai", "tech"],
    shortcuts: [
      {
        name: "About",
        short_name: "About",
        url: "/#about",
        icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
      },
      {
        name: "Work",
        short_name: "Work",
        url: "/#work",
        icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
      },
      {
        name: "Projects",
        short_name: "Projects",
        url: "/#projects",
        icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
      },
      {
        name: "Contact",
        short_name: "Contact",
        url: "/#contact",
        icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
      },
    ],
  };
}
