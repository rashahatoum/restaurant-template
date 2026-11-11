# Architecture

> Requirements live in [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md). This file describes **how** the frontend is built: what exists today (§1–§3) and the agreed target (§4–§8).
> Sections marked **Target** do not exist in the codebase yet.

Last verified against the code: 2026-10-28 (branch `feat/reviews-section`).

---

## 1. Tech stack (installed)

| Area | Choice | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router (`src/app`) | 16.4.3 | Patched for the 16.4.0 security advisory. |
| UI | React / React DOM | 19.2.8 | |
| Language | TypeScript `strict` | ^5 | Path alias `@/*` → `src/*` |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` | 4.3.x | Tokens defined in `src/app/globals.css` |
| Icons | `react-icons` | ^5.7 | |
| Fonts | `next/font/google`: Tajawal (body), Playpen Sans Arabic (display) | | Weights 400/500/700/800. Exposed as `--font-tajawal` / `--font-playpen` |
| 3D | `three` (+ `@types/three`) | 0.186 | Used **only** in the dev-only rotation lab, loaded via dynamic `import("three")` |
| Images (build time) | `sharp` | 0.35 | Per-item share images (`menu/[itemId]/opengraph-image.tsx`); same copy Next uses for `next/image` |
| QR | `qrcode` | 1.5 | `lib/qr` on the server only (`/dashboard/qr/print` makes SVG codes); never shipped to the browser. Types: local `types/qrcode.d.ts` |
| Lint | ESLint 9 + `eslint-config-next` (core-web-vitals, typescript) | | |

Not installed: React Three Fiber, Drei, GSAP, any state library, any test runner. Per requirements, each needs a justification before it is added.

## 2. Current file structure

```text
src/
├── app/
│   ├── globals.css              # Tailwind import, tokens, "fire" theme, 1px spacing, smooth scroll, reveal utilities
│   ├── layout.tsx               # <html lang="ar" dir="rtl" data-theme data-scroll-behavior="smooth">, fonts, metadata (metadataBase, default OG, twitter card)
│   ├── icon.png, apple-icon.png # Brand icon (spit glyph on orange), file convention
│   ├── sitemap.ts, robots.ts    # Home, menu, every item; all crawlable but /cart and /lab/
│   ├── not-found.tsx            # Arabic 404 for every unmatched URL (adds NavBar + Footer itself, noindex)
│   ├── (site)/                  # Route group for public pages (not in the URL)
│   │   ├── layout.tsx           # Renders <NavBar /> and <Footer /> for every public route
│   │   ├── page.tsx             # Home: RestaurantJsonLd, Hero → BestSellers → Offers → About → Reviews
│   │   └── menu/page.tsx        # Menu (QR target): banner → sticky bar (search + section dropdown) → offers (if on) → category rows
│   └── lab/                     # DEV-ONLY experiments (notFound() in production)
├── components/
│   ├── layout/NavBar.tsx        # Server: header + links + mobile-menu content; client islands ScrollAwareHeader, NavLink, NavAction, CartLink, MobileMenu
│   ├── layout/Footer.tsx        # Server: brand, quick links, #contact, #location, copyright + platform credit
│   ├── home/                    # Home sections (Server Components, fetch via services)
│   │   ├── Hero.tsx             #   badge, name, headline, CTAs, features, spit slot, bottom fade
│   │   ├── HeroImageSequence.tsx#   Client: current spit animation (replaced in Phase 6)
│   │   ├── BestSellers.tsx      #   getBestSellers() → Slider of ProductCard, "عرض الكل" → /menu under the title
│   │   ├── Offers.tsx           #   getOffersContent() → Slider of OfferCard, "عرض الكل" → /menu under the title (null = hidden)
│   │   ├── About.tsx            #   getAboutContent() → text, quote (RevealText), photo
│   │   └── Reviews.tsx          #   getReviewsContent() → Slider of ReviewCard (null = hidden)
│   ├── menu/
│   │   ├── ProductCard.tsx      # Server, props only: round plate, name, description, price, optional link (+ DetailsHint)
│   │   ├── OfferCard.tsx        # Server, props only: "ticket" with photo, FREE sticker, perforation, details hint, price + action
│   │   ├── MenuItemRow.tsx      # Server, props only: horizontal row for products and offers (photo or placeholder, name, badge, details, free item, details hint)
│   │   ├── TableWelcome.tsx     # Client: reads a table QR link (?branch=&table=), remembers it, cleans the URL, greets "طاولة N · branch"
│   │   ├── ItemPurchase.tsx     # Client: size toggle (native radios), live price, add button (cart in feat/cart)
│   │   ├── MenuBannerSlide.tsx  # Server, props only: banner slide (text over darkened brand bg, dish on the end side)
│   │   ├── ItemDetails.tsx      # Server: item details (photo, CSS-drawn arrows to each part, description, ItemPurchase, share on WhatsApp); page + modal
│   │   └── MenuBrowser.tsx      # Client: category cards slot + sticky bar (search field + section dropdown shown once the cards scroll away, scroll-spy) + sections or search results; cards and rows arrive as server-rendered nodes
│   ├── reviews/ReviewCard.tsx   # Server, props only: two-message WhatsApp-style chat over an optional tiling wallpaper (dots without one)
│   ├── seo/RestaurantJsonLd.tsx # Server: schema.org Restaurant per branch (getSiteInfo + config), on the home page
│   ├── motion/                  # Production motion
│   │   ├── HeroSpit.tsx         #   Client: photo (LCP) → lazy three.js 3D spit, spin on load/hover/tap, static fallback
│   │   ├── spitScene.ts         #   Lathe + wrapped texture from one transparent photo (three passed in)
│   │   └── useSpinSession.ts    #   Speed up → turn → slow to a stop, clock-timed
│   ├── ui/                      # Shared, brand-agnostic building blocks
│   │   ├── Slider.tsx           #   Client: children-based carousel (3 from md, 1 on mobile, loops)
│   │   ├── AutoCarousel.tsx     #   Client: full-width cross-fade, 5 s auto-play, pause on hover/focus + button, dots
│   │   ├── SearchField.tsx      #   Client: always-visible controlled search input, ✕ / Escape clears
│   │   ├── CategoryCards.tsx    #   Server, props only: wrapping grid of full-photo anchor cards (cut-out fallback image, then name only)
│   │   ├── RouteModal.tsx       #   Client: <dialog> shell for intercepted routes; close = router.back()
│   │   ├── BottomSheet.tsx      #   Client: <dialog> with no URL; bottom sheet on phones, centered from md; open/onClose, optional headerAction
│   │   ├── RouteSheet.tsx       #   Client: BottomSheet for an intercepted route (`path`); close = router.back(); hidden when the URL moves on
│   │   ├── QuantityStepper.tsx  #   Client: "+" alone at 0, "− n +" after; keeps keyboard focus
│   │   ├── SectionSelect.tsx    #   Client: native <select> ("اختر التصنيف" + every section) that scrolls to the pick
│   │   ├── SectionTitle.tsx     #   eyebrow + h2; **marked** part gets the Underline; optional `action` link under it ("عرض الكل")
│   │   ├── ShareOnWhatsApp.tsx  #   Server, props only: wa.me link with a ready message (no number); circle on phones, labeled pill from md
│   │   ├── DetailsHint.tsx      #   small "شوف المكونات ←" / "عرض الكل ←" cue; text only, the parent supplies the link
│   │   ├── Underline.tsx        #   tilted orange underline
│   │   ├── HighlightedText.tsx  #   renders **marked** words in the primary color
│   │   ├── RevealText.tsx       #   Server: splits words; client RevealOnView starts the reveal on view (once)
│   │   └── Badge.tsx            #   small pill label with optional icon
│   └── lab/                     # Motion experiments (dev-only)
├── config/restaurant.ts         # `as const satisfies RestaurantConfig`: identity, nav, SEO, currency, theme, reviews chat wallpaper, hero
├── config/platform.ts           # Product name (Tfaddal Menu) + optional URL; same for every restaurant
├── hooks/useScrollSpy.ts        # Section in view (IntersectionObserver), can be paused
├── hooks/useCart.ts             # Cart store: useCartLines, useIsHydrated, cartActions (localStorage + useSyncExternalStore)
├── types/
│   ├── config.ts                # RestaurantConfig and its key unions
│   ├── navigation.ts            # SectionNavItem (id, label, count)
│   ├── menu.ts                  # Category, Product, option groups, MenuSection
│   └── content.ts               # AboutContent, Offer/OffersContent, Review/ReviewsContent, ContentImage
├── data/mock/                   # Only services/ may import these
│   ├── menu.ts                  #   3 categories (sandwiches, meals, chicken), 11 products, shawarma size group
│   ├── menu-banners.ts          #   3 banner slides (reuse offer/dish photos)
│   ├── offers.ts                #   section + 4 offers
│   ├── about.ts                 #   About copy + photo
│   ├── reviews.ts               #   section + 4 reviews
│   └── site-info.ts             #   tagline, phones, branches, hours (footer) + openingHoursSchema (JSON-LD only)
├── services/
│   ├── menu.ts                  # getCategories, getMenu (skips empty categories), getBestSellers (with photo only), getMenuItem / getMenuItemIds (details pages)
│   ├── cart.ts                  # getCartCatalog: orderable items (products + active offers) with current prices
│   ├── ordering.ts              # getOrderingOptions: enabled order types, branches with names, message texts
│   └── content.ts               # getSiteInfo, getAboutContent, getMenuBanners, getOffersContent, getReviewsContent
└── lib/
    ├── cart.ts                  # productKey/offerKey, lineIdOf, add/setQuantity/setNote/removeLine, priceLines, cartTotals, countItems, formatPieces, parseCartLines (validates storage)
    ├── menu.ts                  # getSingleChoiceGroup (the size group)
    ├── order.ts                 # normalizeSyrianMobile, orderTotals, fillTemplate, buildOrderMessage
    ├── contact.ts               # toTelHref, toWhatsAppHref (optional pre-filled text), toWhatsAppShareHref (no number), formatPhone
    ├── format-price.ts          # 1250 → "1,250 ل.س" (imports config/currency only: used by client code)
    ├── table-session.ts         # tableMenuPath, tableFromSearch, resolveTable, parseTableSession (3 h); store: hooks/useTableSession
    ├── site-url.ts              # siteUrl / absoluteUrl from NEXT_PUBLIC_SITE_URL (localhost fallback)
    ├── seo.ts                   # pageMetadata (title, description, canonical, full openGraph), baseOpenGraph, defaultShareImage
    ├── search.ts                # normalizeArabic (harakat, أإآ→ا, ة→ه, ى/ئ→ي, ؤ→و), matchesQuery (all words)
    └── highlight.ts             # splitHighlights, toPlainText (the **marker** convention)

