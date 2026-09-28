import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { optimizedImage } from "./optimized-image";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export async function listPublicImages(relativeDirectory, fallback = []) {
  try {
    const directory = path.join(process.cwd(), "public", relativeDirectory);
    const files = await readdir(directory, { withFileTypes: true });
    const images = files.filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())).map((entry) => `/${relativeDirectory.replaceAll("\\", "/")}/${entry.name}`).sort();
    return (images.length ? images : fallback).map(optimizedImage);
  } catch {
    return fallback.map(optimizedImage);
  }
}
