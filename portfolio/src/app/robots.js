export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                crawlDelay: 1,
            }
        ],
        host: "https://itsparam.dev",
        sitemap: "https://itsparam.dev/sitemap.xml"
    }
}
