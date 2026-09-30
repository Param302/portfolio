import assert from "node:assert/strict";
import test from "node:test";
import { defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";
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
