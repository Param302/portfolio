import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transform } from "next/dist/build/swc/index.js";
import * as themeModule from "../src/lib/project-themes.js";
import * as resumeInline from "../src/lib/resume-inline.js";
import { defaultResumeDocument, parseResumeDocument } from "../src/lib/resume-schema.js";

const { defaultProjectGradient, getProjectTheme, normalizeProjectGradient, projectForDisplay, projectGradientCss, projectLinkLabel, projectPalette, projectThemes } = themeModule;
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
  "@/lib/resume-inline": resumeInline,
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
    assert.ok(html.includes("linear-gradient(135deg, #0B0F19"));
    assert.ok(!html.includes("getreadmewithme.vercel.app"));
  }
  assert.ok(publicHtml.includes("data-stack-card"));
  assert.ok(!previewHtml.includes("data-stack-card"));
  assert.ok(previewHtml.includes('data-preview-theme="dark"'));
});

test("homepage project cards and preview remove emphasis markers without applying resume formatting", () => {
  const project = structuredClone(defaultResumeDocument.projects[0]);
  project.description = "A **bold idea** and *italic description*.";
  project.skills = ["**Python**", "_FastAPI_", "model_name"];
  project.pdfBulletLimit = 3;
  project.bullets = ["**500+ users** and *first launch*", "_Team effort_", "Third", "**Fourth project point** stays"];
  for (const component of [components.default, components.ProjectsPreview]) {
    const html = renderToStaticMarkup(createElement(component, { projects: [project] }));
    for (const expected of ["A bold idea and italic description.", "500+ users and first launch", "Team effort", "Fourth project point stays", ">Python</span>", ">FastAPI</span>", ">model_name</span>"]) assert.ok(html.includes(expected), expected);
    assert.doesNotMatch(html, /<(strong|em)(\s|>)|\*\*|\*italic description\*|_FastAPI_|_Team effort_/);
  }
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

test("presets only use the portfolio palette and keep every stored theme ID", () => {
  assert.deepEqual(projectThemes.map((theme) => theme.id), ["surface", "brand", "accent", "ocean", "aurora", "sunset", "custom"]);
  const palette = new Set(projectPalette.map((item) => item.color));
  for (const theme of projectThemes) {
    for (const color of theme.swatch.match(/#[0-9a-f]{6}/gi)) assert.ok(palette.has(color), `${theme.id}: ${color}`);
  }
});

test("custom gradient settings survive save, reload, and preset switches", () => {
  const source = structuredClone(defaultResumeDocument);
  const gradient = { type: "conic", angle: 280, shape: "circle", center: { x: 20, y: 75 }, stops: [{ color: "#1bb6e0", position: 80 }, { color: "#ffedd4", position: 20 }, { color: "#f8fafc", position: 100 }], textMode: "dark" };
  source.projects[0].theme = "custom";
  source.projects[0].gradient = gradient;
  const saved = parseResumeDocument(JSON.parse(JSON.stringify(source)));
  assert.deepEqual(saved.projects[0].gradient, { ...gradient, stops: gradient.stops.map((stop) => ({ ...stop, color: stop.color.toUpperCase() })) });
  saved.projects[0].theme = "brand";
  const reloaded = parseResumeDocument(JSON.parse(JSON.stringify(saved)));
  reloaded.projects[0].theme = "custom";
  assert.deepEqual(reloaded.projects[0].gradient, saved.projects[0].gradient);
  delete source.projects[0].gradient;
  assert.deepEqual(parseResumeDocument(source).projects[0].gradient, defaultProjectGradient);
});

test("custom gradient save rejects CSS injection and out-of-range values", () => {
  const cases = [
    { type: "url(https://example.com)" }, { angle: -1 }, { angle: 361 }, { angle: Infinity },
    { shape: "polygon" }, { center: { x: -1, y: 50 } }, { center: { x: 50, y: 101 } },
    { textMode: "red" }, { stops: [] }, { stops: [{ color: "#ffffff", position: 0 }] },
    { stops: Array.from({ length: 6 }, () => ({ color: "#ffffff", position: 50 })) },
    { stops: [{ color: "red; background:url(secret)", position: 0 }, { color: "#ffffff", position: 100 }] },
    { stops: [{ color: "#000000", position: -1 }, { color: "#ffffff", position: 100 }] },
    { stops: [{ color: "#000000", position: 0 }, { color: "#ffffff", position: 101 }] },
  ];
  for (const patch of cases) {
    const document = structuredClone(defaultResumeDocument);
    document.projects[0].gradient = { ...defaultProjectGradient, ...patch };
    assert.throws(() => parseResumeDocument(document), (error) => error.issues.some((issue) => issue.path.join(".").startsWith("projects.0.gradient")), JSON.stringify(patch));
  }
});

test("all gradient geometries render sorted stops without modifying draft order", () => {
  const gradient = { ...structuredClone(defaultProjectGradient), angle: 270, shape: "circle", center: { x: 25, y: 75 }, stops: [{ color: "#FFEDD4", position: 100 }, { color: "#1BB6E0", position: 0 }] };
  const snapshot = structuredClone(gradient);
  assert.equal(projectGradientCss(gradient), "linear-gradient(270deg, #1BB6E0 0%, #FFEDD4 100%)");
  assert.equal(projectGradientCss({ ...gradient, type: "radial" }), "radial-gradient(circle at 25% 75%, #1BB6E0 0%, #FFEDD4 100%)");
  assert.equal(projectGradientCss({ ...gradient, type: "conic" }), "conic-gradient(from 270deg at 25% 75%, #1BB6E0 0%, #FFEDD4 100%)");
  assert.deepEqual(gradient, snapshot);
  const safe = projectGradientCss({ type: "url(secret)", angle: "var(--secret)", stops: [{ color: "red;url(secret)", position: -10 }, null] });
  assert.ok(!safe.includes("secret"));
  assert.ok(!safe.includes("undefined"));
  assert.deepEqual(normalizeProjectGradient(null), defaultProjectGradient);
});

test("mixed gradients protect text, while safe presets and auto contrast remain unobscured", () => {
  const mixed = { ...defaultProjectGradient, stops: [{ color: "#000000", position: 0 }, { color: "#FFFFFF", position: 100 }] };
  for (const textMode of ["auto", "light", "dark"]) assert.notEqual(getProjectTheme("custom", "light", { ...mixed, textMode }).colors.content, "transparent");
  const dark = { ...defaultProjectGradient, stops: [{ color: "#0B0F19", position: 0 }, { color: "#1A2235", position: 100 }] };
  assert.equal(getProjectTheme("custom", "light", dark).colors.foreground, "#F8FAFC");
  assert.equal(getProjectTheme("custom", "light", dark).colors.content, "transparent");
  assert.equal(getProjectTheme("custom", "dark", defaultProjectGradient).colors.foreground, "#1A2235");
  assert.equal(getProjectTheme("custom", "dark", defaultProjectGradient).colors.content, "transparent");
});

test("custom gradient card styles are identical in homepage and preview, in either mode", () => {
  const project = structuredClone(defaultResumeDocument.projects[0]);
  project.theme = "custom";
  project.gradient = { ...defaultProjectGradient, type: "radial", shape: "circle", center: { x: 20, y: 30 }, stops: [{ color: "#000000", position: 0 }, { color: "#FFFFFF", position: 100 }] };
  for (const mode of ["light", "dark"]) {
    const publicHtml = renderToStaticMarkup(createElement(components.ProjectBlock, { project, theme: mode }));
    const previewHtml = renderToStaticMarkup(createElement(components.ProjectsPreview, { projects: [project], theme: mode }));
    for (const html of [publicHtml, previewHtml]) {
      assert.ok(html.includes("radial-gradient(circle at 20% 30%, #000000 0%, #FFFFFF 100%)"));
      assert.ok(html.includes('data-content-backdrop="true"'));
      assert.ok(html.includes('data-project-theme="custom"'));
    }
    const cardStyle = (html) => html.match(/<article[^>]+style="([^"]+)"/)[1];
    assert.equal(cardStyle(publicHtml), cardStyle(previewHtml));
  }
});

test("theme editor exposes one visual selector and only distinct custom controls", async () => {
  const { default: Picker } = await loadJsx("../src/app/admin/ProjectThemePicker.js", {
    "@/app/ThemeContext": { useTheme: () => ({ theme: "light" }) },
    "@/lib/project-themes": themeModule,
    "./ProjectThemePicker.module.css": new Proxy({}, { get: (_, key) => key }),
  });
  const html = renderToStaticMarkup(createElement(Picker, { value: "custom", gradient: { ...defaultProjectGradient, type: "radial" }, onChange: () => {}, onGradientChange: () => {} }));
  assert.equal((html.match(/aria-label="Use [^"]+ theme"/g) || []).length, projectThemes.length);
  assert.ok(!html.includes("Card theme"));
  assert.ok(!html.includes("Homepage appearance"));
  assert.ok(html.includes(">Gradient</span>"));
  assert.ok(html.includes(">Shape</span>"));
  assert.ok(html.includes("Center X"));
  assert.ok(html.includes("Add stop"));
});
