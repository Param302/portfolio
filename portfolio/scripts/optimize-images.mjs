import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = path.join(root, "public");
const sources = ["parampreet.png", "parampreet_singh.png", "gurmatdarbar.png", "gurmatdarbar_logo.png", "yt-channel.png", "yt-channel-dark.png"];

async function collect(directory) {
  for (const entry of await readdir(path.join(publicDir, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await collect(relative);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) sources.push(relative);
  }
}

for (const directory of ["projects", "media", "socials"]) await collect(directory);

const manifest = {};
let originalBytes = 0;
let optimizedBytes = 0;
for (const source of sources.sort()) {
  const input = path.join(publicDir, source);
  const target = `optimized/${source.replace(/\.(png|jpe?g)$/i, ".webp")}`;
  const output = path.join(publicDir, target);
  const size = (await stat(input)).size;
  const width = source.startsWith("socials/") ? 96 : source.includes("logo") ? 480 : source.startsWith("parampreet") ? 960 : 1600;
  await mkdir(path.dirname(output), { recursive: true });
  const result = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer({ resolveWithObject: true });
  // Refresh even a previously linked static copy when its source changes.
  await writeFile(output, result.data);
  if (result.info.size >= size) continue;
  manifest[`/${source}`] = `/${target}`;
  originalBytes += size;
  optimizedBytes += result.info.size;
}

await writeFile(path.join(root, "src/lib/optimized-images.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes, optimizedBytes, reductionPercent: Math.round(100 * (1 - optimizedBytes / originalBytes)) }, null, 2));
