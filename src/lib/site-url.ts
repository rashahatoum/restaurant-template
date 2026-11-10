// The site's absolute origin: metadataBase, sitemap, robots, JSON-LD.
// Set NEXT_PUBLIC_SITE_URL per deployment (e.g. https://example.com) once
// the domain exists; local runs fall back to localhost.

const FALLBACK = "http://localhost:3000";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK);

/** Still a local or Vercel preview address, not the restaurant's own domain (don't print QR codes yet). */
export const isTemporaryHost = /^(localhost|127\.0\.0\.1)$|\.vercel\.app$/.test(siteUrl.hostname);

/** "/menu" → "https://example.com/menu". */
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
