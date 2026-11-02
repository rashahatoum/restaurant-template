# Restaurant Template

A reusable restaurant website and digital menu built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The interface is Arabic (RTL) and mobile-first. The first brand is **Ahl Al Karam (أهل الكرم)**, a shawarma restaurant.

> **Status:** early development. The home page hero and navigation exist. The menu, cart and WhatsApp checkout, the remaining home sections, and a dashboard prototype are planned. There is no backend: the project is frontend-first with typed mock data.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check (`tsc --noEmit`) |
| `npm run qr -- https://your-domain` | Printable table QR sheets (one HTML per branch + a menu QR) in `qr-codes/` (git-ignored). Print only once the final domain is set |

Development-only experiment: `/lab/rotation` (hero spit rotation in 3D, three.js). Returns 404 in production.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The deployed site's origin, e.g. `https://example.com`. Used for `metadataBase` (link previews), canonical URLs, `sitemap.xml`, `robots.txt` and the Restaurant JSON-LD. **Set it before a production build**; without it those URLs point to `http://localhost:3000`. |

## Project structure

```text
src/
├── app/            # Routes (App Router), root layout, global styles & theme tokens
├── components/     # layout/, home/, lab/ (dev-only)
└── config/         # restaurant.ts: brand identity, SEO, contact, theme, hero content
public/assets/      # Logo, backgrounds, hero frame sequence
```

## Customizing for another restaurant

Brand values live in `src/config/restaurant.ts` (including the share image and the business details for Google), and colors come from a `[data-theme="…"]` block in `src/app/globals.css`. Replace `src/app/icon.png` (512×512) and `src/app/apple-icon.png` (180×180) with the brand's icon, and the share image (1200×630 JPG) referenced by `seo.shareImage`. Note that Tailwind's spacing scale is set to **1px per unit** (`p-16` = 16px).

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · react-icons · three.js (lab only)
