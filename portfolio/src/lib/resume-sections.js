export const defaultResumeSections = [
  { id: "summary", title: "Summary" },
  { id: "experience", title: "Experience" },
  { id: "education", title: "Education" },
  { id: "projects", title: "Projects" },
  { id: "skills", title: "Skills" },
  { id: "achievements", title: "Co-Curricular & Achievements" },
];

// Draft previews and older revisions may not have a complete section list yet.
export function resolveResumeSections(document) {
  const defaults = new Map(defaultResumeSections.map((section) => [section.id, section]));
  const seen = new Set();
  const sections = [];
  for (const section of Array.isArray(document?.sections) ? document.sections : []) {
    const fallback = defaults.get(section?.id);
    if (!fallback || seen.has(section.id)) continue;
    seen.add(section.id);
    sections.push({ id: section.id, title: typeof section.title === "string" && section.title.trim() ? section.title.trim() : fallback.title });
  }
  for (const section of defaultResumeSections) {
    if (!seen.has(section.id)) sections.push({ ...section });
  }
  return sections;
}