public/assets/imgs/
├── ahl-alkaram-logo.webp, fire-heroBg.webp, nav-mobile-bg.webp, about.webp
├── reviews/chat-pattern.webp    # Owner-made doodle wallpaper with the logo (800px, 28KB; tiles at 400px)
├── menu/<product-id>.webp       # 500×500, transparent, round wooden boards/plates, every product has one
├── offers/<offer-id>.webp       # 4:3, transparent, 45° composition
├── shawrma-hero.webp            # ⚠ Not referenced (possible Phase 6 static fallback)
└── shawarma-sequence/           # 18 cut-out frames for the hero spit
```

Routes today: `/`, `/menu`, `/menu/[itemId]` (every product + active offer, SSG; intercepted as a modal on client clicks via `(site)/@modal/(.)menu/[itemId]`) and `/cart` (`noindex`; a popup on client clicks via `(site)/@modal/(.)cart`; `@modal/menu/page.tsx` returns null so leaving a popup by link to /menu closes it; never a catch-all, see DECISIONS 2026-11-02) (production), Arabic 404 for anything else, `/lab/rotation` and `/lab/scroll` (development only). All nav links have targets. Menu sections are `#category-<id>` (banner links can jump to them).

## 3. How the current pieces fit

### Rendering boundary

| File | Kind | Why |
|---|---|---|
| `layout.tsx`, `page.tsx`, all `home/*` sections, `ProductCard`, `OfferCard`, `ReviewCard`, `SectionTitle`, `Badge`… | Server | Static content, data fetched via services |
| `NavBar.tsx` | **Server** + islands | Header markup, links and mobile-menu content on the server. Islands: `ScrollAwareHeader` (data-scrolled), `NavLink` (aria-current), `NavAction`, `CartLink` (badge), `MobileMenu` (dialog, server children). Contact props from `getNavContact()` |
| `ui/Slider.tsx` | Client | Active slide state; receives server-rendered cards as `children` |
| `ui/AutoCarousel.tsx` | Client | Timer, pause state, reduced-motion check (`useSyncExternalStore`); slides as `children` |
| `menu/MenuBrowser.tsx` | Client | Search query + scroll-spy shared by the bar and the body. Rows are server-rendered elements passed in props (`node`), so only filtering ships JS; search text is normalized on the server |
| `menu/ItemPurchase.tsx` | Client | Selected size + live price + `QuantityStepper` showing the selected size's cart quantity. The rest of `MenuItemRow` stays server |
| `cart/CartBar.tsx`, `cart/CartView.tsx` | Client | Read the cart store, price it against the server-built catalog (prop) |
| `ui/RevealText.tsx` | Server | Words; `ui/RevealOnView` (client) runs the `IntersectionObserver` || `HeroImageSequence.tsx` | Client | Timers + pointer interaction |
| `lab/**` | Client | Canvas / WebGL / rAF loops |

