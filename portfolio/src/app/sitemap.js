export default function sitemap() {
    const baseUrl = "https://parampreetsingh.me";
    
    const staticPages = [
        { url: "/", lastModified: new Date(), changefreq: "weekly", priority: 1.0 },
    ];

    const redirects = [
        // Socials
        { url: "/github" },
        { url: "/linkedin" },
        { url: "/x" },
        { url: "/twitter" },
        { url: "/kaggle" },
        { url: "/yt" },
        { url: "/youtube" },
        { url: "/instagram" },
        { url: "/discord" },
        { url: "/telegram" },
        { url: "/email" },
        { url: "/mail" },
        { url: "/contact" },
        { url: "/contactme" },
        { url: "/mailme" },
    
        // Playlist
        { url: "/mlplaylist" },
        { url: "/mlp" },
        { url: "/mlpsessions" },
        { url: "/mlsessions" },
        { url: "/ml" },
        { url: "/pythonplaylist" },
        { url: "/python" },
        { url: "/pythonsessions" },
        { url: "/diplomacourselection" },
        { url: "/diplomacourse" },
        { url: "/diplomacourseselectionvideo" },
        { url: "/diplomacoursevideo" },
    
        // Projects
        { url: "/codetrack" },
        { url: "/code-track" },
        { url: "/heartdiease" },
        { url: "/heartdiseasepredictor" },
        { url: "/heart-disease-predictor" },
        { url: "/socialrepo" },
    
        // Notes
        { url: "/notes/ml" },
        { url: "/mlnotes" },
        { url: "/notes/dbms" },
        { url: "/dbmsnotes" },
        { url: "/notes/mad1" },
        { url: "/mad1notes" },
        { url: "/notes/stats" },
        { url: "/notes/stats2" },
        { url: "/statsnotes" },
        { url: "/stats2notes" },
        { url: "/notes/maths" },
        { url: "/notes/maths2" },
        { url: "/mathsnotes" },
        { url: "/maths2notes" },
        { url: "/pythontalk" },
        { url: "/python1liner" },
        { url: "/mlguide" },
        { url: "/resume" }
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
