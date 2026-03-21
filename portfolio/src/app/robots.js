export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            }
        ],
        sitemap: "https://itsparam.dev/sitemap.xml"
    }
}