**Pattern:** a Server section fetches data and maps it to presentational cards, then passes them as `children` to the client `Slider`. Functions can't cross the server→client boundary, elements can, so cards stay server-rendered and only the slider ships JS.

### Configuration vs. content

- **`restaurantConfig`** = per-deployment brand settings that nobody edits at runtime: name, logo, nav links, SEO, contact, currency, theme, hero copy and motion tuning.
- **Content** (`types/content.ts` → `data/mock/*` → `services/content.ts`) = what the owner edits from the dashboard: offers, About, reviews. The menu follows the same path via `services/menu.ts`.
- Rule of thumb: *who changes it?* Deploy-time → config. Owner at runtime → services.

### Theming & layout conventions

- `layout.tsx` sets `data-theme={restaurantConfig.theme}`; `globals.css` maps `[data-theme="fire"]` variables to tokens: `primary`, `background`, `surface`, `foreground`, `muted`, `border`, `font-body`, `font-display`, `spacing-page-gutter`.
- `--spacing: 1px`: `p-16` = 16px. Never append `px` to a class.
- `--spacing-page-gutter: clamp(1.25rem, 6vw, 10rem)` is the single side gutter (`px-page-gutter`) for the nav and every section.
- Home sections use `py-80 md:py-120` and a `SectionTitle`.
- The NavBar header is `fixed` (80px at the top, 64px once scrolled); `<html>` has `scroll-padding-top: 72px` so in-page anchors stop below it. Pages without a hero start with `pt-80`. Sticky bars inside pages stick at `top-64`.
- `/menu` has a sticky bar, so its sections use `scroll-mt-120 md:scroll-mt-80`. No horizontal scrolling: sections are reached through one native `<select>` (opens in place; OS picker on phones). Phones: search row + select row, so sections use `scroll-mt-120`; md+: one row (`md:scroll-mt-80`). Starting a search pins the bar to the top so results sit right under it. The theme sets `color-scheme: dark` so native controls match.

