import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "next/dist/build/swc/index.js";
import * as seoData from "../src/app/data/seoData.js";
import { defaultPdfLayout, defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";
import { defaultResumeSections, isCustomResumeSection, isProtectedResumeSection, resolveResumeSections } from "../src/lib/resume-sections.js";
import { renderPublicProfile } from "../src/lib/public-profile.js";

const sections = ["summary", "experience", "education", "projects", "skills", "achievements"];
const itemSections = ["experience", "education", "projects", "skills"];

test("existing resume revisions retain all PDF content when visibility fields are missing", () => {
  const legacy = structuredClone(defaultResumeDocument);
  delete legacy.pdfSections;
  for (const section of itemSections) {
    for (const item of legacy[section]) delete item.includeInPdf;
  }
  const normalized = parseResumeDocument(legacy);
  assert.deepEqual(normalized.pdfSections, Object.fromEntries(sections.map((section) => [section, true])));
  for (const section of itemSections) {
    assert.ok(normalized[section].every((item) => item.includeInPdf === true));
    const preservedItems = structuredClone(normalized[section]);
    for (const item of preservedItems) delete item.includeInPdf;
    assert.deepEqual(preservedItems, legacy[section]);
  }
});

test("saved PDF exclusions survive normalization without removing website content", () => {
  const document = structuredClone(defaultResumeDocument);
  document.pdfSections = { summary: false, achievements: false };
  for (const section of itemSections) document[section][0].includeInPdf = false;
  const normalized = parseResumeDocument(document);
  assert.equal(normalized.pdfSections.summary, false);
  assert.equal(normalized.pdfSections.achievements, false);
  assert.equal(normalized.pdfSections.projects, true);
  assert.equal(normalized.summary, document.summary);
  assert.deepEqual(normalized.achievements, document.achievements);
  for (const section of itemSections) {
    assert.deepEqual(normalized[section], document[section]);
    assert.equal(normalized[section][0].includeInPdf, false);
  }
});

for (const section of ["experience", "projects"]) {
  test(`${section} keeps every non-empty bullet for the website and removes draft whitespace`, () => {
    const document = structuredClone(defaultResumeDocument);
    const points = Array.from({ length: 9 }, (_, index) => `Point ${index + 1}`);
    document[section][0].bullets = [" ", ...points.map((point) => `  ${point}  `), "", "\t"];
    assert.deepEqual(parseResumeDocument(document)[section][0].bullets, points);
  });

  test(`${section} requires at least one meaningful bullet after normalization`, () => {
    const document = structuredClone(defaultResumeDocument);
    document[section][0].bullets = ["", "  ", "\n"];
    assert.throws(() => parseResumeDocument(document), (error) =>
      error.issues.some((issue) => issue.path.join(".") === `${section}.0.bullets`));
  });
}

test("empty co-curricular draft fields do not create blank website bullets", () => {
  const document = structuredClone(defaultResumeDocument);
  document.achievements = ["  First achievement  ", "", "  ", "Second achievement"];
  assert.deepEqual(parseResumeDocument(document).achievements, [
    { text: "First achievement", includeInPdf: true },
    { text: "Second achievement", includeInPdf: true },
  ]);
  document.achievements = ["", "  "];
  assert.deepEqual(parseResumeDocument(document).achievements, []);
});

test("legacy links default to PDF inclusion", () => {
  const legacy = structuredClone(defaultResumeDocument);
  legacy.profile.socials = [{ label: "GitHub", href: "https://github.com/example" }];
  legacy.projects[0].links = [{ label: "Demo", href: "https://example.com/demo" }];
  const normalized = parseResumeDocument(legacy);
  assert.equal(normalized.profile.socials[0].includeInPdf, true);
  assert.equal(normalized.projects[0].links[0].includeInPdf, true);
});

test("blank social and project link drafts are removed while partial links require a name and URL", () => {
  for (const section of ["socials", "links"]) {
    const document = structuredClone(defaultResumeDocument);
    const owner = section === "socials" ? document.profile : document.projects[0];
    owner[section] = [{ label: "  ", href: "\t" }, { id: "new-link", label: " Reference ", href: " https://example.com/reference ", includeInPdf: false }];
    const normalized = parseResumeDocument(document);
    assert.deepEqual((section === "socials" ? normalized.profile : normalized.projects[0])[section], [{ id: "new-link", label: "Reference", href: "https://example.com/reference", includeInPdf: false }]);
    for (const partial of [{ label: "GitHub", href: "" }, { label: "", href: "https://github.com/example" }]) {
      owner[section] = [partial];
      assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.includes(section)));
    }
  }
});

