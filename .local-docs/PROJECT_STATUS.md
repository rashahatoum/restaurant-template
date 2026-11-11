# Project Status

> Snapshot of what actually exists, measured against [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md). Keep this file short and current. It replaces the former `CURRENT-STATE.md` (archived).

**Last updated:** 2026-11-11 · **Branch:** `main` up to PR #37 (docs shared with the backend developer); `docs/backend-contract-response`: API contract agreed with the backend developer. Next: D7 API readiness, one area at a time as the Laravel API reaches staging

## Validation snapshot (2026-11-03, `main` at PR #24)

| Check | Result |
|---|---|
| `npm run lint` | ✅ clean |
| `npm run typecheck` | ✅ clean (after a build when routes changed: stale `.next/types` otherwise) |
| `npm run build` | ✅ 59 static pages on Next.js 16.4.3 (home, menu, 16 item pages + their popups and share images, cart, icons, sitemap, robots). One warning: no fallback-font metrics for `Playpen Sans Arabic` |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| `npm audit` (incl. dev) | 17 (16 moderate in the ESLint toolchain via `minimatch`, 1 high in `zod` via `eslint-plugin-react-hooks`). Dev-only, nothing shipped |
| Live site | ✅ table QR link, share button and per-item preview images checked on the deployment |

## Requirements coverage

Legend: ✅ done · 🟡 partial · ❌ missing

### Foundation
| Item | Status | Notes |
|---|---|---|
| Next.js App Router + TS + Tailwind | ✅ | |
| Arabic RTL, Arabic fonts | ✅ | `lang="ar" dir="rtl"`; Tajawal body, Playpen Sans Arabic display |
| Central brand config | ✅ | Typed `restaurantConfig` (`satisfies RestaurantConfig`): name, logo, nav, SEO (share image, colors, business), currency, theme, hero photos / links / spit (texts are content since D5a), reviews wallpaper |
| Design tokens / theme | ✅ | One theme (`fire`); components use tokens; 1px spacing scale; `--color-whatsapp` fixed token |
| Data layer (types, mock data, services) | ✅ | Menu, offers, about, reviews, banners, site info, ordering: `types/` → `data/mock/` → `services/`, dashboard-ready flags |
| SEO baseline | ✅ | `metadataBase` (`NEXT_PUBLIC_SITE_URL`), canonical + full Open Graph per page (`lib/seo`), share images (site + one per item), icons, `sitemap.xml`, `robots.txt`, Restaurant JSON-LD per branch (validated on validator.schema.org: 0 errors) |

### Restaurant website
| Item | Status | Notes |
|---|---|---|
| Responsive navigation + mobile menu | ✅ | Fixed header; native `<dialog>` mobile menu. "تعرّف علينا" replaces "اطلب الآن" on `/menu` |
| Interactive hero | ✅ | 3D spit (three.js lazy, photo first, reduced motion), city badge, one screen tall. Needs a real-phone check |
| Introduction & key benefits | ✅ | About (`#about`); three benefits in the hero |
| Featured products & offers | 🟡 | Best sellers + offers sliders, "عرض الكل" under the titles, "شوف المكونات" hints. Offer images and real prices pending |
| Customer reviews | 🟡 | WhatsApp-style cards with the brand wallpaper. Mock reviews; real ones pending |
| Location, hours, contact | ✅ | Footer `#contact` / `#location`: real phones + WhatsApp, two branches (no map links yet), placeholder hours |
| SEO-friendly pages | ✅ | See SEO baseline |

### Digital menu
| Item | Status |
|---|---|
| Categories, product cards | ✅ `/menu`: banner, category cards (4 per row on phones), one-row sticky search + section select, compact item rows (~5 per phone screen, whole row opens the details). Items without ingredients (drinks) supported; `imageStyle: "photo"` rounds full photos |
| Product details & options | ✅ `/menu/<id>` (popup from links, page on direct visit), size toggle, arrows to ingredients (labels instant, arrows ~1.2 s), big price right under the photo, share on WhatsApp |
| Quantity selection | ✅ `QuantityStepper` per item/size |
| Featured / promo products | 🟡 "الأكثر طلباً" pill + banner slides; no promo prices |
| QR code access | ✅ Per-table links pre-fill the table (3 h); codes hold the short link `/t/<branch>/<n>` (307 to the menu); printable A4 sheets from `/dashboard/qr` (D6c, review pending). **Print after the domain is bought** |

### Cart & checkout
| Item | Status |
|---|---|
| Add/remove/update items, totals | ✅ Cart popup over any page (`/cart` as a full page on direct visit), cart bar, NavBar badge, per-item notes |
| Customer details, delivery fee | ✅ Delivery (+150) or table (branch + number, pre-filled from a table QR); order note |
| Structured WhatsApp message | ✅ "أكّد الطلب" sheet from the menu or the cart; order number `#DDMM-HHMM-XX` (restaurant time zone); cart and table forgotten on send, with a restore. Needs a real-phone test (number display and WhatsApp search) |