### Text highlight convention

Editable text marks emphasis with `**…**`. `lib/highlight.ts` splits it into plain React elements (never `dangerouslySetInnerHTML`). In titles (`SectionTitle`) the marked part gets the Underline; in body text (`HighlightedText`, `RevealText`) it turns primary-colored. `toPlainText` strips markers for `aria-label`s.

### Motion today

- `Slider`: slides share one grid cell and move by offset with CSS transitions; a wrapped slide fades in (`animate-slider-fade`). Reduced motion → instant.
- `About` photo: CSS scroll-driven reveal (`reveal-zoom`, `animation-timeline: view()`), only under `@supports` and no reduced motion.
- `RevealText`: words fade/unblur in once when 60% visible; hidden only with `@media (scripting: enabled)` and no reduced motion.
- Hero spit: `HeroImageSequence` frame swap (no reduced motion, no fallback). Deferred to Phase 6.

## 4. Target architecture (Target)

Guiding constraints: frontend-first, typed mock data behind a data-access layer, no backend/DB/auth/SaaS. Grow into this structure as features need it.

```text
src/app/
├── (site)/cart/page.tsx                # ✅ Cart review (per-item + order notes) and checkout (delivery/table, details → WhatsApp)
├── (dashboard)/dashboard/              # ✅ D0: own layout (noindex), login/ (public), (protected)/ (session check, shell, home tiles, error.tsx), actions.ts (login/logout)
├── lab/errors                          # ✅ dev-only review of every dashboard error message
src/proxy.ts                            # ✅ Next 16 proxy: cookie check on /dashboard/*
src/lib/auth/                           # ✅ session-token (HMAC, Web Crypto), session (cookie, server-only), paths, login-attempts
src/lib/api/errors.ts                   # ✅ AppError, Result, fromHttpResponse (Laravel errors)
src/services/auth.ts, dashboard.ts      # ✅ authenticate (env account → Laravel later), getDashboardSeed (unfiltered data)
└── sitemap.ts, robots.ts               # ✅ (2026-11-02)
(item details: /menu/[itemId] + @modal intercept, see DECISIONS 2026-10-31; "+" still adds directly)
src/components/
├── layout/Footer.tsx
├── cart/        # ✅ CartBar (cart link → popup + "أكّد الطلب" → CheckoutSheet), CartView layout "page" | "sheet" (popup: @modal/(.)cart in RouteSheet), CheckoutSheet (BottomSheet: summary, CheckoutForm, OrderSentPanel), CartView, CheckoutForm (calls onSent), OrderSentPanel
│                #    send → empty → restore shared via hooks/useOrderSent
├── motion/      # Production hero motion (§7)
└── dashboard/
```

