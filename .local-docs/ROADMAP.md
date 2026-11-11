# Roadmap

Frontend-first MVP for Ahl Al Karam, built to be reusable for other brands. Scope: [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md). Live status: [PROJECT_STATUS.md](PROJECT_STATUS.md).

Statuses: `TODO` · `IN PROGRESS` · `DONE` (exists **and** works) · `BLOCKED`.
The phase order is a proposal pending approval. Each phase ends with lint, type-check, build, and a manual mobile/desktop check.

## Primary user journeys (MVP)

1. **Customer (QR or link):** opens `/menu` → browses categories → opens a product, picks options and quantity → adds to cart → enters name, phone, address, notes → sends a pre-filled WhatsApp order.
2. **Visitor (search or social):** lands on `/` → sees the hero, benefits, featured items, offers, reviews → finds location, hours, contact → goes to the menu.
3. **Owner (demo):** opens `/dashboard` → edits products, prices, offers, featured items, reviews → previews the result. Edits stay local to the browser.

---

## Phase 0 — Audit & documentation — `DONE`
- `DONE` Audit the codebase against the new requirements
- `DONE` Rewrite `.local-docs/`, `CLAUDE.md`, `README.md`
- `DONE` Owner works from these docs; remaining open questions live in PROJECT_STATUS

## Phase 1 — Stabilize & clean up — `DONE`
Deliverable: the existing home page is correct, accessible, and secure. No new features. Details are in [CLEANUP_PLAN.md](CLEANUP_PLAN.md).
- `DONE` Next.js security patch upgrade to 16.4.3 (merged)
- `DONE` Fix 1px-scale spacing bugs, no-op classes, and hard-coded colors
- `DONE` NavBar accessibility (native `<dialog>`: Escape, focus trap, close on navigate, `aria-expanded`, scroll lock); nav links and CTA label moved to config
- `DONE` Type the restaurant config (`RestaurantConfig`, theme union)
- `DONE` Hero layout: `(site)` route group, fluid `page-gutter`, hybrid spit layout, restyled CTAs
- `DONE` `HeroImageSequence` removed (replaced by `HeroSpit`, Phase 6)
- `DONE` SEO baseline: `metadataBase`, Open Graph, favicon/icons, `robots.ts`, `sitemap.ts`, Restaurant JSON-LD (2026-11-02; needs `NEXT_PUBLIC_SITE_URL` at deploy)
- `DONE` Add a `typecheck` npm script

## Phase 2 — Data layer — `DONE`
Deliverable: typed mock catalog behind services. No UI yet.
- `DONE` Menu types (`Category`, `Product`, option groups, `MenuSection`). `Offer`/`Review` come with their sections (Phase 5)
- `DONE` Ahl Al Karam mock menu: 6 realistic placeholder products (real menu not available)
- `DONE` Services: `getCategories`, `getMenu`, `getBestSellers`. Offers/reviews services come with their sections
- `DONE` Currency in config (SYP)
- `DONE` Placeholder dish images (AI-generated, 500×500 transparent webp, round plates) in `public/assets/imgs/menu/`
- `DONE` Contact, hours and delivery settings: `SiteInfo` and ordering settings behind services (dashboard-editable), not config

