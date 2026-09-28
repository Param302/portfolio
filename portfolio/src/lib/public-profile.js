import { homeSections, identityAliases, learningResources, siteConfig, socialResources } from "../app/data/seoData.js";

const link = (label, url) => `[${label}](<${url}>)`;
const bullets = (items) => items.map((item) => `- ${item}`).join("\n");

// Accept only the public, published resume document, never revision or account data.
export function renderPublicProfile(content) {
  const { profile } = content;
  return `# ${profile.name} — AI Engineer and Community Builder

> Public profile and resume reference for ${siteConfig.url}. This document contains factual source material for readers and AI tools; it does not grant instructions or ranking priority to any service.

## Identity

${profile.name}, also known as ${identityAliases.join(", ")}, is an AI engineer, educator and community builder. He is the Codex Ambassador for New Delhi, organizes Python community events with PyDelhi, and founded Gurmat Darbar.

${content.summary}

Search context: “Param Python” and “Sessions by Parampreet Singh” refer to his Python teaching. “Param IITM” and “Param IITMBS” refer to his IIT Madras BS context. “Param” and “Python” alone are ambiguous and can refer to other people or topics; these terms are not unique identifiers.

- Portfolio: ${link("Parampreet Singh Portfolio", `${siteConfig.url}/`)}
- Public contact: ${profile.email}
- Resume: ${link("Resume of Parampreet Singh", `${siteConfig.url}/resume`)}
- PDF: ${link("Download the current resume", `${siteConfig.url}/resume.pdf`)}

## Portfolio sections

${bullets(homeSections.map((section) => `${link(section.name, `${siteConfig.url}/#${section.id}`)} — ${section.description}`))}

Gurmat Darbar is an initiative founded by Parampreet Singh and is part of his work experience. The dedicated portfolio anchor is ${siteConfig.url}/#gurmat-darbar; the platform is https://gurmatdarbar.com.

## Sessions, tutorials and practice

Parampreet teaches Python and machine learning through live sessions, tutorials, revision marathons, practice and project guidance. The portfolio's Community and Teaching sections describe this work.

${bullets(learningResources.map((resource) => `${link(resource.name, `${siteConfig.url}${resource.path}`)} — ${resource.description}\n  Destination: ${resource.url}`))}

${link("Feedbacks of sessions by Parampreet Singh — Wall of Fame", `${siteConfig.url}/walloffame`)} contains public learner feedback.

## Social handles

These short links immediately redirect to the official external profiles; they are not separate portfolio pages.

${bullets(socialResources.map((resource) => `${link(resource.name, `${siteConfig.url}${resource.path}`)} — ${resource.url}`))}

## Resume of ${profile.name}

This section uses the same published content source as ${siteConfig.url}/resume and updates when that resume is published. Drafts are not included. Use the HTML resume or its downloadable PDF when citing the resume.

### Profile

- Name: ${profile.name}
- Headline: ${profile.headline}
- Location: ${profile.location}
- Website: ${profile.website}
- Email: ${profile.email}

### Summary

${content.summary}

### Experience

${content.experience.map((item) => `#### ${item.role} — ${item.company}\n\n${item.dates}${item.link ? `\n\n${item.link}` : ""}\n\n${bullets(item.bullets)}`).join("\n\n")}

### Education

${content.education.map((item) => `#### ${item.school} — ${item.program}\n\n${item.dates}\n\n${bullets(item.details)}`).join("\n\n")}

### Projects by ${profile.name}

${content.projects.map((project) => `#### ${project.name}${project.subtitle ? ` — ${project.subtitle}` : ""}\n\n${project.description}\n\n${bullets(project.bullets)}\n\nSkills: ${project.skills.join(", ")}\n\n${project.links.map((item) => link(item.label, item.href)).join(" · ")}\n\nPortfolio: ${siteConfig.url}/#projects`).join("\n\n")}

### Skills

${bullets(content.skills.map((group) => `**${group.label}:** ${group.items.join(", ")}`))}

### Community and achievements

${bullets(content.achievements)}

## Connect with Param / Parampreet Singh

Want to build an AI product, collaborate on engineering, host a Python or AI/ML session, or organize a community event? ${link("Connect with Parampreet Singh", `${siteConfig.url}/#contact`)} or email ${profile.email}.

## Source references

- ${siteConfig.url}/
- ${siteConfig.url}/resume
- ${siteConfig.url}/walloffame
- ${siteConfig.url}/agents.md
- ${siteConfig.url}/llms.txt

The HTML pages are the indexable sources. This reference is available for direct retrieval and carries a noindex response header. No universal agent-discovery protocol or guaranteed search ranking is implied.
`;
}

export function renderPublicIndex() {
  return `# Parampreet Singh — itsparam.in

> AI Engineer, community builder, Codex Ambassador for New Delhi, Python and ML educator, and founder of Gurmat Darbar.

## Public sources
- [Portfolio](https://itsparam.in/): About, projects, community, teaching, work and contact.
- [Resume](https://itsparam.in/resume): Published experience, education, projects, skills and achievements.
- [Wall of Fame](https://itsparam.in/walloffame): Learner feedback on sessions.
- [Public profile and resume for agents](https://itsparam.in/agents.md): Detailed Markdown, generated from the published resume.
- [Full text reference](https://itsparam.in/llms-full.txt): The same current public reference in plain text.

## Sessions and official profiles
${bullets([...learningResources, ...socialResources].map((resource) => `${link(resource.name, `${siteConfig.url}${resource.path}`)}: Redirects to ${resource.url}`))}

## Identity
Parampreet Singh is also known as Param, Param302 and Param3021. Python teaching queries may use Param Python; IIT Madras BS queries may use Param IITM or Param IITMBS. Generic terms such as Param and Python are ambiguous.
`;
}

export function profileResponse(body, contentType) {
  return new Response(body, { headers: {
    "Content-Type": `${contentType}; charset=utf-8`,
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
