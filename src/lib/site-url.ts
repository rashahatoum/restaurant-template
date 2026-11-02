// The site's absolute origin: metadataBase, sitemap, robots, JSON-LD.
// Set NEXT_PUBLIC_SITE_URL per deployment (e.g. https://example.com) once
// the domain exists; local runs fall back to localhost.

const FALLBACK = "http://localhost:3000";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK);

/** "/menu" → "https://example.com/menu". */
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
