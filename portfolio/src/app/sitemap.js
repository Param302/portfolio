import { publicPages, siteConfig } from "./data/seoData.js";

export default function sitemap() {
  // Only canonical, indexable pages. Fragments and redirects are not separate pages.
  // Omit lastModified until a reliable content modification date is available.
  return publicPages.map((page) => ({ url: `${siteConfig.url}${page.path}` }));
}