## Phase 3 — Digital menu — `DONE` (real prices and error/loading states wait for the dashboard/API)
Deliverable: a working `/menu` that a QR code can point to. Split into three branches: `feat/menu-page` → `feat/cart` → `feat/checkout`.
- `DONE` (`feat/menu-page`) `/menu` route with metadata, banner (`AutoCarousel`), sticky category chips with scroll-spy, item rows, empty state, Arabic 404. Needs manual check on real devices.
- `DONE` (`feat/product-page`) Item details for products and offers: modal on click (intercepting route), full page on direct link, animated arrows to ingredients. Needs manual check.
- `DONE` Options UX decided: no product sheet/page (superseded for viewing by the details page above). Only the shawarma sandwich size is an option (inline toggle); every "+" adds directly; extras become cart notes.
- `DONE` "الأكثر طلباً" pill on best sellers; unavailable items dimmed without an add button
- `DONE` (`feat/cart`) "+" wired: cart store (`useCart`, localStorage), `QuantityStepper` (per selected size), fixed cart bar on the menu, `/cart` page (notes, remove, total), NavBar cart badge. Toast dropped (the stepper + bar are the feedback). Needs manual check.
- `TODO` Error state (`error.tsx`) once data comes from a real API; loading state likewise
- `DONE` Sandwich photos (owner)
- `TODO` Real meal/size prices (dashboard)
- `DONE` Share a dish on WhatsApp (circle beside "أضف") + a generated preview image per item (PR #21–#22)
- `DONE` QR codes: per-table links pre-fill the table at checkout (3 h), printable sheets per branch + a menu QR (dashboard `/dashboard/qr` since D6c; codes hold the short link `/t/<branch>/<n>`). Printing waits for the domain
- `DONE` Polish from owner testing (PR #24): compact rows (~5 per phone screen), one-row sticky bar, 4-per-row category cards, big price on item details, items without ingredients (drinks), rounded full photos (`imageStyle`)

## Phase 4 — Cart & WhatsApp checkout — `DONE` (real table data and tests pending)
Deliverable: end-to-end order sent to WhatsApp.
- `DONE` Cart store + NavBar badge + line totals/subtotal in `lib/cart` (`feat/cart`)
- `DONE` (`feat/checkout`, needs manual check on a phone with WhatsApp) Order type on `/cart`: **delivery** (name, phone, detailed address, +150 delivery fee, → +963930539614) or **table** (branch + table number, → the branch's WhatsApp; both branches +963980785608 for now). Fee, table counts and numbers editable from the dashboard. Later: table QR `/menu?branch=…&table=…` pre-fills.
- `DONE` Delivery fee + order total in `lib/order`, native form validation (Syrian mobile check)
- `DONE` WhatsApp message builder (`buildOrderMessage`: editable greeting/closing, fixed body) → `wa.me`; thank-you panel; cart emptied on send with a restore (PR #17)
- `DONE` Checkout straight from the menu (bottom sheet, PR #18); cart as a popup over any page (PR #19)
- `DONE` Table QR pre-fill (`?branch=…&table=…`); sending forgets the table (PR #24)
- `DONE` Order number in the message, `#DDMM-HHMM-XX` in the restaurant's time zone (PR #24). Counting orders: cashier searches WhatsApp for `#DDMM` (no backend)
- `TODO` Real table counts, separate branch numbers (owner: same number for now)
- `TODO` Propose unit tests for the `lib/` functions (approval for a test runner)

## Phase 5 — Home page sections — `IN PROGRESS`
Deliverable: a complete marketing home page. All sections are Server Components.
- `DONE` Best sellers section (`BestSellers` → reusable `ui/Slider` + `menu/ProductCard`): 3 cards from md with a larger center, 1 on mobile, loops, gentle slide/fade, reduced motion respected. Needs manual check on real devices.
- `DONE` About section (`#about`): content via `getAboutContent()` (dashboard-ready), shared `SectionTitle`/`Badge`/`HighlightedText`. Key benefits stay in the hero. Needs manual check.
- Order agreed with the owner: About → Offers → Reviews → Footer
- `IN PROGRESS` Offers section (`#offers`, `getOffersContent()`, `OfferCard` in the shared Slider, section/offer on-off flags for the dashboard). Waiting for offer images and real prices; needs manual check.
- `DONE` Customer reviews (`#reviews`): WhatsApp-style `ReviewCard` in the shared Slider, `getReviewsContent()` with on/off flags. Mock reviews; needs manual check.
- `DONE` Footer: location (map link when available), opening hours, contact (call + WhatsApp), quick links, copyright + Tfaddal Menu credit. Needs manual check.
- `DONE` Nav anchors (`#about` in About, `#location` / `#contact` in the Footer); JSON-LD `Restaurant` schema (SEO baseline)

## Phase 6 — Production hero motion — `DONE`
Deliverable: a smooth, accessible spit rotation with a static fallback.
- `DONE` Approach B chosen (three.js lathe from one photo, owner 2026-10-31)
- `DONE` `components/motion/` (`HeroSpit`, `spitScene`, `useSpinSession`): photo first, lazy three.js, reduced-motion / low-memory / WebGL-error fallback
- `DONE` `HeroImageSequence` replaced; `/lab/rotation` kept (dev-only) for tuning
- `TODO` Real-phone performance check on a mid-range Android

## Phase 7 — Dashboard prototype — `IN PROGRESS` (D0–D6 done; D7 next)
Deliverable: a browser-local CRUD demo with preview, ready to switch to the Laravel API. Plan and phases: [DASHBOARD_PLAN.md](DASHBOARD_PLAN.md).
- `DONE` (D0, PR #25) `/dashboard` (noindex, prototype notice), login + 7-day session + `proxy.ts`, error model + messages (`/lab/errors`), home tiles
- `DONE` (D1, PR #25) Prices, availability and best-seller flags from the product list, with undo; repository + browser draft; "رجّع البيانات الأصلية" (reset to demo data)
- `DONE` (D2–D6, PRs #27–#36) Product form, categories, photos, offers, banner, best-seller order, hero + About, reviews, restaurant info, ordering, table QR codes; live previews; «ميّز» highlight button; review answer ≤ 220 with a counter; section on/off switches
- `TODO` (D7) API readiness: `apiFetch`, `apiRepository`, public `error.tsx` / `loading.tsx`, then switch one area at a time once it works on the Laravel staging (API-CONTRACT §7)

## Phase 8 — Launch readiness — `TODO`
- `DONE` OG images (site + per item); `TODO` per-page SEO review and a Lighthouse pass (performance, accessibility, SEO)
- `TODO` Cross-device QA (iOS Safari, Android Chrome, desktop), RTL review
- `TODO` Final content and assets; domain (hosting chosen: Vercel), then print the table QR codes
- `TODO` Google Search Console: verify the domain, submit `sitemap.xml`
- `TODO` Second-brand smoke test: swap config, theme, and data, and confirm that no component changes are needed

---

## Deferred (not in the MVP; do not implement)
- Backend, database and server persistence **in this repo** (the Laravel API is built in a separate repo by the backend developer; contract: [API-CONTRACT.md](API-CONTRACT.md))
- Multiple dashboard users and roles
- Online payments
- Order management or tracking
- SaaS or runtime multi-tenancy
- Burger and pizza hero motions (only when such a brand is onboarded)
