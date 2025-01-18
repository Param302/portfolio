export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            }
        ],
        sitemap: "https://param302.vercel.app/sitemap.xml"
    }
}