test("editable achievements preserve visibility and stable IDs while discarding blank rows", () => {
  const document = structuredClone(defaultResumeDocument);
  document.achievements = [
    { id: "retained", text: "  Website achievement  ", includeInPdf: false },
    { id: "blank", text: " \n\t ", includeInPdf: false },
    { text: "Included achievement" },
    "Legacy achievement",
  ];
  assert.deepEqual(parseResumeDocument(document).achievements, [
    { id: "retained", text: "Website achievement", includeInPdf: false },
    { text: "Included achievement", includeInPdf: true },
    { text: "Legacy achievement", includeInPdf: true },
  ]);
});

test("individual PDF exclusions retain links in public content", () => {
  const document = structuredClone(defaultResumeDocument);
  document.profile.socials = [{ id: "social", label: "Community", href: "https://example.com/community", includeInPdf: false }];
  document.projects[0].links = [{ id: "project-link", label: "Project reference", href: "https://example.com/reference", includeInPdf: false }];
  const normalized = parseResumeDocument(document);
  assert.deepEqual(normalized.profile.socials, document.profile.socials);
  assert.deepEqual(normalized.projects[0].links, document.projects[0].links);
  const publicText = renderPublicProfile(normalized);
  for (const retained of ["https://example.com/community", "https://example.com/reference"]) assert.ok(publicText.includes(retained), retained);
});

test("individual PDF exclusions retain achievements and every bullet in public content", () => {
  const document = structuredClone(defaultResumeDocument);
  document.achievements = [{ id: "achievement", text: "Website-only achievement", includeInPdf: false }];
  document.experience[0].bullets = ["First", "Second", "Third", "Fourth website bullet"];
  const normalized = parseResumeDocument(document);
  assert.deepEqual(normalized.achievements, document.achievements);
  assert.deepEqual(normalized.experience[0].bullets, document.experience[0].bullets);
  const publicText = renderPublicProfile(normalized);
  for (const retained of ["Website-only achievement", "Fourth website bullet"]) assert.ok(publicText.includes(retained), retained);
  assert.ok(!publicText.includes("[object Object]"));
});

test("legacy resumes gain PDF defaults and inherit section bullet limits without losing education text", () => {
  const legacy = structuredClone(defaultResumeDocument);
  delete legacy.pdfLayout;
  for (const section of ["experience", "projects", "education"]) {
    for (const item of legacy[section]) delete item.pdfBulletLimit;
  }
  legacy.education[0].details = ["Diplomas in Programming and Data Science", "Core Subjects: LLMs and GenAI"];
  const original = structuredClone(legacy);
  const normalized = parseResumeDocument(legacy);
  assert.deepEqual(normalized.pdfLayout, defaultPdfLayout);
  for (const section of ["experience", "projects", "education"]) {
    assert.ok(normalized[section].every((item) => item.pdfBulletLimit === null));
  }
  assert.deepEqual(normalized.education[0].details, legacy.education[0].details.map((text) => ({ label: "", text, includeInPdf: true })));
  assert.deepEqual(legacy, original);
});

test("PDF layout controls preserve valid custom settings and fill only missing defaults", () => {
  const document = structuredClone(defaultResumeDocument);
  document.pdfLayout = { fontSize: 8.75, lineHeight: 1.2, bulletGap: 2, entryGap: 6, sectionGap: 10, experienceBulletLimit: 0, projectBulletLimit: 5, educationBulletLimit: 2, projectToolsPlacement: "line" };
  assert.deepEqual(parseResumeDocument(document).pdfLayout, document.pdfLayout);
  document.pdfLayout = { projectBulletLimit: 1, projectToolsPlacement: "hidden" };
  assert.deepEqual(parseResumeDocument(document).pdfLayout, { ...defaultPdfLayout, ...document.pdfLayout });
});

