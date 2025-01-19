/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            // socials
            {
                source: "/github",
                destination: "https://github.com/Param302",
                permanent: true
            },
            {
                source: "/linkedin",
                destination: "https://www.linkedin.com/in/param302/",
                permanent: true
            },
            {
                source: "/(x|twitter)",
                destination: "https://twitter.com/Param3021",
                permanent: true
            },
            {
                source: "/kaggle",
                destination: "https://www.kaggle.com/param302",
                permanent: true
            },
            {
                source: "/(yt|youtube)",
                destination: "https://www.youtube.com/@Param3021",
                permanent: true
            },
            {
                source: "/instagram",
                destination: "https://www.instagram.com/param_3021/",
                permanent: true
            },
            {
                source: "/discord",
                destination: "https://discordapp.com/users/531398388516651029",
                permanent: true
            },
            {
                source: "/telegram",
                destination: "https://t.me/Param_302",
                permanent: true
            },
            {
                source: "/(email|mail|contact|contactme|mailme)",
                destination: "mailto:connectwithparam.30@gmail.com",
                permanent: true
            },
            // playlist
            {
                source: "/(mlplaylist|mlp|mlpsessions|mlsessions|ml)",
                destination: "https://www.youtube.com/playlist?list=PLClULgPbRPsA1twUfMlWkI4yJeqjsSi23",
                permanent: true
            },
            {
                source: "/(pythonplaylist|python|pythonsessions|pythonsessions)",
                destination: "https://www.youtube.com/playlist?list=PLClULgPbRPsD-t0AYG8hR5iLIt2ZaNTkv",
                permanent: true
            },
            {
                source: "/(diplomacourselection|diplomacourse|diplomacourseselectionvideo|diplomacoursevideo)",
                destination: "https://youtu.be/jVCW6NY4yOI?si=X69R7T8rSXLlRe2M",
                permanent: true
            },
            // projects
            {
                source: "/(codetrack|code-track)",
                destination: "https://code-track.vercel.app/",
                permanent: true
            },
            {
                source: "/(heartdiease|heartdiseasepredictor|heart-disease-predictor)",
                destination: "https://github.com/Param302/Heart-Disease-predictor",
                permanent: true
            },
            {
                source: "/socialrepo",
                destination: "https://github.com/Param302/SocialRepo",
                permanent: true
            },
            // notes
            {
                source: "/(notes/ml|mlnotes)",
                destination: "https://github.com/Param302/ML-specialization-notes",
                permanent: true
            },
            {
                source: "/(notes/dbms|dbmsnotes)",
                destination: "https://drive.google.com/drive/folders/1zOxUAgJMIYTI17GPgcjBqGtOR7NjTnkW?usp=sharing",
                permanent: true
            },
            {
                source: "/(notes/mad1|mad1notes)",
                destination: "https://drive.google.com/drive/folders/1FMKmQS44NC5rpyBQyabC5S2qRVL4FIJx?usp=sharing",
                permanent: true
            },
            {
                source: "/(notes/stats|notes/stats2|statsnotes|stats2notes)",
                destination: "https://drive.google.com/drive/folders/13Lz5jXGQTG_NlD1L9A4C-N6y1XH71qKe?usp=sharing",
                permanent: true
            },
            {
                source: "/(notes/maths|notes/maths2|mathsnotes|maths2notes)",
                destination: "https://drive.google.com/drive/folders/13IBIpmulq9f-vUHPDXHFyW-leH8AE8M7?usp=sharing",
                permanent: true
            },
            {
                source: "/(pythontalk|python1liner)",
                destination: "https://www.youtube.com/watch?v=08owIqXQebs",
                permanent: true
            },
            {
                source: "/mlguide",
                destination: "https://twitter.com/Param3021/status/1540740439095246848?t=DTPxi4Nd07sAt5zcQtUsUg&s=19",
                permanent: true
            },
            {
                source: "/resume",
                destination: "https://drive.google.com/file/d/1Gtjs8xT8WaPJ9FO1poC-u3Hnw9rHHRKY/view",
                permanent: true
            }
        ]
    }
};

export default nextConfig;
