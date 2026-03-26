export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                crawlDelay: 1,
            }
        ],
        host: "https://itsparam.in",
        sitemap: "https://itsparam.in/sitemap.xml"
    }
}
