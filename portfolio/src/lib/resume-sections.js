export const defaultResumeSections = [
  { id: "summary", title: "Summary" },
  { id: "experience", title: "Experience" },
  { id: "education", title: "Education" },
  { id: "projects", title: "Projects" },
  { id: "skills", title: "Skills" },
  { id: "achievements", title: "Co-Curricular & Achievements" },
];

export function isProtectedResumeSection(id) {
  return id === "experience" || id === "projects";
}

export function isCustomResumeSection(section) {
  return section?.type === "custom" && typeof section.id === "string" && /^custom-[a-zA-Z0-9-]+$/.test(section.id);
}

// An explicit list owns its order and optional removals. Only older revisions
// without a list receive all defaults; protected sections remain safe in drafts.
export function resolveResumeSections(document) {
  if (!Array.isArray(document?.sections)) return defaultResumeSections.map((section) => ({ ...section }));
  const defaults = new Map(defaultResumeSections.map((section) => [section.id, section]));
  const seen = new Set();
  const sections = [];
  for (const section of document.sections) {
    const fallback = defaults.get(section?.id);
    if ((!fallback && !isCustomResumeSection(section)) || seen.has(section.id)) continue;
    seen.add(section.id);
    const title = isProtectedResumeSection(section.id) ? fallback.title : typeof section.title === "string" && section.title.trim() ? section.title.trim() : fallback?.title || "Untitled section";
    sections.push(fallback ? { id: section.id, title } : {
      ...section,
      title,
      format: section.format === "text" ? "text" : "bullets",
      text: typeof section.text === "string" ? section.text : "",
      items: Array.isArray(section.items) ? section.items : [],
      includeInPdf: section.includeInPdf !== false,
    });
  }
  for (const section of defaultResumeSections) {
    if (isProtectedResumeSection(section.id) && !seen.has(section.id)) sections.push({ ...section });
  }
  return sections;
}
