import assert from "node:assert/strict";
import test from "node:test";
import { parseResumeInline, plainResumeText } from "../src/lib/resume-inline.js";

const text = (value) => ({ type: "text", value });
const strong = (...children) => ({ type: "strong", children });
const em = (...children) => ({ type: "em", children });

test("parses only the supported inline emphasis without losing surrounding text", () => {
  assert.deepEqual(parseResumeInline("Built **500+ users** with *FastAPI* and _Redis_."), [
    text("Built "), strong(text("500+ users")), text(" with "), em(text("FastAPI")), text(" and "), em(text("Redis")), text("."),
  ]);
});

test("supports nested emphasis, including shared triple-asterisk boundaries", () => {
  assert.deepEqual(parseResumeInline("**bold with *italic* and _more_**"), [
    strong(text("bold with "), em(text("italic")), text(" and "), em(text("more"))),
  ]);
  assert.deepEqual(parseResumeInline("*italic with **bold***"), [em(text("italic with "), strong(text("bold")))]);
  assert.deepEqual(parseResumeInline("**bold with *italic***"), [strong(text("bold with "), em(text("italic")))]);
  assert.deepEqual(parseResumeInline("***both***"), [em(strong(text("both")))]);
  assert.deepEqual(parseResumeInline("**first**/**second**"), [strong(text("first")), text("/"), strong(text("second"))]);
});

test("preserves unmatched markers, spacing, calculations, and snake_case", () => {
  for (const value of ["A *missing end", "unmatched**", "* spaced *", "2 * 3 = 6", "snake_case and model_v2_name", "***", "prefix__suffix__word", "500+ / 20% / 3D U-Net"]) {
    assert.deepEqual(parseResumeInline(value), [text(value)]);
    assert.equal(plainResumeText(value), value);
  }
});

test("preserves underscores in URLs and file paths as literal text", () => {
  for (const value of ["https://example.com/_cache_/model_v2", "src/_generated_/file_name.js", String.raw`C:\_files_\model_v2`, "./_relative_/test_name"]) {
    assert.equal(plainResumeText(value), value);
    assert.deepEqual(parseResumeInline(value), [text(value)]);
  }
  assert.deepEqual(parseResumeInline("_AI/ML_ and _CI/CD workflows_"), [em(text("AI/ML")), text(" and "), em(text("CI/CD workflows"))]);
  assert.deepEqual(parseResumeInline("_https://example.com/_cache_/v2_"), [em(text("https://example.com/_cache_/v2"))]);
});

test("escaped delimiters are literal, with unknown backslash sequences preserved", () => {
  assert.deepEqual(parseResumeInline(String.raw`\*literal\* and \_literal\_ then **bold**`), [text("*literal* and _literal_ then "), strong(text("bold"))]);
  assert.deepEqual(parseResumeInline(String.raw`**bold \*star\***`), [strong(text("bold *star*"))]);
  assert.equal(plainResumeText(String.raw`\\ \alpha \{latex\}`), String.raw`\ \alpha \{latex\}`);
});

test("HTML, Markdown links, and TeX never produce executable parser nodes", () => {
  const payload = String.raw`<img src=x onerror=alert(1)> [click](javascript:alert(1)) \input{secret} **safe <script>alert(2)</script>**`;
  assert.deepEqual(parseResumeInline(payload), [
    text(String.raw`<img src=x onerror=alert(1)> [click](javascript:alert(1)) \input{secret} `),
    strong(text("safe <script>alert(2)</script>")),
  ]);
});

test("plain homepage wording removes only parsed emphasis and its escapes", () => {
  assert.equal(plainResumeText("Reached **500+** with *FastAPI* and _Redis_ / model_v2 *literal"), "Reached 500+ with FastAPI and Redis / model_v2 *literal");
  assert.equal(plainResumeText("***both*** and **bold *nested***"), "both and bold nested");
  assert.deepEqual(parseResumeInline(""), []);
  assert.equal(plainResumeText(null), "");
});

test("large delimiter runs stay bounded for recursive web/PDF rendering", () => {
  const source = `${"*".repeat(10000)}value${"*".repeat(10000)}`;
  const parsed = parseResumeInline(source);
  const pending = parsed.map((node) => ({ node, depth: 0 }));
  let maximumDepth = 0;
  while (pending.length) {
    const { node, depth } = pending.pop();
    maximumDepth = Math.max(maximumDepth, depth);
    if (node.children) pending.push(...node.children.map((child) => ({ node: child, depth: depth + 1 })));
  }
  assert.ok(maximumDepth <= 32);
  assert.equal(plainResumeText(source).replaceAll("*", ""), "value");
  assert.equal(plainResumeText("_unmatched ".repeat(2000)), "_unmatched ".repeat(2000));
});
