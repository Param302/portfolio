import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { register } from "node:module";
import test from "node:test";
import { defaultResumeDocument } from "../src/lib/resume-schema.js";

// Next bundles .tex as source. Give Node the same module semantics for tests.
register(`data:text/javascript,${encodeURIComponent(`
  import { readFile } from "node:fs/promises";
  export async function load(url, context, nextLoad) {
    if (url.endsWith(".tex")) return {
      format: "module", shortCircuit: true,
      source: "export default " + JSON.stringify(await readFile(new URL(url), "utf8")),
    };
    return nextLoad(url, context);
  }
`)}`, import.meta.url);
const { generateResumeLatex } = await import("../src/lib/latex.js");

const fixture = () => structuredClone(defaultResumeDocument);

test("the PDF uses the single canonical template and replaces every example block", async () => {
  const template = await readFile(new URL("../resume.tex", import.meta.url), "utf8");
  const source = generateResumeLatex(fixture());
  const withoutSettings = (text) => text.split("\\begin{document}")[0]
    .replace(/% resume:layout:(start|end)/g, "").replace(/\s+/g, " ").trim();
  assert.equal(withoutSettings(source), withoutSettings(template));
  assert.doesNotMatch(source, /% resume:|Core Subjects:|Gold Badge/);
  assert.match(source, /\\resumeSubheading\{Founder \\textbar\{\} Gurmat Darbar/);
  assert.match(source, /\\resumeItemListStart/);
  assert.doesNotMatch(source, /A 1\.2B parameter local coding assistant/);
});

test("experience links and every project link are underlined and retained", () => {
  const source = generateResumeLatex(fixture());
  assert.ok(source.includes("\\href{https://gurmatdarbar.com}{\\underline{gurmatdarbar.com}}"));
  assert.ok(source.includes("\\href{https://getreadmewithme.vercel.app}{\\underline{Live}} \\textbar{} \\href{https://github.com/param302/grwm}{\\underline{GitHub}}"));
  assert.ok(source.includes("Portfolio: \\underline{itsparam.in}"));
  assert.ok(source.includes("\\underline{linkedin/param302}"));
});

test("literal separators and special characters cannot become TeX commands", () => {
  const document = fixture();
  document.summary = String.raw`C:\work | #1 $2 20% & _ {x} ~ ^`;
  const source = generateResumeLatex(document);
  assert.ok(source.includes(String.raw`C:\textbackslash{}work \textbar{} \#1 \$2 20\% \& \_ \{x\} \textasciitilde{} \textasciicircum{}`));
  assert.doesNotMatch(source, /textbackslash\\\{/);
});

test("PDF exclusions omit whole sections and entries without mutating website content", () => {
  const document = fixture();
  document.pdfSections = { summary: false, achievements: false };
  document.experience[0].includeInPdf = false;
  document.education[0].includeInPdf = false;
  document.projects[0].includeInPdf = false;
  document.skills[0].includeInPdf = false;
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  for (const omitted of ["\\section{\\textbf{Summary}}", "Co-Curricular", "Gurmat Darbar", "\\section{\\textbf{Education}}", "Pocket Coder", "Languages:"]) assert.ok(!source.includes(omitted), omitted);
  for (const retained of ["Freelance AI Engineer", "GRWM", "ML / GenAI"]) assert.ok(source.includes(retained), retained);
  assert.deepEqual(document, before);
});

test("every section can be independently excluded and legacy documents include all sections", () => {
  const titles = { summary: "Summary", experience: "Experience", education: "Education", projects: "Projects", skills: "Skills", achievements: "Co-Curricular \\& Achievements" };
  for (const [key, title] of Object.entries(titles)) {
    const document = fixture();
    delete document.pdfSections;
    assert.ok(generateResumeLatex(document).includes(`\\section{\\textbf{${title}}}`));
    document.pdfSections = { [key]: false };
    assert.ok(!generateResumeLatex(document).includes(`\\section{\\textbf{${title}}}`));
  }
});

test("default PDF limits retain the first three non-empty bullets per experience and project", () => {
  const document = fixture();
  for (const key of ["experience", "projects"]) {
    document[key].forEach((item, index) => {
      item.bullets = [" ", ...Array.from({ length: 7 }, (_, point) => `${key}-${index}-point-${point + 1}`), ""];
    });
  }
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  for (const key of ["experience", "projects"]) {
    document[key].forEach((_, index) => {
      for (let point = 1; point <= 7; point += 1) assert.equal(source.includes(`${key}-${index}-point-${point}`), point <= 3);
    });
  }
  assert.deepEqual(document, before);
});

test("all six PDF sections follow saved titles and order while retaining their content", () => {
  const document = fixture();
  document.sections = [
    { id: "skills", title: "Technical toolkit" },
    { id: "projects", title: "Selected builds" },
    { id: "education", title: "Academic background" },
    { id: "experience", title: "Industry work" },
    { id: "achievements", title: "Community contributions" },
    { id: "summary", title: "About me" },
  ];
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  const sectionStarts = document.sections.map(({ title }) => source.indexOf(`\\section{\\textbf{${title}}}`));
  assert.ok(sectionStarts.every((offset, index) => offset >= 0 && (index === 0 || offset > sectionStarts[index - 1])));
  const content = ["Languages:", "Pocket Coder", "IIT Madras", "Gurmat Darbar", "Official Codex Ambassador", "AI Engineer shipping production systems"];
  content.forEach((text, index) => {
    const end = sectionStarts[index + 1] ?? source.indexOf("\\end{document}");
    assert.ok(source.slice(sectionStarts[index], end).includes(text), text);
  });
  assert.ok(source.indexOf("\\resumeHeaderRow{\\textbf") < sectionStarts[0]);
  assert.equal((source.match(/\\section\{\\textbf\{/g) || []).length, 6);
  assert.deepEqual(document, before);
});

test("custom PDF section titles escape TeX metacharacters", () => {
  const document = fixture();
  document.sections = [
    { id: "summary", title: String.raw`Research & work | 100% _ {x} \ # $ ~ ^` },
    { id: "experience", title: "Experience" },
    { id: "education", title: "Education" },
    { id: "projects", title: "Projects" },
    { id: "skills", title: "Skills" },
    { id: "achievements", title: "Co-Curricular & Achievements" },
  ];
  const source = generateResumeLatex(document);
  assert.ok(source.includes(String.raw`\section{\textbf{Research \& work \textbar{} 100\% \_ \{x\} \textbackslash{} \# \$ \textasciitilde{} \textasciicircum{}}}`));
  assert.ok(source.includes(document.summary));
});

test("renamed and reordered sections still obey PDF visibility by stable ID", () => {
  const document = fixture();
  document.sections = [
    { id: "experience", title: "Industry work" },
    { id: "achievements", title: "Community contributions" },
    { id: "summary", title: "Profile" },
    { id: "skills", title: "Toolkit" },
    { id: "education", title: "Academic background" },
    { id: "projects", title: "Selected builds" },
  ];
  document.pdfSections = { experience: false, achievements: false };
  const source = generateResumeLatex(document);
  for (const omitted of ["Industry work", "Community contributions", "Gurmat Darbar", "Official Codex Ambassador"]) assert.ok(!source.includes(omitted), omitted);
  for (const retained of ["Profile", "Toolkit", "Academic background", "Selected builds", "Pocket Coder"]) assert.ok(source.includes(retained), retained);
});

test("legacy documents retain the original section titles and order", () => {
  const document = fixture();
  delete document.sections;
  const source = generateResumeLatex(document);
  const titles = ["Summary", "Experience", "Education", "Projects", "Skills", String.raw`Co-Curricular \& Achievements`];
  const positions = titles.map((title) => source.indexOf(`\\section{\\textbf{${title}}}`));
  assert.ok(positions.every((offset, index) => offset >= 0 && (index === 0 || offset > positions[index - 1])));
});

test("empty renamed sections are omitted without disturbing the remaining order", () => {
  const document = fixture();
  document.sections = [
    { id: "summary", title: "Empty profile" },
    { id: "achievements", title: "Empty community" },
    { id: "skills", title: "Toolkit" },
    { id: "education", title: "Education" },
    { id: "projects", title: "Selected builds" },
    { id: "experience", title: "Empty experience" },
  ];
  document.summary = "   ";
  document.achievements = [{ text: "  " }, { text: "Excluded", includeInPdf: false }];
  document.experience.forEach((item) => { item.includeInPdf = false; });
  const source = generateResumeLatex(document);
  assert.doesNotMatch(source, /Empty profile|Empty community|Empty experience/);
  assert.ok(source.indexOf("\\section{\\textbf{Toolkit}}") < source.indexOf("\\section{\\textbf{Education}}"));
  assert.ok(source.indexOf("\\section{\\textbf{Education}}") < source.indexOf("\\section{\\textbf{Selected builds}}"));
});

test("education details support optional bold labels, PDF visibility, and legacy strings", () => {
  const document = fixture();
  document.education[0].details = [
    { label: "Core subjects:", text: "LLMs & Gen AI", includeInPdf: true },
    { label: "Completed diplomas: :", text: "Programming; Data Science" },
    { label: "Hidden", text: "Excluded detail", includeInPdf: false },
    { label: "Empty", text: "   " },
    { label: "", text: "A detail without a label" },
    "Legacy education detail",
  ];
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  assert.ok(source.includes(String.raw`\resumeItem{\textbf{Core subjects:} LLMs \& Gen AI}`));
  assert.ok(source.includes(String.raw`\resumeItem{\textbf{Completed diplomas:} Programming; Data Science}`));
  assert.ok(source.includes(String.raw`\resumeItem{A detail without a label}`));
  assert.ok(source.includes(String.raw`\resumeItem{Legacy education detail}`));
  assert.doesNotMatch(source, /Excluded detail|\\textbf\{Empty:|::|\[object Object\]/);
  assert.deepEqual(document, before);
});

test("education joins score and dates without a dangling separator", () => {
  const document = fixture();
  const school = document.education[0];
  school.score = "GPA: 8.3";
  school.dates = "Sept 2022 - Present";
  assert.ok(generateResumeLatex(document).includes(String.raw`{GPA: 8.3 \textbar{} Sept 2022 - Present}{}{}`));
  school.dates = "";
  assert.ok(generateResumeLatex(document).includes("{GPA: 8.3}{}{}"));
  school.score = "";
  school.dates = "Sept 2022 - Present";
  assert.ok(generateResumeLatex(document).includes("{Sept 2022 - Present}{}{}"));
});

test("section bullet limits and per-entry overrides apply after filtering without mutating the document", () => {
  const document = fixture();
  document.pdfLayout = { experienceBulletLimit: 2, projectBulletLimit: 1, educationBulletLimit: 2 };
  document.experience = document.experience.slice(0, 3);
  document.projects = document.projects.slice(0, 3);
  for (const section of ["experience", "projects"]) {
    document[section].forEach((item, index) => {
      item.pdfBulletLimit = [null, 0, 4][index];
      item.bullets = ["", ...Array.from({ length: 5 }, (_, point) => `${section}entry${index}point${point + 1}`)];
    });
  }
  document.education[0].details = [
    { text: "excludededucation", includeInPdf: false },
    { text: "   " },
    ...Array.from({ length: 5 }, (_, point) => ({ label: "Study", text: `educationpoint${point + 1}` })),
  ];
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  for (const section of ["experience", "projects"]) {
    const inherited = section === "experience" ? 2 : 1;
    document[section].forEach((_, index) => {
      const expected = [inherited, 5, 4][index];
      for (let point = 1; point <= 5; point += 1) assert.equal(source.includes(`${section}entry${index}point${point}`), point <= expected);
    });
  }
  assert.ok(source.includes("educationpoint2"));
  assert.doesNotMatch(source, /educationpoint3|excludededucation/);
  assert.deepEqual(document, before);
  document.education[0].pdfBulletLimit = 0;
  assert.ok(generateResumeLatex(document).includes("educationpoint5"));
  document.education[0].pdfBulletLimit = 1;
  assert.ok(!generateResumeLatex(document).includes("educationpoint2"));
});

test("zero section limits retain every experience, project, and education point", () => {
  const document = fixture();
  document.pdfLayout = { experienceBulletLimit: 0, projectBulletLimit: 0, educationBulletLimit: 0 };
  document.experience[0].bullets = Array.from({ length: 8 }, (_, index) => `experienceunlimited${index}`);
  document.projects[0].bullets = Array.from({ length: 8 }, (_, index) => `projectunlimited${index}`);
  document.education[0].details = Array.from({ length: 8 }, (_, index) => `educationunlimited${index}`);
  const source = generateResumeLatex(document);
  for (const section of ["experience", "project", "education"]) assert.ok(source.includes(`${section}unlimited7`));
});

test("font size, leading, and each spacing setting produce independent dimensions", () => {
  const document = fixture();
  document.pdfLayout = { fontSize: 8.5, lineHeight: 1.2, bulletGap: 1.5, entryGap: 6, sectionGap: 10 };
  const source = generateResumeLatex(document);
  for (const setting of [
    String.raw`\newcommand{\resumeFontSize}{8.5}`,
    String.raw`\newcommand{\resumeBaseline}{10.2}`,
    String.raw`\newcommand{\resumeToolsSize}{8}`,
    String.raw`\newcommand{\resumeBulletGap}{1.5pt}`,
    String.raw`\newcommand{\resumeEntryGap}{6pt}`,
    String.raw`\newcommand{\resumeSectionGap}{10pt}`,
  ]) assert.ok(source.includes(setting), setting);
  assert.doesNotMatch(source, /\\vspace\{-|\\resizebox|\\enlargethispage/);
  assert.ok(source.includes(String.raw`\section{\textbf{Skills}}` + "\n\\resumePointListStart"));
  assert.ok(source.includes(String.raw`\section{\textbf{Co-Curricular \& Achievements}}` + "\n\\resumePointListStart"));
  document.pdfLayout = { fontSize: 11, lineHeight: 1.5 };
  const expanded = generateResumeLatex(document);
  assert.ok(expanded.includes(String.raw`\newcommand{\resumeBaseline}{16.5}`));
  assert.ok(expanded.includes(String.raw`\newcommand{\resumeFontSize}{11}`));
});

test("draft layout values cannot introduce TeX commands or invalid dimensions", () => {
  const document = fixture();
  document.pdfLayout = { fontSize: String.raw`9}\input{bad`, lineHeight: Infinity, bulletGap: -4, entryGap: 999, sectionGap: NaN };
  const source = generateResumeLatex(document);
  assert.doesNotMatch(source, /input\{bad|Infinity|NaN/);
  assert.ok(source.includes(String.raw`\newcommand{\resumeFontSize}{9}`));
  assert.ok(source.includes(String.raw`\newcommand{\resumeBulletGap}{0pt}`));
  assert.ok(source.includes(String.raw`\newcommand{\resumeEntryGap}{16pt}`));
});

test("project tools use small italic brackets in the heading, on a separate line, or are hidden", () => {
  const document = fixture();
  document.projects = [document.projects[0]];
  const toolText = String.raw`\resumeTools{PyTorch, LoRA, SFT, Ollama, MCP}`;
  const heading = generateResumeLatex(document);
  assert.ok(heading.includes(String.raw`\resumeEntryHeading{\textbf{Pocket Coder \textbar{} Local Coding Assistant} ` + toolText + "}"));
  assert.ok(heading.includes(String.raw`\textit{[#1]}`));
  assert.doesNotMatch(heading, /Tools:/);
  document.pdfLayout = { projectToolsPlacement: "line" };
  assert.ok(generateResumeLatex(document).includes(`${toolText}\\par\n\\resumeItemListStart`));
  document.pdfLayout.projectToolsPlacement = "hidden";
  assert.ok(!generateResumeLatex(document).includes(toolText));
  assert.deepEqual(document.projects[0].skills, ["PyTorch", "LoRA", "SFT", "Ollama", "MCP"]);
});

test("long headings use bounded columns while bullets can continue across pages", () => {
  const document = fixture();
  document.experience[0].link = "https://example.com/a-very-long-reference-page-for-this-experience";
  const source = generateResumeLatex(document);
  assert.ok(source.includes(String.raw`\setlength{\resumeRightWidth}{0.35\linewidth}`));
  assert.ok(source.includes(String.raw`\dimexpr\linewidth-\resumeRightWidth-1em\relax`));
  assert.ok(source.includes(String.raw`\allowbreak{}`));
  assert.doesNotMatch(source, /\\begin\{tabular\*\}/);
  const entry = source.slice(source.indexOf("\\resumeSubheading{Founder"));
  assert.ok(entry.indexOf("\\resumeItemListStart") > entry.indexOf("{}{}"));
});

test("education and achievements retain more than three points in the PDF", () => {
  const document = fixture();
  document.education[0].details = ["Education one", "Education two", "Education three", "Education four"];
  document.achievements = ["Achievement one", "Achievement two", "Achievement three", "Achievement four"];
  const source = generateResumeLatex(document);
  assert.ok(source.includes("Education four"));
  assert.ok(source.includes("Achievement four"));
});

test("individual social and project links can be excluded only from the PDF", () => {
  const document = fixture();
  document.profile.socials = [
    { label: "Visible", href: "https://example.com/visible-social" },
    { label: "Hidden", href: "https://example.com/hidden-social", includeInPdf: false },
  ];
  document.projects[0].links = [
    { label: "Visible project", href: "https://example.com/visible-project", includeInPdf: true },
    { label: "Hidden project", href: "https://example.com/hidden-project", includeInPdf: false },
  ];
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  for (const retained of ["https://example.com/visible-social", "https://example.com/visible-project"]) assert.ok(source.includes(retained), retained);
  for (const omitted of ["https://example.com/hidden-social", "https://example.com/hidden-project"]) assert.ok(!source.includes(omitted), omitted);
  assert.deepEqual(document, before);
});

test("the PDF supports mixed legacy and editable achievements without excluded or blank rows", () => {
  const document = fixture();
  document.achievements = [
    { text: "Visible achievement", includeInPdf: true },
    { text: "Hidden achievement", includeInPdf: false },
    { text: " \n " },
    "Legacy achievement",
  ];
  const before = structuredClone(document);
  const source = generateResumeLatex(document);
  for (const retained of ["Visible achievement", "Legacy achievement"]) assert.ok(source.includes(retained), retained);
  for (const omitted of ["Hidden achievement", "\\resumeSubItem{}{}", "[object Object]"]) assert.ok(!source.includes(omitted), omitted);
  assert.deepEqual(document, before);
});

test("the PDF omits an empty achievements section after excluding its last row", () => {
  const document = fixture();
  document.achievements = [{ text: "Hidden achievement", includeInPdf: false }, { text: "  " }];
  assert.ok(!generateResumeLatex(document).includes("Co-Curricular"));
});

test("header social rows preserve editor order and never duplicate a lone link", () => {
  const document = fixture();
  document.profile.socials = [
    { label: "GitHub", href: "https://github.com/lone-social", includeInPdf: true },
    { label: "LinkedIn", href: "https://linkedin.com/in/hidden-social", includeInPdf: false },
  ];
  const single = generateResumeLatex(document);
  assert.equal(single.split("\\href{https://github.com/lone-social}").length - 1, 1);
  assert.ok(!single.includes("hidden-social"));
  document.profile.socials = [
    { label: "Third", href: "https://example.com/third" },
    { label: "First", href: "https://example.com/first" },
    { label: "Second", href: "https://example.com/second" },
  ];
  const ordered = generateResumeLatex(document);
  assert.ok(ordered.indexOf("example.com/third") < ordered.indexOf("example.com/first"));
  assert.ok(ordered.indexOf("example.com/first") < ordered.indexOf("example.com/second"));
  document.profile.socials = [{ label: "Hidden", href: "https://example.com/hidden", includeInPdf: false }, { label: "Empty", href: "" }];
  const empty = generateResumeLatex(document);
  assert.ok(!empty.includes("Hidden:"));
  assert.ok(!empty.includes("Empty:"));
});