### Dashboard prototype
| Item | Status |
|---|---|
| Login, session, protection | 🟡 D0 on `feat/dashboard`: `/dashboard/login`, 7-day signed cookie, `proxy.ts`. **Vercel needs `DASHBOARD_USERNAME`, `DASHBOARD_PASSWORD`, `SESSION_SECRET` before deploy** |
| Error messages (backend-ready) | 🟡 D0: `AppError` model + components, review page `/lab/errors` (dev) |
| Prices, availability, best sellers | 🟡 D1: `/dashboard/menu` quick edits with undo, saved in this browser (repository ready for Laravel) |
| Product form (add / edit / delete, live preview, sizes) | ✅ D2a (PR #27) |
| Categories (add / rename / reorder / delete) | ✅ D2b (PR #27) |
| Photos (products, category cards): upload, compress, cut-out detection | ✅ D3 (PR #28) |
| Offers (section, add/edit/delete, on/off, order, card preview, «ميّز» titles) | ✅ D4a (PR #29) |
| Menu banner (slides, button target from a list, preview) | ✅ D4b (PR #30) |
| Best-seller order (add, remove with undo, animated reorder) | ✅ D4c (PR #31) |
| Hero + «من نحن» (texts, feature icons, paragraphs with highlights, photo) | ✅ D5a (PR #32) |
| Reviews (section, add/edit/delete, shown/hidden, order, card preview, time from a clock) | ✅ D5b (PR #33) |
| Restaurant info (tagline, social links, phones, branches, hours) | ✅ D6a (PR #34). Real social links and branch staff numbers still missing from the data |
| Ordering | ✅ D6b `/dashboard/ordering` (PR #35) |
| Table QR codes | ✅ D6c `/dashboard/qr` + print sheet (PR #36) |

### Hero motion
| Item | Status | Notes |
|---|---|---|
| Shawarma spit rotation | ✅ | Approach B (three.js lathe from one photo), `components/motion/HeroSpit` |
| Reduced motion / fallback | ✅ | Stays a photo under reduced motion, low memory or WebGL errors |
| Burger / pizza motions | ❌ | Only for future brands |

## Known issues

1. Table counts (10 per branch) are placeholders. Each branch now has its own floor staff number for table orders, but they're placeholders (the two restaurant numbers repeated) until the owner sends the real ones.
2. No domain yet: the live URL is `*.vercel.app`. Table QR codes must not be printed before the domain is set (the URL is in the codes).
3. Branch preview URLs on Vercel are shortened with a hash (name too long), so they can't be predicted from the branch name; use the PR's "Visit Preview" link.
4. `next dev`: after adding, moving or deleting route files, restart it (a running server kept a stale route graph and reload-looped). Never add a catch-all to `@modal` (DECISIONS 2026-11-02).
5. Build warning: no fallback-font metrics for `Playpen Sans Arabic` (harmless).
6. Dev-only audit findings in the ESLint toolchain (see snapshot); wait for upstream fixes.

## Current priorities

1. Owner's real-phone check of the latest features (compact menu, order number in WhatsApp, cart popup, checkout sheet, share, table QR).
2. Dashboard prototype (Phase 7): owner review of [DASHBOARD_PLAN.md](DASHBOARD_PLAN.md) and its open decisions, then build phase by phase.
3. Backend (separate Laravel repo, Hostinger): contract agreed 2026-11-11 ([API-CONTRACT.md](API-CONTRACT.md)). Next from the frontend: export the mock data as JSON for the seeders; then switch each area once it works on staging (API-CONTRACT §7).
4. When available: domain (also decides `api.<domain>`), real table counts, branch map links, Instagram / Facebook / Threads links (the footer icons show once they're in the data), offer images and real prices.

## Open questions (need the owner's decision)

1. **Reusability model:** one restaurant per deployment, with config, data, assets and theme swapped per brand? (Assumed yes.)
2. **Dashboard decisions:** preview approach, save model, image storage, first scope (DASHBOARD_PLAN §8).
3. **Meal contents:** do meals include a drink? Meal ingredients and meal/size prices are placeholders.
4. **Domain:** which one, and when (blocks printing the QR codes).

Answered since the last update: API contract with the backend (agreed 2026-11-11: DECISIONS), docs in git (yes, 2026-11-11, shared with the backend developer), currency/fee (SYP, fixed 150), WhatsApp numbers, spit motion (B), hero layout, QR approach (dev script, `qrcode`), product details UX.
