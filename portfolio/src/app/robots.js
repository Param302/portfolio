export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            }
        ],
        sitemap: "https://parampreetsingh.me/sitemap.xml"
    }
}