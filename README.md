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
| `npx tsc --noEmit` | Type-check |

Development-only experiments: `/lab/rotation` (hero spit-rotation approaches) and `/lab/scroll` (scroll storytelling). Both return 404 in production.

## Project structure

```text
src/
├── app/            # Routes (App Router), root layout, global styles & theme tokens
├── components/     # layout/, home/, lab/ (dev-only)
└── config/         # restaurant.ts: brand identity, SEO, contact, theme, hero content
public/assets/      # Logo, backgrounds, hero frame sequence
```

## Customizing for another restaurant

Brand values live in `src/config/restaurant.ts`, and colors come from a `[data-theme="…"]` block in `src/app/globals.css`. Note that Tailwind's spacing scale is set to **1px per unit** (`p-16` = 16px).

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · react-icons · three.js (lab only)
