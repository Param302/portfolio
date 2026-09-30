import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "next/dist/build/swc/index.js";
import * as themeModule from "../src/lib/project-themes.js";
import { defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";

const { getProjectTheme, projectForDisplay, projectLinkLabel, projectThemes } = themeModule;
const require = createRequire(import.meta.url);

async function loadJsx(path, modules) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { code } = await transform(source, { filename: path, jsc: { target: "es2022", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" } });
  const output = { exports: {} };
  new Function("require", "module", "exports", code)((name) => modules[name] || require(name), output, output.exports);
  return output.exports;
}

const components = await loadJsx("../src/app/components/Projects.js", {
  "@/app/ThemeContext": { useTheme: () => ({ theme: "light" }) },
  "@/lib/optimized-image": { optimizedImage: (value) => value },
  "@/lib/project-themes": themeModule,
  "@/app/data/projects": { projects: [] },
  "./Projects.module.css": new Proxy({}, { get: (_, key) => key }),
  "next/image": ({ src, alt }) => createElement("img", { src, alt }),
});

test("every visual theme can be saved while legacy values and the default stay valid", () => {
  for (const theme of projectThemes) {
    const document = structuredClone(defaultResumeDocument);
    document.projects[0].theme = theme.id;
    assert.equal(parseResumeDocument(document).projects[0].theme, theme.id);
  }
  const legacy = structuredClone(defaultResumeDocument);
  delete legacy.projects[0].theme;
  assert.equal(parseResumeDocument(legacy).projects[0].theme, "surface");
  legacy.projects[0].theme = "invalid-theme";
  assert.throws(() => parseResumeDocument(legacy), (error) => error.issues.some((issue) => issue.path.join(".") === "projects.0.theme"));
});

test("Canvas follows preview mode independently; explicit palette choices stay stable", () => {
  assert.equal(getProjectTheme("surface", "light").colors.background, "#F8FAFC");
  assert.equal(getProjectTheme("surface", "dark").colors.background, "#0B0F19");
  for (const theme of projectThemes.filter((theme) => theme.id !== "surface")) {
    assert.deepEqual(getProjectTheme(theme.id, "dark").colors, getProjectTheme(theme.id, "light").colors);
  }
  assert.equal(getProjectTheme("unknown").id, "surface");
  assert.equal(projectThemes.filter((theme) => theme.kind === "Gradient").length, 3);
});

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

test("theme text meets normal-text contrast against every solid or gradient stop", () => {
  for (const theme of projectThemes) {
    for (const mode of ["light", "dark"]) {
      const colors = getProjectTheme(theme.id, mode).colors;
      for (const background of colors.background.match(/#[0-9A-F]{6}/gi)) {
        for (const foreground of [colors.foreground, colors.muted]) assert.ok(contrast(foreground, background) >= 4.5, `${theme.id} ${mode}: ${foreground} on ${background}`);
      }
      assert.ok(contrast(colors.buttonText, colors.button) >= 4.5, `${theme.id} button`);
    }
  }
});

test("website mapping keeps every point and PDF-excluded link and accepts legacy cards", () => {
  const project = structuredClone(defaultResumeDocument.projects[0]);
  project.includeInPdf = false;
  project.pdfBulletLimit = 1;
  project.bullets = Array.from({ length: 7 }, (_, index) => `Public point ${index + 1}`);
  project.links = [{ label: "Demo", href: "https://demo.example.com", includeInPdf: false }, { label: "Source", href: "https://github.com/example/project", includeInPdf: false }];
  const snapshot = structuredClone(project);
  const displayed = projectForDisplay(project);
  assert.deepEqual(displayed.pointers, project.bullets);
  assert.equal(displayed.links.length, 2);
  assert.equal(displayed.liveLink.label, "Demo");
  assert.equal(displayed.links[1].isRepository, true);
  assert.deepEqual(project, snapshot);
  const legacy = projectForDisplay({ id: "legacy", pointers: ["Original point"], skills: [], repo: "https://github.com/example/legacy", live: "https://legacy.example.com" });
  assert.deepEqual(legacy.pointers, ["Original point"]);
  assert.equal(legacy.links.length, 2);
});

test("incomplete draft links stay out of previews; unsafe protocols cannot become homepage actions", () => {
  const display = projectForDisplay({ links: [{ href: "" }, { href: "not a URL" }, { href: "javascript:alert(1)" }, { href: "data:text/html,hello" }, { label: "Custom destination", href: " https://www.example.com/demo " }] });
  assert.equal(display.links.length, 1);
  assert.equal(display.liveLink.href, "https://www.example.com/demo");
  assert.equal(projectLinkLabel(display.liveLink.href), "example.com");
});

test("homepage and live preview render the same editable content and palettes", () => {
  const project = structuredClone(defaultResumeDocument.projects[0]);
  project.name = "Updated public project";
  project.theme = "aurora";
  project.includeInPdf = false;
  project.pdfBulletLimit = 1;
  project.bullets = ["First point", "Second point", "Third point", "Fourth point", "Final fifth point"];
  project.links = [{ label: "Try the app", href: "https://custom.example.com/try", includeInPdf: false }, { label: "Read source", href: "https://github.com/example/custom" }, { label: "Documentation", href: "https://docs.example.com" }];
  const publicHtml = renderToStaticMarkup(createElement(components.default, { projects: [project] }));
  const previewHtml = renderToStaticMarkup(createElement(components.ProjectsPreview, { projects: [project], theme: "dark" }));
  for (const html of [publicHtml, previewHtml]) {
    for (const text of [project.name, "Final fifth point", "custom.example.com", "Read source", "Documentation"]) assert.ok(html.includes(text), text);
    assert.ok(html.includes('data-project-theme="aurora"'));
    assert.ok(html.includes("linear-gradient(135deg, #18284B"));
    assert.ok(!html.includes("getreadmewithme.vercel.app"));
  }
  assert.ok(publicHtml.includes("data-stack-card"));
  assert.ok(!previewHtml.includes("data-stack-card"));
  assert.ok(previewHtml.includes('data-preview-theme="dark"'));
});

test("homepage server boundary supplies published projects to the shared section", async () => {
  const content = structuredClone(defaultResumeDocument);
  content.projects[0].name = "Saved published name";
  content.projects[0].theme = "sunset";
  const componentsToStub = ["About", "CommunitySection", "Contact", "Footer", "GurmatDarbarSpotlight", "HeroSection", "Navbar", "Work"];
  const modules = Object.fromEntries(componentsToStub.map((name) => [`@/app/components/${name}`, () => null]));
  const { default: Home } = await loadJsx("../src/app/page.js", {
    ...modules,
    "@/app/components/HomeIntro": ({ children }) => children,
    "@/app/components/Projects": components.default,
    "@/app/data/seoData": { pageMetadata: () => ({}), siteConfig: {}, homeStructuredData: () => ({}), serializeJsonLd: JSON.stringify },
    "@/lib/media": { listPublicImages: async () => [] },
    "@/lib/resume-content": { getPublishedResume: async () => ({ content }), getYouTubeStats: async () => ({}), formatCompactCount: () => "" },
  });
  const html = renderToStaticMarkup(await Home());
  assert.ok(html.includes("Saved published name"));
  assert.ok(html.includes('data-project-theme="sunset"'));
});

test("stacking is allowed only when every card is readable below its own sticky offset", () => {
  const fits = components.projectStackFitsViewport;
  assert.equal(fits([600, 600, 600, 600], 900, 166, 14), true);
  assert.equal(fits([800, 600, 600, 600], 900, 166, 14), false);
  assert.equal(fits([600, 600, 600, 600], 740, 166, 14), false);
  assert.equal(fits([500, 500, 500], 700, 166, 14), false);
  assert.equal(fits([512, 498, 484], 700, 166, 14), true);
  assert.equal(fits([512.5, 498.5, 484.5], 700, 166, 14), true);
  assert.equal(fits([512, 498, 486], 700, 166, 14), false);
  assert.equal(fits([712, 698, 684, 670], 900, 166, 14), true);
});
