# Restaurant Template

A reusable restaurant website and digital menu built with Next.js (App Router), React, TypeScript, and Tailwind CSS. The interface is Arabic (RTL) and mobile-first. The first brand is **Ahl Al Karam (أهل الكرم)**, a shawarma restaurant.

> **Status:** the public site is MVP-complete: home page (3D hero, best sellers, offers, about, reviews), digital menu with item details, cart and WhatsApp checkout (delivery or table), table QR codes, sharing, and SEO. Live at https://restaurant-template-ecru.vercel.app. A browser-only dashboard prototype is next. There is no backend: the project is frontend-first with typed mock data behind `src/services/`.

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
├── app/            # Routes: (site)/ public pages + @modal popups (item details, cart), icons, sitemap, robots
├── components/     # layout/, home/, menu/, cart/, reviews/, seo/, motion/ (hero spit), ui/ (shared), lab/ (dev-only)
├── config/         # restaurant.ts: brand identity, nav, SEO, currency, theme, hero
├── types/          # Data models
├── data/mock/      # Mock content (only services/ import it)
├── services/       # Data access: the future API boundary
├── hooks/          # Browser stores: cart, sent order, table session
└── lib/            # Pure logic: cart, order message, SEO, search, table links…
scripts/            # table-qr.mjs (npm run qr)
public/assets/      # Logo, hero, menu photos, share image
```

## Customizing for another restaurant

Brand values live in `src/config/restaurant.ts` (including the share image and the business details for Google), and colors come from a `[data-theme="…"]` block in `src/app/globals.css`. Replace `src/app/icon.png` (512×512) and `src/app/apple-icon.png` (180×180) with the brand's icon, and the share image (1200×630 JPG) referenced by `seo.shareImage`. Note that Tailwind's spacing scale is set to **1px per unit** (`p-16` = 16px).

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · react-icons · three.js (lab only)