### Reusability model

"Reusable for different restaurant brands" means **one restaurant per deployment**: a new brand swaps `config/restaurant.ts`, mock data, assets, and a `[data-theme]` block. No runtime multi-tenancy. (Still to confirm; see PROJECT_STATUS → Open questions.)

## 5. Data models & data access

### Implemented (`src/types/`)

| Type | Fields | Notes |
|---|---|---|
| `Category` | id, name, order | |
| `Product` | id, categoryId, name, description, ingredients, price, image?, imageStyle?, isBestSeller, isAvailable, optionGroups? | id = slug (in the mock data also the image name; new products get `item-xxxxxxxx` unless the owner sets one, API-CONTRACT §2). Price in whole currency units. No image → placeholder on the menu, excluded from best sellers. `ingredients: []` is valid (drinks: no details line). `imageStyle` "cutout" (default, transparent plate) or "photo" (full photo, rounded corners; also fills its category card when that has no photo) |
| `ProductOptionGroup` / `ProductOption` | id, name, required, maxSelect, options (id, name, shortName?, priceDelta) | **Price-changing choices only** (today: shawarma sandwich size). Extras/requests go in cart notes. Deltas don't depend on each other. `shortName` = compact label for the phone toggle |
| `MenuBanner` | id, eyebrow?, title, image {src, alt}, action? {label, href}, isActive | Menu page banner slide; text is HTML over the photo |
| `MenuSection` | category, products | Returned by `getMenu()` |
| `MenuItemDetails` | id, kind (product/offer), itemKey, name, description?, image?, imageStyle?, price, parts, freeItem?, badge?, isAvailable, options?, optionsLabel? | `getMenuItem(id)` for `/menu/<id>`; product and offer ids share the URL space |
| `OffersContent` | isEnabled, eyebrow, title, offers | Section on/off |
| `Offer` | id, title, items[], freeItem, price, image, badge?, isActive | "Buy X, get Y free" |
| `AboutContent` | eyebrow, title, paragraphs[], closing, image {src, alt}, badge? | |
| `ReviewsContent` | isEnabled, eyebrow, title, defaultQuestion, reviews | Section on/off |
| `Review` | id, customerName, question?, answer, time?, isVisible | Re-typed WhatsApp message; first name only |

### Still candidate

- `RestaurantInfo` (address, map link, phone, WhatsApp, hours, delivery fee): likely stays in config.
### Ordering (`types/order.ts`, implemented)

| Type | Fields | Notes |
|---|---|---|
| `OrderingSettings` | delivery {isEnabled, fee, whatsApp}, dineIn {isEnabled, branches [{branchId, isEnabled, tableCount, whatsApp}]}, message {greeting, closing}, thankYou | Mock `data/mock/ordering.ts` (dashboard-editable) |
| `OrderingOptions` | delivery \| null, dineInBranches [{id, name, tableCount, whatsApp}], message, thankYou | What the checkout form gets (enabled only, names resolved) |
| `OrderDetails` | delivery: name, phone, address · dineIn: name, branchName, tableNumber | Never stored; goes into the WhatsApp message only |

### Cart (`types/cart.ts`, implemented)

