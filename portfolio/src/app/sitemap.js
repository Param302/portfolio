export default function sitemap() {
    const baseUrl = "https://parampreetsingh.me";
    
    const staticPages = [
        { url: "/", lastModified: new Date(), changefreq: "weekly", priority: 1.0 },
    ];

    const redirects = [
        // Socials
        { url: "/github" },
        { url: "/linkedin" },
        { url: "/twitter" },
        { url: "/kaggle" },
        { url: "/yt" },
        { url: "/instagram" },
        { url: "/discord" },
        { url: "/telegram" },
        { url: "/email" },
        
        // Playlist
        { url: "/mlplaylist" },
        { url: "/pythonplaylist" },
        
        // Projects
        { url: "/codetrack" },
        { url: "/heartdiease" },
        { url: "/socialrepo" },
        
        // Notes
        { url: "/notes/ml" },
        { url: "/notes/dbms" },
        { url: "/notes/mad1" },
        { url: "/notes/stats" },
        { url: "/notes/maths" },
        { url: "/pythontalk" },
        
        // Miscellaneous
        { url: "/mlguide" },
        { url: "/resume" },
    ];

    return [
        ...staticPages.map((page) => ({
            url: `${baseUrl}${page.url}`,
            lastModified: page.lastModified || new Date(),
            changefreq: page.changefreq || "weekly",
            priority: page.priority || 0.8,
        })),
        ...redirects.map((redirect) => ({
            url: `${baseUrl}${redirect.url}`,
            lastModified: new Date(),
            changefreq: "yearly",
            priority: 0.7,
        }))
    ];
}
