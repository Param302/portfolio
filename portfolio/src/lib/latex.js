import resumeTemplate from "../../resume.tex";
import { defaultPdfLayout } from "./resume-layout.js";
import { isCustomResumeSection, resolveResumeSections } from "./resume-sections.js";
import { parseResumeInline } from "./resume-inline.js";

// Replace characters in one pass so inserted TeX commands are never escaped again.
function escapeLatex(value = "") {
  const escapes = {
    "\\": "\\textbackslash{}", "#": "\\#", "$": "\\$", "%": "\\%",
    "&": "\\&", "_": "\\_", "{": "\\{", "}": "\\}",
    "~": "\\textasciitilde{}", "^": "\\textasciicircum{}", "|": "\\textbar{}",
  };
  return String(value).replace(/[\\#$%&_{}~^|]/g, (character) => escapes[character]);
}

function pointText(value) {
  // Keep URLs and identifiers (e.g. Python3, model_v2) intact. Numeric quantities
  // use math bold; grouped commas need braces to avoid math punctuation spacing.
  const tokens = /(?:https?:\/\/|www\.)\S+|[\p{L}_][\p{L}\p{N}_]*(?:[-./][\p{L}\p{N}_]+)*|\d+(?:[,.]\d+)*/gu;
  let result = "";
  let offset = 0;
  for (const match of value.matchAll(tokens)) {
    result += escapeLatex(value.slice(offset, match.index));
    result += /^\d/.test(match[0]) ? `\\ensuremath{\\mathbf{${match[0].replace(/,/g, "{,}")}}}` : escapeLatex(match[0]);
    offset = match.index + match[0].length;
  }
  return result + escapeLatex(value.slice(offset));
}

export function formatResumeLatex(value) {
  function render(nodes) {
    return nodes.map((node) => node.type === "text" ? pointText(node.value)
      : `\\${node.type === "strong" ? "textbf" : "textit"}{${render(node.children)}}`).join("");
  }
  return render(parseResumeInline(value));
}

function href(url, label, underline = true) {
  if (!url) return escapeLatex(label);
  // Underline in short segments when necessary so long link labels can wrap.
  const segments = String(label).length > 24
    ? String(label).split(/(?<=[/_.@-])/).flatMap((part) => part.match(/.{1,20}/gu) || [])
    : [String(label)];
  const text = segments.map((part) => underline ? `\\underline{${escapeLatex(part)}}` : escapeLatex(part)).join("\\allowbreak{}");
  return `\\href{${escapeLatex(url)}}{${text}}`;
}

function cleanLines(items) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function bullets(lines) {
  if (!lines.length) return "";
  return `\\resumeItemListStart\n${lines.map((item) => `\\resumeItem{${item}}`).join("\n")}\n\\resumeItemListEnd`;
}

function limited(items, entryLimit, sectionLimit) {
  const limit = entryLimit ?? sectionLimit;
  return limit > 0 ? items.slice(0, limit) : items;
}

function decimal(value) { return Number(value.toFixed(3)); }

function layoutBlock(settings) {
  const dimensions = [
    ["FontSize", "fontSize", 8.5, 11],
    ["LineHeight", "lineHeight", 1, 1.5],
    ["BulletGap", "bulletGap", 0, 6],
    ["EntryGap", "entryGap", 0, 16],
    ["SectionGap", "sectionGap", 4, 24],
  ];
  const values = Object.fromEntries(dimensions.map(([name, key, minimum, maximum]) => {
    const value = typeof settings[key] === "number" && Number.isFinite(settings[key]) ? settings[key] : defaultPdfLayout[key];
    return [name, decimal(Math.max(minimum, Math.min(maximum, value)))];
  }));
  return [
    `\\newcommand{\\resumeFontSize}{${values.FontSize}}`,
    `\\newcommand{\\resumeBaseline}{${decimal(values.FontSize * values.LineHeight)}}`,
    `\\newcommand{\\resumeToolsSize}{${decimal(values.FontSize - 0.5)}}`,
    `\\newcommand{\\resumeSectionSize}{${decimal(values.FontSize + 2)}}`,
    `\\newcommand{\\resumeSectionBaseline}{${decimal((values.FontSize + 2) * values.LineHeight)}}`,
    `\\newcommand{\\resumeBulletGap}{${values.BulletGap}pt}`,
    `\\newcommand{\\resumeEntryGap}{${values.EntryGap}pt}`,
    `\\newcommand{\\resumeSectionGap}{${values.SectionGap}pt}`,
  ].join("\n");
}

function list(items, points = false) {
  const macro = points ? "resumePointList" : "resumeSubHeadingList";
  return items.length ? `\\${macro}Start\n${items.join("\n\n")}\n\\${macro}End` : "";
}

function section(title, body) {
  return body ? `\\section{\\textbf{${escapeLatex(title)}}}\n${body}` : "";
}

function labeledPoint(point) {
  const label = (point.label || "").trim().replace(/[:\s]+$/, "");
  return `${label ? `\\textbf{${formatResumeLatex(label)}:} ` : ""}${formatResumeLatex(point.text.trim())}`;
}

function customSectionBody(section) {
  if (section.format === "text") return formatResumeLatex(section.text.trim()).replace(/\r?\n/g, "\\par\n");
  return list(section.items
    .filter((point) => point.includeInPdf !== false && point.text?.trim())
    .map((point) => `\\resumeSubItem{}{${labeledPoint(point)}}`), true);
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
  const socials = profile.socials.filter((link) => link.includeInPdf !== false && link.href);
  const websiteLabel = profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const rows = [
    `\\resumeHeaderRow{\\textbf{{\\LARGE ${escapeLatex(profile.name)}}}}{${href(`mailto:${profile.email}`, profile.email, false)}}`,
    `\\resumeHeaderRow{${profile.website ? `\\href{${escapeLatex(profile.website)}}{Portfolio: \\underline{${escapeLatex(websiteLabel)}}}` : ""}}{${escapeLatex(profile.phone)}}`,
  ];
  for (let index = 0; index < socials.length; index += 2) {
    const [left, right] = socials.slice(index, index + 2);
    rows.push(`\\resumeHeaderRow{${escapeLatex(left.label)}: ${href(left.href, socialLabel(left))}}{${right ? href(right.href, socialLabel(right)) : ""}}`);
  }
  return rows.join("\n");
}

export function generateResumeLatex(document) {
  const layout = { ...defaultPdfLayout, ...document.pdfLayout };
  const included = (items) => items.filter((item) => item.includeInPdf !== false);
  const experiences = list(included(document.experience).map((item) => {
    const title = `${escapeLatex(item.role)} \\textbar{} ${escapeLatex(item.company)}${item.link ? ` - ${href(item.link, item.link.replace(/^https?:\/\//, "").replace(/\/$/, ""))}` : ""}`;
    const points = limited(cleanLines(item.bullets), item.pdfBulletLimit, layout.experienceBulletLimit);
    return `\\resumeSubheading{${title}}{${escapeLatex(item.dates)}}{}{}\n${bullets(points.map(formatResumeLatex))}`;
  }));
  const education = list(included(document.education).map((item) => {
    const details = included(item.details.map((point) => typeof point === "string" ? { text: point } : point)).filter((point) => point.text.trim());
    const points = limited(details, item.pdfBulletLimit, layout.educationBulletLimit).map(labeledPoint);
    const right = [item.score, item.dates].filter((value) => value?.trim()).join(" | ");
    return `\\resumeSubheading{${escapeLatex(`${item.school}, ${item.program}`)}}{${escapeLatex(right)}}{}{}\n${bullets(points)}`;
  }));
  const projects = list(included(document.projects).map((item) => {
    const title = `\\textbf{${escapeLatex(`${item.name}${item.subtitle ? ` | ${item.subtitle}` : ""}`)}}`;
    const tools = item.skills.length && layout.projectToolsPlacement !== "hidden" ? `\\resumeTools{${item.skills.map(formatResumeLatex).join(", ")}}` : "";
    const heading = `${title}${tools && layout.projectToolsPlacement === "heading" ? ` ${tools}` : ""}`;
    const links = included(item.links).filter((link) => link.href).map((link) => href(link.href, link.label)).join(" \\textbar{} ");
    const points = limited(cleanLines(item.bullets), item.pdfBulletLimit, layout.projectBulletLimit);
    return `\\resumeEntryHeading{${heading}}{${links}}\n${tools && layout.projectToolsPlacement === "line" ? `${tools}\\par\n` : ""}${bullets(points.map(formatResumeLatex))}`;
  }));
  const skills = list(included(document.skills).map((group) => `\\resumeSubItem{\\textbf{${formatResumeLatex(group.label)}:}}{${group.items.map(formatResumeLatex).join(", ")}}`), true);
  const achievements = list(cleanLines(included(document.achievements).map((item) => typeof item === "string" ? item : item.text)).map((item) => `\\resumeSubItem{}{${formatResumeLatex(item)}}`), true);
  const bodies = {
    summary: formatResumeLatex(document.summary.trim()),
    experience: experiences,
    education,
    projects,
    skills,
    achievements,
  };
  const blocks = {
    layout: layoutBlock(layout),
    header: header(document.profile),
    sections: resolveResumeSections(document)
      .filter((item) => isCustomResumeSection(item) ? item.includeInPdf !== false : document.pdfSections?.[item.id] !== false)
      .map((item) => section(item.title, isCustomResumeSection(item) ? customSectionBody(item) : bodies[item.id]))
      .filter(Boolean)
      .join("\n\n"),
  };
  return resumeTemplate.replace(/% resume:(\w+):start\r?\n[\s\S]*?% resume:\1:end/g,
    (_, key) => blocks[key]);
}