| Type | Fields | Notes |
|---|---|---|
| `CartState` | lines, note (order note, ≤300) | The stored object (`cart:v1`), validated by `parseCartState` |
| `CartLine` | itemKey (`product:<id>` / `offer:<id>`), optionId?, quantity (1–99), note? (≤120) | What `localStorage` holds. Same product in two sizes = two lines (`lineId` = `itemKey|optionId`) |
| `CartCatalogItem` / `CartCatalog` | name, image?, price, isAvailable, options? | Built by `services/cart.ts getCartCatalog()` from the menu + active offers, passed to the cart UI |
| `PricedCartLine` | line + lineId, name, image?, optionName?, unitPrice, lineTotal | `lib/cart priceLines()`; lines with a missing/unavailable item or unknown size are dropped (and pruned from storage) |

### Data access rule

```text
UI component  →  services/*  →  data/mock/*   (today)
UI component  →  services/*  →  fetch(API)    (future, same signatures)
```

- Services are **async** functions returning domain types; components never import `data/mock/`.
- **Visibility rules live in services**, not components: `getOffersContent` / `getReviewsContent` return `null` when the section is off or nothing is active/visible; `getBestSellers` filters `isBestSeller && isAvailable && image`; `getMenu` drops empty categories (unavailable products stay, shown as such); `getMenuBanners` returns active slides (empty → no banner). Sections just `return null`.
- No repository classes, DI, or generic CRUD layers until needed.

## 6. State management (Target)

| State | Where | How |
|---|---|---|
| Mobile menu, sliders, option pickers, quantity | Component | `useState` |
| Cart | Client, app-wide | **Implemented** (`hooks/useCart.ts`): a module-level store (no Provider) persisted to `localStorage` key `cart:v1`, read with `useSyncExternalStore` (server snapshot = empty cart → no hydration mismatch), synced across tabs via the `storage` event. Stores **references only** (`itemKey`, `optionId`, quantity, line note) plus the order note; names and prices come from `getCartCatalog()` on every render, so a hand-edited cart can't change prices. Pure logic in `lib/cart.ts`. No library. |
| Checkout form | Component | Native form; no form library unless validation gets complex |
| Dashboard edits | Client, dashboard only | **Implemented (D1):** screens call `lib/dashboard/repository` (async, `Result`); `localRepository` saves a full `DashboardData` snapshot in `localStorage` `dashboard:v1`, read with `useDashboardData(seed)`. Laravel later: `apiRepository` behind the same interface |
| Catalog & content | Server | Services → Server Components |

Pure logic (totals, delivery fee, WhatsApp message) goes in `src/lib/`.

## 7. Motion architecture (Target)

```text
config.hero.motion = { kind: "spit-rotation" | "static" | …, ...options }

<HeroMedia>  (server)
 ├── static <Image preload>                 ← LCP, SEO, no-JS, reduced-motion fallback
 └── <HeroMotion kind=…>  (client, lazy)    ← progressive enhancement over the static image
```

- Engines live in `components/motion/<kind>/`, take props, never read `restaurantConfig`.
- Canvas/CSS first; three.js/R3F only for real 3D; GSAP only for timeline-heavy choreography. Every library needs approval.
- **Open decision:** spit approach A, B, or C (ROADMAP Phase 6).

## 8. Dashboard prototype (Target)

### Principles

