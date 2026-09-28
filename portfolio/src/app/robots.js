export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/vendor/", "/workers/"],
                // Keep /admin and /agents.md fetchable so crawlers can read
                // their noindex headers. Authentication protects private data.
            }
        ],
        host: "https://itsparam.in",
        sitemap: "https://itsparam.in/sitemap.xml"
    }
}
