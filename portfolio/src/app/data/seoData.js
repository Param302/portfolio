export const siteConfig = {
    name: "Parampreet Singh",
    siteName: "itsparam.in",
    domain: "itsparam.in",
    url: "https://itsparam.in",
    logo: "https://itsparam.in/icon-512.png",
    image: "https://itsparam.in/og-image.png",
    email: "hey@itsparam.in",
    title: "Parampreet Singh | AI Engineer",
    shortBio:
        "AI/ML Engineer specialized in building production-grade AI systems, currently focused on fine-tuning Small Language Models (SLMs) and scaling Gurmat Darbar, with 70+ live Python and ML sessions delivered to 100K+ learners.",
    location: "India",
    locale: "en_US",
    creator: "@Param3021",
    sameAs: [
        "https://github.com/Param302",
        "https://www.linkedin.com/in/param302",
        "https://www.youtube.com/@Param3021",
        "https://x.com/Param3021",
        "https://www.kaggle.com/param302",
    ],
};

export const keywordLibrary = {
    brand: [
        "Parampreet Singh",
        "Parampreet",
        "Param Singh",
        "Param3021",
        "@Param302",
        "@Param3021",
        "Param302",
        "itsparam",
        "itsparam.in",
        "Parampreet Singh AI engineer",
        "Parampreet Singh portfolio",
        "AI engineer portfolio",
        "IIT Madras student",
    ],
    aiMl: [
        "machine learning",
        "artificial intelligence",
        "genai engineer",
        "LLM engineering",
        "SLM fine tuning",
        "model context protocol",
        "LangGraph",
        "PyTorch",
        "FastAPI",
        "agentic workflows",
        "multi agent systems",
        "deep learning",
        "neural networks",
        "liquid neural networks",
        "LSTM",
        "time series modeling",
        "SFT",
        "PEFT",
        "LoRA",
        "Ollama",
        "AI product engineering",
        "production AI systems",
    ],
    fullStack: [
        "full stack developer",
        "Next.js developer",
        "React portfolio",
        "Tailwind CSS",
        "PostgreSQL",
        "Redis",
        "Celery",
        "Flask",
        "Vue.js",
        "cloud run",
        "GCP",
        "developer portfolio India",
    ],
    projects: [
        "Pocket-Coder",
        "GRWM",
        "Get README With Me",
        "Hand Gesture LNN",
        "Quizzo V2",
        "Gurmat Darbar",
        "Code Track",
        "Heart Disease Predictor",
        "E-Pustakalya",
    ],
    teaching: [
        "python educator",
        "machine learning educator",
        "python sessions hindi",
        "machine learning sessions hindi",
        "python playlist",
        "ml playlist",
        "iit bs degree guidance",
        "diploma course selection",
        "revision sessions",
        "live coding sessions",
        "175k learners",
        "teaching impact",
    ],
    multilingual: [
        "machine learning in hindi",
        "python in hindi",
        "machine learning in punjabi",
        "python in punjabi",
        "ai engineer india",
    ],
    discovery: [
        "Parampreet Singh github",
        "Parampreet Singh linkedin",
        "Parampreet Singh youtube",
        "Param302 portfolio",
        "Param3021 portfolio",
        "itsparam portfolio",
        "AI ML engineer portfolio India",
        "SLM fine tuning engineer",
        "LLM engineer portfolio",
        "Parampreet Singh resume",
        "itsparam contact",
        "Parampreet Singh projects",
    ],
    searchIntent: [
        "hire AI engineer India",
        "AI consultant portfolio",
        "ML engineer for collaboration",
        "GenAI product builder",
        "portfolio with AI projects and resume",
    ],
};

export const allKeywords = Object.values(keywordLibrary)
    .flat()
    .filter((value, index, arr) => arr.indexOf(value) === index);

export const questionLibrary = [
    {
        lang: "en",
        question: "Who is Parampreet Singh?",
        answer:
            "Parampreet Singh is an AI engineer and educator building machine learning products, GenAI workflows, and full-stack applications.",
    },
    {
        lang: "en",
        question: "What does itsparam.in showcase?",
        answer:
            "itsparam.in showcases Parampreet Singh's portfolio, projects, work experience, teaching impact, and ways to connect for collaboration.",
    },
    {
        lang: "en",
        question: "What machine learning projects has Parampreet built?",
        answer:
            "Key projects include Pocket-Coder, Hand Gesture LNN, GRWM, Quizzo V2, and Gurmat Darbar with AI-assisted workflows.",
    },
    {
        lang: "en",
        question: "How can I contact Parampreet Singh?",
        answer: "You can contact Parampreet Singh at hey@itsparam.in.",
    },
    {
        lang: "en",
        question: "Is Param302 or @Param3021 the same person as Parampreet Singh?",
        answer:
            "Yes. Param302 and @Param3021 are handles used by Parampreet Singh across portfolio and social platforms.",
    },
    {
        lang: "en",
        question: "Does Parampreet Singh teach Python and machine learning?",
        answer:
            "Yes. Parampreet teaches Python and machine learning with live sessions, revision marathons, and practical project-focused learning.",
    },
    {
        lang: "hi",
        question: "Parampreet Singh kaun hai?",
        answer:
            "Parampreet Singh ek AI engineer aur educator hain jo machine learning aur GenAI products banate hain.",
    },
    {
        lang: "hi",
        question: "Machine learning seekhne ke liye is website par kya milega?",
        answer:
            "Aapko projects, practical implementations, learning resources, aur teaching impact insights milenge.",
    },
    {
        lang: "hi",
        question: "Python aur ML sessions kaha milenge?",
        answer:
            "Python aur ML learning content ke liye portfolio ke teaching aur playlist sections ko visit karein.",
    },
    {
        lang: "pa",
        question: "Parampreet Singh ki karde ne?",
        answer:
            "Parampreet Singh AI te machine learning products build karde ne ate students nu Python te ML sikhaunde ne.",
    },
    {
        lang: "pa",
        question: "Machine learning bare resources kithe milange?",
        answer:
            "Portfolio te tusi projects, tutorials, te practical ML workflows de examples vekh sakde ho.",
    },
];

