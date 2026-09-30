import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import config from "../next.config.mjs";
import sitemap from "../src/app/sitemap.js";
import robots from "../src/app/robots.js";
import { defaultResumeDocument } from "../src/lib/resume-schema.js";
import { profileResponse, renderPublicIndex, renderPublicProfile } from "../src/lib/public-profile.js";
import { homeStructuredData, pageMetadata, publicPageStructuredData, serializeJsonLd, siteConfig, socialResources, learningResources } from "../src/app/data/seoData.js";

test("sitemap lists only canonical pages, without redirects, fragments or fresh fake dates", () => {
  assert.deepEqual(sitemap(), ["/", "/resume", "/walloffame"].map((path) => ({ url: `https://itsparam.in${path}` })));
});

test("crawlers can fetch noindex documents; private APIs remain excluded", async () => {
  const rules = robots().rules[0];
  assert.equal(rules.userAgent, "*");
  assert.equal(rules.allow, "/");
  assert.ok(rules.disallow.includes("/api/"));
  assert.ok(!rules.disallow.includes("/admin"));
  assert.ok(!rules.disallow.includes("/agents.md"));
  const headers = await config.headers();
  for (const source of ["/admin/:path*", "/api/:path*"]) {
    assert.match(headers.find((entry) => entry.source === source).headers.find((header) => header.key === "X-Robots-Tag").value, /noindex/);
  }
  assert.equal(profileResponse("test", "text/markdown").headers.get("X-Robots-Tag"), "noindex, follow");
});

test("public references use current published content and never serialize private fields", () => {
  const content = structuredClone(defaultResumeDocument);
  content.summary = "Updated published summary";
  content.experience[0].role = "Updated published role";
  content.privateNotes = "DO NOT EXPOSE THIS";
  content.profile.phone = "PRIVATE-PHONE-MARKER";
  const text = renderPublicProfile(content);
  assert.match(text, /Updated published summary/);
  assert.match(text, /Updated published role/);
  assert.match(text, /## Resume of Parampreet Singh/);
  assert.doesNotMatch(text, /\/admin|\/api\/|DO NOT EXPOSE THIS|PRIVATE-PHONE-MARKER/);
  for (const resource of [...socialResources, ...learningResources]) {
    assert.ok(text.includes(resource.url));
    assert.ok(renderPublicIndex().includes(resource.path));
  }
});

test("references match existing instant redirects", async () => {
  const redirects = await config.redirects();
  for (const resource of [...socialResources, ...learningResources]) {
    const redirect = redirects.find((entry) => new RegExp(`^${entry.source}$`).test(resource.path));
    assert.equal(redirect?.destination, resource.url, resource.path);
    assert.equal(redirect?.permanent, true);
  }
});

test("metadata has page-specific canonical and social previews", () => {
  assert.equal(pageMetadata(siteConfig.title, siteConfig.shortBio, "/").title.absolute, siteConfig.title);
  for (const path of ["/resume", "/walloffame"]) {
    const metadata = pageMetadata("Page title", "Page description", path);
    assert.equal(metadata.alternates.canonical, path);
    assert.equal(metadata.openGraph.url, `${siteConfig.url}${path}`);
    assert.equal(metadata.twitter.title, "Page title | itsparam.in");
  }
});

test("structured data has valid list entries and no invisible FAQ or fake search", () => {
  const graph = homeStructuredData(defaultResumeDocument)["@graph"];
  assert.equal(graph.filter((node) => node["@type"] === "Person").length, 1);
  const serialized = JSON.stringify(graph);
  assert.doesNotMatch(serialized, /FAQPage|SearchAction|\/admin|alumniOf/);
  const projects = graph.find((node) => node["@type"] === "ItemList");
  assert.equal(projects.itemListElement.length, 4);
  assert.ok(projects.itemListElement.every((entry) => entry["@type"] === "ListItem" && entry.item.author["@id"]));
  const breadcrumbs = publicPageStructuredData(defaultResumeDocument, "/resume", "Resume", "Resume")["@graph"].find((node) => node["@type"] === "BreadcrumbList");
  assert.deepEqual(breadcrumbs.itemListElement.map((entry) => entry.item), ["https://itsparam.in/", "https://itsparam.in/resume"]);
});

test("published text cannot break out of JSON-LD scripts", () => {
  const input = { name: '</script><script>alert("test")</script>' };
  const serialized = serializeJsonLd(input);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), input);
});

test("resume metadata omits removed optional sections while the homepage keeps its source data", () => {
  const content = structuredClone(defaultResumeDocument);
  content.sections = content.sections.filter(({ id }) => id === "experience" || id === "projects");
  const resumePerson = publicPageStructuredData(content, "/resume", "Resume", "Resume")["@graph"].find((item) => item["@type"] === "Person");
  for (const key of ["description", "knowsAbout", "memberOf"]) assert.equal(resumePerson[key], undefined, key);
  const homePerson = homeStructuredData(content)["@graph"].find((item) => item["@type"] === "Person");
  assert.equal(homePerson.description, content.summary);
  assert.deepEqual(homePerson.knowsAbout, content.skills.flatMap((group) => group.items));
  assert.equal(homePerson.memberOf.length, content.education.length);
});

test("optimized image manifest points to smaller files and preserves originals", async () => {
  const manifest = JSON.parse(await readFile(new URL("../src/lib/optimized-images.json", import.meta.url), "utf8"));
  assert.ok(Object.keys(manifest).length > 20);
  for (const [original, optimized] of Object.entries(manifest)) {
    const [source, result] = await Promise.all([stat(new URL(`../public${original}`, import.meta.url)), stat(new URL(`../public${optimized}`, import.meta.url))]);
    assert.ok(result.size < source.size, original);
    assert.match(optimized, /\.webp$/);
  }
});
