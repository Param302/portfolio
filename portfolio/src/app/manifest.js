export default function manifset() {
    return {
        name: "Parampreet Singh Portfolio",
        short_name: "Portfolio",
        description: "A Developer, python student and an ML enthusiast.",
        start_url: "/",
        display: "minimal-ui",
        theme_color: "#0040b6",
        background_color: "#f8f8fd",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon"
            }
        ],
        lang: "en",
        categories: ["portfolio", "personal", "developer", "resume", "tech"],
        shortcuts: [
            {
                name: "About",
                short_name: "About",
                url: "/#about",
                icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }]
            },
            {
                name: "Projects",
                short_name: "Projects",
                url: "/#projects",
                icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }]
            },
            {
                name: "Education",
                short_name: "Education",
                url: "/#education",
                icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }]
            },
            {
                name: "Co-Curricular",
                short_name: "Co-Curricular",
                url: "/#co-curricular",
                icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }]
            }
        ]

    }
}