test("PDF layout values reject unsafe dimensions and noninteger bullet limits", () => {
  const invalidValues = {
    fontSize: [8.49, 11.01, "9"],
    lineHeight: [0.99, 1.51],
    bulletGap: [-0.1, 6.1],
    entryGap: [-0.1, 16.1],
    sectionGap: [3.9, 24.1],
    experienceBulletLimit: [-1, 13, 1.5],
    projectBulletLimit: [-1, 13, 1.5],
    educationBulletLimit: [-1, 13, 1.5],
    projectToolsPlacement: ["before", "", null],
  };
  for (const [key, values] of Object.entries(invalidValues)) {
    for (const value of values) {
      const document = structuredClone(defaultResumeDocument);
      document.pdfLayout[key] = value;
      assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".") === `pdfLayout.${key}`), `${key}: ${value}`);
    }
  }
});

test("per-entry PDF limits preserve inherit, all and custom counts without truncating website bullets", () => {
  for (const section of ["experience", "projects", "education"]) {
    const document = structuredClone(defaultResumeDocument);
    const pointsKey = section === "education" ? "details" : "bullets";
    document[section][0][pointsKey] = Array.from({ length: 8 }, (_, index) => `Website point ${index + 1}`);
    for (const limit of [null, 0, 1, 12]) {
      document[section][0].pdfBulletLimit = limit;
      const normalized = parseResumeDocument(document);
      assert.equal(normalized[section][0].pdfBulletLimit, limit);
      assert.equal(normalized[section][0][pointsKey].length, 8);
    }
    for (const limit of [-1, 13, 1.5, "3"]) {
      document[section][0].pdfBulletLimit = limit;
      assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".") === `${section}.0.pdfBulletLimit`));
    }
  }
});

test("education rows preserve labels, visibility and IDs and discard only fully blank drafts", () => {
  const document = structuredClone(defaultResumeDocument);
  document.education[0].details = [
    "  Legacy diploma  ",
    { id: "subjects", label: " Core Subjects ", text: " LLMs and GenAI ", includeInPdf: false },
    { id: "blank", label: "\t", text: "\n", includeInPdf: false },
    { text: "Unlabelled achievement" },
  ];
  assert.deepEqual(parseResumeDocument(document).education[0].details, [
    { label: "", text: "Legacy diploma", includeInPdf: true },
    { id: "subjects", label: "Core Subjects", text: "LLMs and GenAI", includeInPdf: false },
    { label: "", text: "Unlabelled achievement", includeInPdf: true },
  ]);
  document.education[0].details = [{ label: "Core Subjects", text: " " }];
  assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".") === "education.0.details.0.text"));
});

test("education supports sixteen nonblank rows and enforces its limit after discarding empty drafts", () => {
  const document = structuredClone(defaultResumeDocument);
  document.education[0].details = ["", ...Array.from({ length: 16 }, (_, index) => `Point ${index + 1}`), { label: "", text: " " }];
  assert.equal(parseResumeDocument(document).education[0].details.length, 16);
  document.education[0].details.push("Point 17");
  assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".") === "education.0.details"));
});

test("public education retains labelled and excluded points regardless of PDF count settings", () => {
  const document = structuredClone(defaultResumeDocument);
  document.pdfLayout.educationBulletLimit = 1;
  document.education[0].pdfBulletLimit = 1;
  document.education[0].details = [
    { label: "Core Subjects", text: "LLMs and GenAI", includeInPdf: false },
    { label: "Diplomas:", text: "Programming and Data Science", includeInPdf: true },
    "A third education point",
  ];
  const normalized = parseResumeDocument(document);
  const publicText = renderPublicProfile(normalized);
  for (const retained of ["**Core Subjects:** LLMs and GenAI", "**Diplomas:** Programming and Data Science", "A third education point"]) assert.ok(publicText.includes(retained), retained);
  assert.ok(!publicText.includes("[object Object]"));
  assert.ok(!publicText.includes("Diplomas::"));
});

test("education scores round-trip separately while legacy combined dates remain unchanged", () => {
  const document = structuredClone(defaultResumeDocument);
  const education = document.education[0];
  delete education.score;
  education.dates = "GPA: 8.3 | Sept 2022 - Present";
  const legacy = parseResumeDocument(document);
  assert.equal(legacy.education[0].score, "");
  assert.equal(legacy.education[0].dates, education.dates);
  assert.ok(renderPublicProfile(legacy).includes(education.dates));
  education.score = " GPA: 8.3 ";
  education.dates = "Sept 2022 - Present";
  const normalized = parseResumeDocument(document);
  assert.equal(normalized.education[0].score, "GPA: 8.3");
  assert.equal(normalized.education[0].dates, education.dates);
  assert.ok(renderPublicProfile(normalized).includes("GPA: 8.3 | Sept 2022 - Present"));
  education.dates = "";
  const onlyScore = renderPublicProfile(parseResumeDocument(document));
  assert.ok(onlyScore.includes("\n\nGPA: 8.3\n\n"));
});

