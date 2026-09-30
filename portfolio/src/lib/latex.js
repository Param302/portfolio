import resumeTemplate from "../../resume.tex";

// Replace characters in one pass so inserted TeX commands are never escaped again.
function escapeLatex(value = "") {
  const escapes = {
    "\\": "\\textbackslash{}", "#": "\\#", "$": "\\$", "%": "\\%",
    "&": "\\&", "_": "\\_", "{": "\\{", "}": "\\}",
    "~": "\\textasciitilde{}", "^": "\\textasciicircum{}", "|": "\\textbar{}",
  };
  return String(value).replace(/[\\#$%&_{}~^|]/g, (character) => escapes[character]);
}

function href(url, label, underline = true) {
  if (!url) return escapeLatex(label);
  const text = escapeLatex(label);
  return `\\href{${escapeLatex(url)}}{${underline ? `\\underline{${text}}` : text}}`;
}

function cleanLines(items) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function bullets(items) {
  const lines = cleanLines(items);
  if (!lines.length) return "";
  return `\\resumeItemListStart\n${lines.map((item) => `\\resumeItem{${escapeLatex(item)}}`).join("\n")}\n\\resumeItemListEnd`;
}

function list(items) {
  return items.length ? `\\resumeSubHeadingListStart\n${items.join("\n\n")}\n\\resumeSubHeadingListEnd` : "";
}

function section(title, body) {
  return body ? `\\section{\\textbf{${escapeLatex(title)}}}\n${body}` : "";
}

function socialLabel(link) {
  try {
    const url = new URL(link.href);
    const path = url.pathname.replace(/\/$/, "");
    if (/linkedin\.com$/i.test(url.hostname)) return `linkedin/${path.split("/").filter(Boolean).at(-1) || ""}`;
    if (/github\.com$/i.test(url.hostname)) return `github${path}`;
    return `${url.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return link.label;
  }
}

function header(profile) {
  const socials = profile.socials.filter((link) => link.href);
  const linkedIn = socials.find((link) => /linkedin/i.test(link.label + link.href));
  const github = socials.find((link) => /github/i.test(link.label + link.href));
  const left = linkedIn || socials.find((link) => link !== github);
  const right = github || socials.find((link) => link !== left);
  const websiteLabel = profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const rows = [
    `\\textbf{{\\LARGE ${escapeLatex(profile.name)}}} & ${href(`mailto:${profile.email}`, profile.email, false)}`,
    `${profile.website ? `\\href{${escapeLatex(profile.website)}}{Portfolio: \\underline{${escapeLatex(websiteLabel)}}}` : ""} & ${escapeLatex(profile.phone)}`,
  ];
  if (left || right) rows.push(`${left ? `${escapeLatex(left.label)}: ${href(left.href, socialLabel(left))}` : ""} & ${right ? href(right.href, socialLabel(right)) : ""}`);
  for (const link of socials.filter((link) => link !== left && link !== right)) {
    rows.push(`${escapeLatex(link.label)}: ${href(link.href, socialLabel(link))} & `);
  }
  return `\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}\n${rows.join("\\\\\n")}\\\\\n\\end{tabular*}`;
}

export function generateResumeLatex(document) {
  const included = (items) => items.filter((item) => item.includeInPdf !== false);
  const experiences = list(included(document.experience).map((item) => {
    const title = `${escapeLatex(item.role)} \\textbar{} ${escapeLatex(item.company)}${item.link ? ` - ${href(item.link, item.link.replace(/^https?:\/\//, "").replace(/\/$/, ""))}` : ""}`;
    return `\\resumeSubheading{${title}}{${escapeLatex(item.dates)}}{}{}\n${bullets(cleanLines(item.bullets).slice(0, 3))}`;
  }));
  const education = list(included(document.education).map((item) => `\\resumeSubheading{${escapeLatex(`${item.school}, ${item.program}`)}}{${escapeLatex(item.dates)}}{}{}\n${bullets(item.details)}`));
  const projects = list(included(document.projects).map((item) => `\\item
\\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
\\textbf{${escapeLatex(`${item.name}${item.subtitle ? ` | ${item.subtitle}` : ""}`)}} & ${item.links.filter((link) => link.href).map((link) => href(link.href, link.label)).join(" \\textbar{} ")} \\\\
\\end{tabular*}
${item.skills.length ? `{\\small \\textit{Tools: ${escapeLatex(item.skills.join(", "))}}}\n` : ""}\\vspace{-5pt}
${bullets(cleanLines(item.bullets).slice(0, 3))}
\\vspace{2pt}`));
  const skills = list(included(document.skills).map((group) => `\\resumeSubItem{\\textbf{${escapeLatex(group.label)}:}}{${escapeLatex(group.items.join(", "))}}`));
  const achievements = list(cleanLines(document.achievements).map((item) => `\\resumeSubItem{}{${escapeLatex(item)}}`));
  const blocks = {
    header: header(document.profile),
    summary: section("Summary", escapeLatex(document.summary.trim())),
    experience: section("Experience", experiences),
    education: section("Education", education),
    projects: section("Projects", projects),
    skills: section("Skills", skills),
    achievements: section("Co-Curricular & Achievements", achievements ? `\\vspace{5pt}\n${achievements}` : ""),
  };
  return resumeTemplate.replace(/% resume:(\w+):start\r?\n[\s\S]*?% resume:\1:end/g,
    (_, key) => document.pdfSections?.[key] === false ? "" : blocks[key]);
}