- `/dashboard`: `noindex`, labeled as a prototype, behind a login (D0: env-var account, signed 7-day cookie, `proxy.ts` + layout check; Laravel auth later). Pages are thin Server Components; screens are client components. Seam for Laravel: DASHBOARD_PLAN §5.
- Edits are **browser-local overrides** (`localStorage`) on top of mock data; not shared between visitors.
- **Tension:** public pages are server-rendered from services, which can't see `localStorage`. Recommended: a **preview surface** that renders the same presentational components client-side with the overridden data. Pending approval.
- **Preview-ready today:** `ProductCard`, `OfferCard`, `ReviewCard`, `MenuItemRow`, `MenuBannerSlide`, `SectionTitle`, `Badge`, `HighlightedText` take plain props, and `Slider`/`AutoCarousel` take children, so the preview can reuse them unchanged. (`ItemPurchase` layout "row" only works inside `MenuItemRow`'s grid.)
- Detailed plan, phases and open decisions: [DASHBOARD_PLAN.md](DASHBOARD_PLAN.md).

### What the dashboard must edit (inventory)

| Area | Type / service | Editable fields | Flags & rules |
|---|---|---|---|
| Menu categories | `Category` / `services/menu.ts` | add / rename / reorder / delete (any number), photo (full photo, cropped square on the card; optional, falls back to the first product photo in the category) | `id` is a Latin slug that never changes by itself (it's the `#category-<id>` anchor that banners may link to): seeded ones keep their ids, new ones get a neutral `cat-xxxxxxxx` unless the owner sets one in «رابط الصفحة» (API-CONTRACT §2). Empty categories are hidden automatically. Deleting one needs its products moved or deleted first. Any number fits: the native select lists all |
| Menu products | `Product` | add / edit / delete (any number per category): name, description, ingredients (may be empty), price, image (optional) + imageStyle (cut-out or full photo), category, option groups. Order within a category = list order today (add an `order` field when the dashboard needs drag-to-reorder) | `isAvailable` (unavailable = dimmed, no add button); `isBestSeller` (home slider, needs a photo; "الأكثر طلباً" pill on the menu) |
| Size options | `ProductOptionGroup` | option name, short name (phone toggle, ~8 chars), price delta | Price-changing choices only; attach the group to the products that use it (today: chicken/meat shawarma sandwiches) |
| Menu banner | `MenuBanner` / `getMenuBanners` | eyebrow, title (line breaks kept, keep it to 2 short lines), image + alt (transparent dish photo), button label + link | `isActive` per slide; banner hidden if none. Links: `/#offers`, `#category-<id>`, … |
| Ordering | `OrderingSettings` / `services/ordering getOrderingOptions` | delivery on/off, fee (150), WhatsApp; dine-in on/off and per branch: on/off, table count (10 placeholder), WhatsApp; message greeting + closing and the thank-you text (`{restaurant}`, `{name}`) | The message body (customer, items, bill) is fixed. Disabled types/branches are left out; none enabled → "الطلب أونلاين متوقف حالياً" |
| Offers section | `OffersContent` / `getOffersContent` | eyebrow, title (`**underline**`), menu card photo (`menuCardImage`, optional, falls back to the first active offer photo) | `isEnabled` hides the home section **and** the "العروض" menu section/card. Turn off banner slides linking to `#category-offers` too |
| Offers | `Offer` | title, items, freeItem, price, image (4:3 transparent), badge | `isActive` per offer; section hidden if none active |
| About | `AboutContent` / `getAboutContent` | eyebrow, title, paragraphs, closing, image + alt, badge | `**highlight**` in title/paragraphs/closing |
| Reviews section | `ReviewsContent` / `getReviewsContent` | eyebrow, title, defaultQuestion | `isEnabled` hides the whole section |
| Reviews | `Review` | customerName (first name), question (optional), answer, time | `isVisible` per review; answer ≤ ~220 chars (card clamps at 6 lines) |
| Site info (footer) | `SiteInfo` / `getSiteInfo` | tagline (line breaks kept), phones (number in `+963…` format, hasWhatsApp), branches (name, address, mapUrl), openingHours, socialLinks | Each phone shows one action: WhatsApp if `hasWhatsApp`, else a call. Phones also receive WhatsApp orders later; optional fields hide their block when empty |

### Editor details agreed so far

- A **"highlight" button** wraps the selected text in `**…**`; owners never type markers by hand.
- Review reply: character counter with a ~220 limit.
- Image fields must state the expected format: menu 1:1 transparent plate (or a 1:1 full photo with `imageStyle: "photo"`), offers 4:3 transparent, About 4:5 photo, banner = transparent dish (1:1 or 4:3; the brand background is added by the page).
- Prices are whole numbers in `restaurantConfig.currency`; formatting is automatic (`formatPrice`).
- Not editable from the dashboard (config, per deployment): name, logo, theme, currency, time zone, SEO, nav links. Hero copy (incl. the badge) is config today; move it to content if the owner needs to edit it.

## 9. Backend integration

The backend is a **Laravel REST API** in a separate repo (built by the backend developer, hosted on Hostinger); the contract is agreed and amended with the backend build ([API-CONTRACT.md](API-CONTRACT.md), DECISIONS 2026-11-11). Next.js calls it server to server. When an area switches (dashboard Phase D7), only `services/*` and the dashboard repository (`apiRepository`) change; the frontend tasks are listed in API-CONTRACT §7.