test("legacy resumes gain the canonical section titles and order without mutating defaults", () => {
  const document = structuredClone(defaultResumeDocument);
  delete document.sections;
  const normalized = parseResumeDocument(document);
  assert.deepEqual(normalized.sections, defaultResumeSections);
  normalized.sections[0].title = "Changed";
  assert.equal(defaultResumeSections[0].title, "Summary");
  assert.equal(document.sections, undefined);
});

test("saved section order and optional titles round-trip while protected titles normalize", () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections = [...defaultResumeSections].reverse().map((section) => ({ id: section.id, title: `  Custom ${section.id}  ` }));
  const normalized = parseResumeDocument(document);
  assert.deepEqual(normalized.sections, document.sections.map((section) => ({ ...section, title: isProtectedResumeSection(section.id) ? defaultResumeSections.find(({ id }) => id === section.id).title : section.title.trim() })));
  assert.deepEqual(normalized.experience, document.experience);
  assert.deepEqual(normalized.projects, document.projects);
});

test("saved section lists reject missing protected sections, duplicates, unknown IDs and invalid titles", () => {
  const invalid = [
    defaultResumeSections.filter(({ id }) => id !== "experience"),
    defaultResumeSections.filter(({ id }) => id !== "projects"),
    [...defaultResumeSections, defaultResumeSections[0]],
    defaultResumeSections.map((section, index) => index === 1 ? defaultResumeSections[0] : section),
    defaultResumeSections.map((section, index) => index === 0 ? { ...section, id: "custom" } : section),
    defaultResumeSections.map((section, index) => index === 0 ? { ...section, title: " \n " } : section),
    defaultResumeSections.map((section, index) => index === 0 ? { ...section, title: "x".repeat(81) } : section),
  ];
  for (const sections of invalid) {
    const document = { ...defaultResumeDocument, sections };
    assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path[0] === "sections"));
  }
});

test("draft section resolution preserves optional removals and appends only missing protected sections", () => {
  const draft = { sections: [{ id: "projects", title: "  Selected work  " }, { id: "summary", title: " " }, { id: "projects", title: "Duplicate" }, { id: "unknown", title: "Unknown" }, null] };
  const before = structuredClone(draft);
  assert.deepEqual(resolveResumeSections(draft), [
    { id: "projects", title: "Projects" },
    defaultResumeSections[0],
    defaultResumeSections[1],
  ]);
  assert.deepEqual(draft, before);
  assert.deepEqual(resolveResumeSections({}), defaultResumeSections);
  assert.deepEqual(resolveResumeSections({ sections: null }), defaultResumeSections);
});

test("public text honors renamed section order and retains every PDF-excluded section and point", () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections = [...defaultResumeSections].reverse().map((section) => ({ ...section, title: `Custom ${section.id}` }));
  document.pdfSections = Object.fromEntries(defaultResumeSections.map((section) => [section.id, false]));
  document.experience[0].includeInPdf = false;
  document.experience[0].pdfBulletLimit = 1;
  document.experience[0].bullets = ["First public point", "Last public point"];
  document.achievements = [{ text: "Public community marker", includeInPdf: false }];
  const rendered = renderPublicProfile(parseResumeDocument(document));
  const positions = resolveResumeSections(document).map((section) => rendered.indexOf(`### ${section.title}\n`));
  assert.ok(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1])));
  for (const retained of ["First public point", "Last public point", "Public community marker", document.education[0].school, document.projects[0].name, document.skills[0].label]) assert.ok(rendered.includes(retained), retained);
  document.sections[0].title = '<script>alert(1)</script> & **Title**\n# Extra';
  const escaped = renderPublicProfile(parseResumeDocument(document));
  assert.ok(!escaped.includes("<script>"));
  assert.ok(escaped.includes("### &lt;script&gt;alert(1)&lt;/script&gt; &amp; \\*\\*Title\\*\\* \\# Extra\n"));
});

