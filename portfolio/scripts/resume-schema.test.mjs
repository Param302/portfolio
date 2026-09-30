import assert from "node:assert/strict";
import test from "node:test";
import { defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";

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
