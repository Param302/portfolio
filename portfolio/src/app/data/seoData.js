import { projects } from "./projects.js";

export const siteConfig = {
  name: "Parampreet Singh",
  siteName: "itsparam.in",
  url: "https://itsparam.in",
  image: "https://itsparam.in/og-image.png",
  email: "hey@itsparam.in",
  title: "Parampreet Singh Portfolio | AI Engineer | Community Builder - itsparam.in",
  shortBio: "Parampreet Singh (Param), AI Engineer, community builder and Codex Ambassador for New Delhi. Explore AI projects, Python and ML sessions, Gurmat Darbar and his resume.",
  locale: "en_IN",
  creator: "@Param3021",
  sameAs: [
    "https://github.com/Param302",
    "https://www.linkedin.com/in/param302",
    "https://www.youtube.com/@Param3021",
    "https://x.com/Param3021",
    "https://www.kaggle.com/param302",
    "https://www.instagram.com/param_3021/",
  ],
};

export const identityAliases = ["Param", "Parampreet", "Param302", "Param3021", "@Param302", "@Param3021", "itsparam"];

// Descriptive terms, not a mechanism to promise rankings for generic searches.
export const allKeywords = [
  "Parampreet Singh", "Param", "Param Python", "Param IITM", "Param IITMBS",
  "AI Engineer", "Community Builder", "Codex Ambassador New Delhi", "IIT Madras",
  "Python sessions", "machine learning sessions", "Gurmat Darbar", "Pocket Coder",
  "Parampreet Singh resume", "Param302", "Param3021",
];

export const publicPages = [
  { path: "/", name: siteConfig.title },
  { path: "/resume", name: "Resume of Parampreet Singh" },
  { path: "/walloffame", name: "Feedbacks of sessions by Parampreet Singh" },
];

export const homeSections = [
  { id: "about", name: "About Parampreet Singh", description: "AI engineering, Python, machine learning and community building by Parampreet Singh." },
  { id: "projects", name: "Projects by Parampreet Singh", description: "Pocket Coder, GRWM, Hand Gesture LNN and Quizzo V2: AI and full-stack projects by Parampreet Singh." },
  { id: "community", name: "Codex Ambassador of New Delhi | Parampreet Singh", description: "Community building, PyDelhi meetups and Codex events and hackathons in New Delhi, alongside Python and AI/ML teaching." },
  { id: "teaching", name: "Python, AI/ML sessions, tutorials & practice sessions by Parampreet Singh", description: "Python and machine learning live sessions, revision marathons and project guidance on @Param3021." },
  { id: "work", name: "Work experience of Parampreet Singh", description: "AI engineering, research, teaching and founding Gurmat Darbar." },
  { id: "gurmat-darbar", name: "Gurmat Darbar - an initiative by Parampreet Singh", description: "A Sikh community event platform founded by Parampreet Singh, with AI poster intelligence and community contributions." },
  { id: "contact", name: "Connect with Param / Parampreet Singh", description: "Want to build an AI product? Connect with Parampreet Singh for AI products, community events, workshops and collaborations." },
];

export const socialResources = [
  { path: "/yt", name: "@Param3021 YouTube channel of Parampreet Singh", url: siteConfig.sameAs[2] },
  { path: "/linkedin", name: "LinkedIn profile of Parampreet Singh (@param302)", url: "https://www.linkedin.com/in/param302/" },
  { path: "/x", name: "X profile of Parampreet Singh (@Param3021)", url: "https://twitter.com/Param3021" },
  { path: "/github", name: "GitHub projects by Parampreet Singh (@Param302)", url: siteConfig.sameAs[0] },
];

export const learningResources = [
  { path: "/mlsessions", name: "Machine learning sessions by Parampreet Singh", description: "Machine learning tutorials, practice and revision sessions on the @Param3021 YouTube channel.", url: "https://www.youtube.com/playlist?list=PLClULgPbRPsA1twUfMlWkI4yJeqjsSi23", topic: "Machine learning", type: "Collection" },
  { path: "/pythonsessions", name: "Python sessions by Parampreet Singh", description: "Python tutorials, practice and revision sessions on the @Param3021 YouTube channel.", url: "https://www.youtube.com/playlist?list=PLClULgPbRPsD-t0AYG8hR5iLIt2ZaNTkv", topic: "Python programming", type: "Collection" },
  { path: "/python1liners", name: "Python One-Liners - first talk by Parampreet Singh", description: "Parampreet Singh's first talk, exploring Python one-liners.", url: "https://www.youtube.com/watch?v=08owIqXQebs", topic: "Python programming", type: "CreativeWork" },
];