export const projectEntities = [
    {
        name: "Pocket-Coder",
        description:
            "A 1.2B parameter local AI coding assistant focused on practical coding help and local inference workflows.",
        url: "https://github.com/param302/pocket-coder",
        keywords: ["SFT", "PEFT", "LoRA", "Ollama", "MCP"],
    },
    {
        name: "GRWM - Get README With Me",
        description:
            "A multi-agent GenAI platform that generates project-tailored GitHub README files.",
        url: "https://github.com/param302/grwm",
        keywords: ["LangGraph", "FastAPI", "Next.js", "GCP"],
    },
    {
        name: "Hand Gesture LNN",
        description:
            "A gesture segmentation and recognition project comparing LNN models against traditional baselines.",
        url: "https://github.com/param302/hand-gesture-lnn",
        keywords: ["Liquid Neural Networks", "LSTM", "PyTorch", "Computer Vision"],
    },
    {
        name: "Quizzo V2",
        description:
            "A full-stack quiz management platform with robust backend task orchestration and data pipelines.",
        url: "https://github.com/param302/quizzo-v2",
        keywords: ["Flask", "Vue.js", "PostgreSQL", "Redis", "Celery"],
    },
];

export const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Parampreet Singh",
    alternateName: [
        "Param",
        "Parampreet",
        "Param302",
        "Param3021",
        "@Param302",
        "@Param3021",
        "itsparam",
    ],
    description: siteConfig.shortBio,
    url: siteConfig.url,
    email: siteConfig.email,
    image: `${siteConfig.url}/parampreet_singh.png`,
    nationality: "Indian",
    knowsLanguage: ["English", "Hindi", "Punjabi"],
    jobTitle: ["AI Engineer", "Machine Learning Engineer", "Educator"],
    alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Indian Institute of Technology Madras",
        sameAs: "https://study.iitm.ac.in/ds",
    },
    worksFor: [
        {
            "@type": "Organization",
            name: "Gurmat Darbar",
            url: "https://gurmatdarbar.com",
        },
    ],
    sameAs: siteConfig.sameAs,
    mainEntityOfPage: siteConfig.url,
    knowsAbout: allKeywords,
    inLanguage: ["en", "hi", "pa"],
};

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.siteName,
    url: siteConfig.url,
    logo: siteConfig.logo,
    email: siteConfig.email,
    founder: {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.url,
    },
    sameAs: siteConfig.sameAs,
};

export const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${siteConfig.name} Portfolio`,
    alternateName: [siteConfig.siteName, "itsparam", "Param302 Portfolio"],
    url: siteConfig.url,
    description: siteConfig.shortBio,
    keywords: allKeywords.join(", "),
    inLanguage: ["en", "hi", "pa"],
    publisher: {
        "@type": "Organization",
        name: siteConfig.siteName,
        url: siteConfig.url,
    },
    about: {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.url,
    },
    potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.url}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
    },
};

export const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${siteConfig.name} | AI/ML Engineer Portfolio`,
    description: siteConfig.shortBio,
    url: siteConfig.url,
    mainEntity: {
        "@type": "Person",
        name: siteConfig.name,
        alternateName: personSchema.alternateName,
        url: siteConfig.url,
        sameAs: personSchema.sameAs,
    },
    inLanguage: ["en", "hi", "pa"],
};

export const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questionLibrary.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
        },
    })),
};

export const projectItemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projectEntities.map((project, index) => ({
        "@type": "SoftwareSourceCode",
        position: index + 1,
        name: project.name,
        description: project.description,
        codeRepository: project.url,
        programmingLanguage: ["Python", "JavaScript"],
        keywords: project.keywords.join(", "),
        author: {
            "@type": "Person",
            name: "Parampreet Singh",
        },
    })),
};

export const homePageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Parampreet Singh | AI Engineer Portfolio",
    url: siteConfig.url,
    description: siteConfig.shortBio,
    isPartOf: {
        "@type": "WebSite",
        name: `${siteConfig.name} Portfolio`,
        url: siteConfig.url,
    },
    primaryImageOfPage: siteConfig.image,
    about: {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.url,
    },
    mainEntity: {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.url,
    },
    inLanguage: ["en", "hi", "pa"],
};

export const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteConfig.url}/`,
        },
        {
            "@type": "ListItem",
            position: 2,
            name: "Resume",
            item: `${siteConfig.url}/resume`,
        },
        {
            "@type": "ListItem",
            position: 3,
            name: "Wall of Fame",
            item: `${siteConfig.url}/walloffame`,
        },
    ],
};