async function renderResumeHtml(document) {
  const source = await readFile(new URL("../src/app/resume/page.js", import.meta.url), "utf8");
  const { code } = await transform(source, { filename: "resume-page.js", jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
  const require = createRequire(import.meta.url);
  const modules = {
    "@/app/data/seoData": seoData,
    "@/lib/resume-content": { getPublishedResume: async () => ({ id: "repository-default", content: document }) },
    "@/lib/resume-sections": { isCustomResumeSection, resolveResumeSections },
    "next/image": ({ src, alt }) => createElement("img", { src, alt }),
    "next/link": (props) => createElement("a", props),
  };
  const output = { exports: {} };
  new Function("require", "module", "exports", code)((name) => modules[name] || require(name), output, output.exports);
  return renderToStaticMarkup(await output.exports.default());
}

test("public resume HTML renders custom headings as text, follows section order and shows skills once", async () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections = [...defaultResumeSections].reverse().map((section) => ({ ...section, title: `Custom ${section.id}` }));
  document.sections[0].title = '<img src=x onerror="alert(1)">';
  document.skills[0].label = "Unique skills label";
  document.pdfSections = Object.fromEntries(defaultResumeSections.map((section) => [section.id, false]));
  document.experience[0].bullets.push("Untruncated final point");
  document.experience[0].includeInPdf = false;
  const html = await renderResumeHtml(document);
  const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);
  assert.equal(headings[0], "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.deepEqual(headings.slice(1), resolveResumeSections(document).slice(1).map((section) => section.title));
  assert.ok(!html.includes('<img src="x"'));
  assert.ok(html.includes("Untruncated final point"));
  assert.equal(html.split("Unique skills label:").length - 1, 1);
});

test("removed optional sections remain removed after save without deleting their stored content", async () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections = [document.sections[3], document.sections[1]];
  const normalized = parseResumeDocument(document);
  assert.deepEqual(normalized.sections, [{ id: "projects", title: "Projects" }, { id: "experience", title: "Experience" }]);
  for (const key of ["summary", "education", "skills", "achievements"]) assert.deepEqual(normalized[key], document[key]);
  const publicText = renderPublicProfile(normalized);
  const html = await renderResumeHtml(normalized);
  assert.deepEqual([...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]), ["Projects", "Experience"]);
  for (const marker of [document.summary, document.achievements[0].text]) assert.ok(!publicText.includes(marker), marker);
  assert.doesNotMatch(publicText, /### (Summary|Education|Skills|Co-Curricular)/);
  normalized.sections.push(defaultResumeSections.find(({ id }) => id === "achievements"));
  assert.ok(renderPublicProfile(parseResumeDocument(normalized)).includes(document.achievements[0].text));
});

test("custom sections preserve format, content and PDF flags while blank points are discarded", () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections.splice(1, 0, {
    id: "custom-certifications", type: "custom", title: " Certifications ", format: "bullets", text: " Alternate paragraph ", includeInPdf: false,
    items: [{ id: "certificate", label: " Cloud ", text: " Certificate earned ", includeInPdf: false }, { label: " ", text: " " }, { text: "Second certificate" }],
  });
  const custom = parseResumeDocument(document).sections[1];
  assert.deepEqual(custom, {
    id: "custom-certifications", type: "custom", title: "Certifications", format: "bullets", text: "Alternate paragraph", includeInPdf: false,
    items: [{ id: "certificate", label: "Cloud", text: "Certificate earned", includeInPdf: false }, { label: "", text: "Second certificate", includeInPdf: true }],
  });
  assert.deepEqual(resolveResumeSections({ sections: [custom, ...defaultResumeSections] })[0], custom);
  document.sections[1].format = "text";
  assert.equal(parseResumeDocument(document).sections[1].items.length, 2);
  document.sections[1].format = "bullets";
  document.sections[1].items = [{ label: "Cloud", text: " " }];
  assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path[0] === "sections"));
});

