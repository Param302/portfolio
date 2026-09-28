import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import { homeSections, learningResources, siteConfig, socialResources } from "../src/app/data/seoData.js";

const base = process.argv[2] || "http://localhost:3100";
const get = (path, options = {}) => fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), ...options });
const pages = [
  ["/", siteConfig.title],
  ["/resume", "Resume of Parampreet Singh | itsparam.in"],
  ["/walloffame", "Feedbacks of sessions by Parampreet Singh | itsparam.in"],
];
let checks = 0;
for (const [path, title] of pages) {
  const response = await get(path, { headers: { "User-Agent": "Googlebot" } });
  assert.equal(response.status, 200, path);
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex/);
  const html = await response.text();
  assert.ok(html.includes(`<title>${title}</title>`), `${path} title`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const socialUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  assert.equal(new URL(canonical).href, `${siteConfig.url}${path}`, `${path} canonical`);
  assert.equal(new URL(socialUrl).href, `${siteConfig.url}${path}`, `${path} social URL`);
  assert.doesNotMatch(html, /<meta name="(?:robots|googlebot)" content="[^"]*noindex/);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  assert.equal(scripts.length, 1, `${path} JSON-LD`);
  const graph = JSON.parse(scripts[0][1]);
  assert.doesNotMatch(JSON.stringify(graph), /\/admin|FAQPage|SearchAction/);
  if (path === "/") {
    for (const section of homeSections) assert.ok(html.includes(`id="${section.id}"`), section.id);
    const projects = graph["@graph"].find((node) => node["@type"] === "ItemList");
    for (const project of projects.itemListElement) assert.ok(html.includes(`id="${new URL(project.item.url).hash.slice(1)}"`));
    assert.ok(html.includes("%2Foptimized%2F"), "responsive images use WebP source assets");
  }
  checks++;
}

for (const path of ["/admin", "/admin/seo-check", "/api/admin/content"]) {
  const response = await get(path);
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  const body = await response.text();
  assert.doesNotMatch(body, /<script type="application\/ld\+json">/);
  checks++;
}

let markdown;
for (const [path, type] of [["/agents.md", "text/markdown"], ["/llms.txt", "text/plain"], ["/llms-full.txt", "text/plain"]]) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get("content-type").startsWith(type));
  assert.match(response.headers.get("x-robots-tag"), /noindex, follow/);
  const text = await response.text();
  assert.doesNotMatch(text, /\/admin|\/api\/|DATABASE_URL/);
  if (path === "/agents.md") {
    assert.ok(text.includes("## Resume of Parampreet Singh"));
    markdown = text;
  }
  if (path === "/llms-full.txt") assert.equal(text, markdown);
  checks++;
}

const sitemap = await (await get("/sitemap.xml")).text();
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), pages.map(([path]) => `${siteConfig.url}${path}`));
const robots = await (await get("/robots.txt")).text();
assert.ok(robots.includes("Sitemap: https://itsparam.in/sitemap.xml"));
assert.doesNotMatch(robots, /Disallow: \/(?:admin|agents\.md|_next)/);
checks += 2;

for (const resource of [...socialResources, ...learningResources]) {
  const response = await get(resource.path, { redirect: "manual" });
  assert.equal(response.status, 308, resource.path);
  assert.equal(response.headers.get("location"), resource.url);
  checks++;
}

const image = await get("/_next/image?url=%2Foptimized%2Fprojects%2Fpocket-coder.webp&w=640&q=75", { headers: { Accept: "image/webp" } });
assert.equal(image.status, 200);
assert.match(image.headers.get("content-type"), /image\/webp/);
checks++;

await mkdir(new URL("../output/seo/", import.meta.url), { recursive: true });
await writeFile(new URL("../output/seo/agents.md", import.meta.url), markdown);
console.log(`${checks} HTTP SEO checks passed against ${base}. Public Markdown preview saved to output/seo/agents.md.`);
