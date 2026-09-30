import assert from "node:assert/strict";
import test from "node:test";
import { defaultPdfLayout, defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";
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