test("switching custom bullets to text preserves incomplete inactive points without blocking save", async () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections.push({
    id: "custom-switch", type: "custom", title: "Research", format: "text", text: "A complete research paragraph.",
    items: [{ id: "unfinished", label: "Unfinished custom label", text: "", includeInPdf: false }, { id: "completed", label: "Work", text: "Completed inactive custom point" }],
  });
  const normalized = parseResumeDocument(document);
  const custom = normalized.sections.at(-1);
  assert.deepEqual(custom.items, [
    { id: "unfinished", label: "Unfinished custom label", text: "", includeInPdf: false },
    { id: "completed", label: "Work", text: "Completed inactive custom point", includeInPdf: true },
  ]);
  for (const rendered of [renderPublicProfile(normalized), await renderResumeHtml(normalized)]) {
    assert.ok(rendered.includes(custom.text));
    assert.doesNotMatch(rendered, /Unfinished custom label|Completed inactive custom point/);
  }
  custom.format = "bullets";
  assert.throws(() => parseResumeDocument(normalized), (error) => error.issues.some((issue) => issue.path.join(".") === "sections.6.items.0.text"));
  custom.items[0].text = "Now complete";
  assert.equal(parseResumeDocument(normalized).sections.at(-1).text, "A complete research paragraph.");
});

test("empty optional collections can be saved before or after their section is removed and restored", async () => {
  for (const id of ["education", "skills"]) {
    const document = structuredClone(defaultResumeDocument);
    document[id] = [];
    assert.deepEqual(parseResumeDocument(document)[id], []);
    document.sections = document.sections.filter((section) => section.id !== id);
    const normalized = parseResumeDocument(document);
    assert.deepEqual(normalized[id], []);
    const html = await renderResumeHtml(normalized);
    assert.ok(!html.includes(`>${id === "education" ? "Education" : "Skills"}</h2>`));
    normalized.sections.push(defaultResumeSections.find((section) => section.id === id));
    assert.deepEqual(parseResumeDocument(normalized)[id], []);
  }
  for (const id of ["experience", "projects"]) {
    const document = structuredClone(defaultResumeDocument);
    document[id] = [];
    assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".") === id));
  }
});

test("custom sections and points enforce limits and duplicate protection", () => {
  const document = structuredClone(defaultResumeDocument);
  const custom = (index) => ({ id: `custom-${index}`, type: "custom", title: `Section ${index}`, format: "bullets", items: [] });
  document.sections = [defaultResumeSections[1], defaultResumeSections[3], ...Array.from({ length: 14 }, (_, index) => custom(index))];
  assert.equal(parseResumeDocument(document).sections.length, 16);
  document.sections.push(custom(14));
  assert.throws(() => parseResumeDocument(document));
  document.sections.pop();
  document.sections[3].id = document.sections[2].id;
  assert.throws(() => parseResumeDocument(document));
  document.sections[3].id = "custom-1";
  document.sections[2].items = [{ text: " " }, ...Array.from({ length: 16 }, (_, index) => ({ text: `Point ${index}` }))];
  assert.equal(parseResumeDocument(document).sections[2].items.length, 16);
  document.sections[2].items.push({ text: "Extra point" });
  assert.throws(() => parseResumeDocument(document));
  document.sections[2].items = [];
  document.sections[2].text = "x".repeat(4001);
  assert.throws(() => parseResumeDocument(document));
});

test("custom public sections preserve shared order and ignore PDF flags without rendering markup", async () => {
  const document = structuredClone(defaultResumeDocument);
  document.sections = [
    { id: "custom-research", type: "custom", title: "Research & talks", format: "bullets", items: [{ label: "Publication:", text: '<script>alert("row")</script>', includeInPdf: false }], includeInPdf: false },
    defaultResumeSections[3],
    { id: "custom-note", type: "custom", title: "Note", format: "text", text: "Line one\n**Literal** & <b>text</b>", includeInPdf: false },
    defaultResumeSections[1],
  ];
  const normalized = parseResumeDocument(document);
  const html = await renderResumeHtml(normalized);
  const text = renderPublicProfile(normalized);
  assert.deepEqual([...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]), ["Research &amp; talks", "Projects", "Note", "Experience"]);
  assert.ok(html.includes("<strong>Publication:</strong>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes('<script>alert("row")</script>'));
  assert.ok(html.includes("whitespace-pre-line"));
  assert.ok(text.includes('**Publication:** &lt;script&gt;alert("row")&lt;/script&gt;'));
  assert.ok(text.includes("Line one\n\\*\\*Literal\\*\\* &amp; &lt;b&gt;text&lt;/b&gt;"));
  assert.ok(text.indexOf("### Research &amp; talks") < text.indexOf("### Projects"));
  assert.ok(text.indexOf("### Note") < text.indexOf("### Experience"));
  assert.doesNotMatch(text, /undefined|\[object Object\]/);
});
