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

test("the PDF uses the canonical Overleaf preamble and replaces every example block", async () => {
  const template = await readFile(new URL("../resume.tex", import.meta.url), "utf8");
  const source = generateResumeLatex(fixture());
  assert.equal(source.split("% resume:header:start")[0].split("\\begin{document}")[0], template.split("\\begin{document}")[0]);
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

test("PDF takes only the first three non-empty bullets per experience and project", () => {
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