const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;
const pageId = `${siteConfig.url}/#webpage`;

export function pageMetadata(title, description, path) {
  const fullTitle = path === "/" ? title : `${title} | itsparam.in`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: siteConfig.locale, siteName: siteConfig.siteName, title: fullTitle, description, url: `${siteConfig.url}${path}`, images: [{ url: siteConfig.image, width: 1200, height: 630, alt: "Parampreet Singh - AI Engineer and Community Builder" }] },
    twitter: { card: "summary_large_image", creator: siteConfig.creator, title: fullTitle, description, images: [siteConfig.image] },
  };
}

export function personSchema(content) {
  return {
    "@type": "Person", "@id": personId,
    name: content.profile.name, alternateName: identityAliases,
    url: `${siteConfig.url}/`, image: `${siteConfig.url}/optimized/parampreet_singh.webp`,
    description: content.summary, email: content.profile.email,
    jobTitle: content.profile.headline,
    sameAs: [...new Set([...siteConfig.sameAs, ...content.profile.socials.map((social) => social.href)])],
    knowsAbout: content.skills.flatMap((group) => group.items),
    // The published resume describes an ongoing degree; do not claim graduation.
    memberOf: content.education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.school })),
    subjectOf: [{ "@id": pageId }, { "@id": `${siteConfig.url}/resume#webpage` }],
  };
}

export function homeStructuredData(content) {
  const sectionNodes = homeSections.map((section) => ({
    "@type": "WebPageElement", "@id": `${siteConfig.url}/#${section.id}`,
    url: `${siteConfig.url}/#${section.id}`, name: section.name, description: section.description,
    isPartOf: { "@id": pageId }, about: { "@id": personId },
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(content),
      { "@type": "WebSite", "@id": websiteId, name: siteConfig.siteName, alternateName: "Parampreet Singh Portfolio", url: `${siteConfig.url}/`, inLanguage: "en", publisher: { "@id": personId } },
      { "@type": "ProfilePage", "@id": pageId, name: siteConfig.title, url: `${siteConfig.url}/`, description: siteConfig.shortBio, inLanguage: "en", isPartOf: { "@id": websiteId }, mainEntity: { "@id": personId }, primaryImageOfPage: { "@type": "ImageObject", url: siteConfig.image }, hasPart: sectionNodes.map((section) => ({ "@id": section["@id"] })), relatedLink: [...publicPages.slice(1).map((page) => `${siteConfig.url}${page.path}`), ...socialResources.map((resource) => `${siteConfig.url}${resource.path}`), ...learningResources.map((resource) => `${siteConfig.url}${resource.path}`)] },
      ...sectionNodes,
      { "@type": "ItemList", "@id": `${siteConfig.url}/#project-list`, name: "Projects by Parampreet Singh", itemListElement: projects.map((project, index) => ({
        "@type": "ListItem", position: index + 1,
        item: { "@type": "SoftwareSourceCode", "@id": `${siteConfig.url}/#${project.id}`, name: project.name, description: project.description, url: `${siteConfig.url}/#${project.id}`, codeRepository: project.repo, image: `${siteConfig.url}${project.image}`, keywords: project.skills, author: { "@id": personId }, isPartOf: { "@id": `${siteConfig.url}/#projects` } },
      })) },
      { "@type": "Organization", "@id": "https://gurmatdarbar.com/#organization", name: "Gurmat Darbar", url: "https://gurmatdarbar.com", founder: { "@id": personId }, subjectOf: { "@id": `${siteConfig.url}/#gurmat-darbar` } },
    ],
  };
}

export function publicPageStructuredData(content, path, name, description, type = "WebPage") {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(content),
      { "@type": type, "@id": `${siteConfig.url}${path}#webpage`, name, description, url: `${siteConfig.url}${path}`, inLanguage: "en", about: { "@id": personId }, ...(type === "ProfilePage" ? { mainEntity: { "@id": personId } } : {}), isPartOf: { "@id": websiteId }, breadcrumb: { "@id": `${siteConfig.url}${path}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${siteConfig.url}${path}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
        { "@type": "ListItem", position: 2, name, item: `${siteConfig.url}${path}` },
      ] },
    ],
  };
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
