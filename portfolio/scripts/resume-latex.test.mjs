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
