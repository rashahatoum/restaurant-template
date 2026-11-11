# Changelog

Significant changes only. Small styling tweaks are not recorded.

## 2026-11-10 — Dashboard D6c: table QR codes (PR #36, merged)
- Short link in the codes: `/t/<branchId>/<n>` → 307 to `/menu?branch=…&table=…` (`next.config` redirect).
- `/dashboard/qr`: per branch with tables on, print all tables or a range (one damaged card, new tables); branches with tables off say why; menu code; warning while the site has no domain.
- `/dashboard/qr/print`: A4 pages with server-made SVG codes, 2 table cards per page (cut in half → A5), the menu code as a full-page poster; only the sheets print. Home tile «أكواد QR».
- `qrcode` moved to dependencies (server only); `scripts/table-qr.mjs` and `npm run qr` removed.

## 2026-11-10 — Dashboard D6b: ordering settings (PR #35, merged)
- `/dashboard/ordering`: delivery (switch, fee, number picked from the restaurant's WhatsApp numbers), tables (overall switch; per branch: switch and table count, orders go to the branch's floor staff number, a branch without one can't be switched on), message texts (greeting, closing, thank-you) with «اسم المطعم» / «اسم الزبون» buttons.
- Live WhatsApp message preview built with the real `lib/order.buildOrderMessage` on a sample order from the menu, plus the thank-you text.
- Home tile «الطلب والتوصيل» now links here (all tiles are live).

## 2026-11-08 — Dashboard D6a: restaurant info (PR #34, merged)
- `/dashboard/info`: tagline, social links, restaurant numbers (Syrian format, Arabic digits), branches with map links and their own floor staff number (receives table orders, not shown on the site), opening hours from two clock times.
- Ordering points at phones by id (delivery phone; tables → the branch's WhatsApp number), so an edited number follows everywhere.
- Footer: social icons (Instagram, Facebook, Threads, TikTok) under the logo and tagline.

## 2026-11-08 — Dashboard D5b: reviews (PR #33, merged)
- `/dashboard/reviews`: section (on/off, titles, default question), reviews (add, edit, delete, shown/hidden with undo, reorder) with the WhatsApp card as a live preview; time picked from a clock.

## 2026-11-08 — Dashboard D5a: hero + «من نحن» (PR #32, merged)
- Hero texts moved from the config to content (`getHeroContent`); `/dashboard/home-content` edits the hero (texts, buttons, three features with an icon picker) and «من نحن» (titles, 1–4 paragraphs with several highlights, closing, photo, badge).

## 2026-11-07 — Dashboard D4c: best-seller order (PR #31, merged)
- `/dashboard/best-sellers`: choose and order the home "الأكثر مبيعاً" slider (add from a list, remove with undo back in place, animated moves).

## 2026-11-07 — Dashboard D4b: menu banner (PR #30, merged)
- Banner slides: add, edit, delete, on/off, reorder, live preview; the button's destination is picked from a list (offers, a category, a product) and hides by itself when the destination is gone.

## 2026-11-07 — Dashboard D4a: offers (PR #29, merged)
- Offers section (on/off, titles with a «ميّز» button, menu card photo) and offers (add, edit, delete from the list or the form, on/off, reorder) with a live card preview.
- Photo type (cut-out / full photo with rounded corners) is detected automatically for products and offers; no choice shown.

## 2026-11-07 — Dashboard D3: photos (PR #28, merged)
- Upload photos for products and category cards: compressed to WebP in the browser, cut-out detection, stored in IndexedDB until the Laravel upload.

## 2026-11-06 — Dashboard D2: product form + categories (PR #27, merged)
- D2a (`55bca83`): add / edit / delete products with a live preview (sizes switch, cart untouched), full price per size, back to the tab with a toast.
- D2b (`4a5c5fc`): categories: add, rename in place, reorder, delete when empty.

## 2026-11-06 — Server-first refactor (PR #26, merged)
- Owner rule: `"use client"` on the smallest interactive element (CLAUDE.md, guidelines).
- NavBar → Server Component with five client islands; RevealText → server + `RevealOnView`.
- `restaurantConfig` no longer shipped to the browser (`config/currency.ts`, `OrderingOptions.restaurantName/timeZone`).

## 2026-11-03 — Dashboard D0 + D1 (PR #25, merged)
- Laravel backend confirmed (separate developer): PROJECT_REQUIREMENTS, CLAUDE.md, DASHBOARD_PLAN v2, API-CONTRACT draft updated.
- D0 (`cd207b0`): `/dashboard` with login (env-var account), signed 7-day cookie, `src/proxy.ts`, error model (`AppError`, Laravel mapping) + designed messages (`/lab/errors`), Tfaddal Menu logo, home tiles.
- D1 (`d962d61`): `/dashboard/menu` quick edits (price, available, best seller) with undo; `repository` seam + browser draft; reset to original data.

## 2026-11-03 — Menu and ordering polish (PR #24, `feat/order-polish`)
- Sending an order also forgets the table (restored with the cart).
- Items without ingredients (drinks): mock "مشروبات" + Pepsi; `Product.imageStyle: "photo"` rounds full photos.
- Item page: big price right under the photo, then size, share and add; description under the name.
- Menu: compact grid rows (~5 per phone screen, whole row links), one-row sticky search bar, 4/6 category cards per row.
- Home: tighter section spacing.
- WhatsApp message starts with `رقم الطلب: #DDMM-HHMM-XX` (restaurant time zone).

## 2026-11-02 — Table QR codes + dev loop fix (PR #23, `feat/table-qr`)
- `/menu?branch=<id>&table=<n>` remembers the table for 3 h (`TableWelcome`, `useTableSession`), cleans the URL, greets "طاولة N · branch"; checkout starts on "طاولة" with branch and number picked.
- `npm run qr -- <url>` (`scripts/table-qr.mjs`, devDependency `qrcode`): A4 sheets per branch + a menu QR in git-ignored `qr-codes/`.
- Fix: `@modal/[...catchAll]` sent `next dev` into a reload loop on `/menu/<id>`; replaced by a null `@modal/menu/page.tsx`.

## 2026-11-02 — Share on WhatsApp + per-item preview images (PR #21–#22, `feat/share-item`)
- Green WhatsApp circle beside "أضف" on item details (labeled pill from md): `wa.me/?text=` with the dish and its link.
- `menu/[itemId]/opengraph-image.tsx`: dish on the dark brand background + logo, 1200×630 JPG, built with `sharp` (declared dependency; `ImageResponse` couldn't draw WebP). Site share image is now a crop of the About photo.
- "عرض الكل" moved under the section titles (`SectionTitle` `action`).

## 2026-11-02 — SEO baseline (PR #20, `feat/seo-baseline`)
- `metadataBase` from `NEXT_PUBLIC_SITE_URL`, `lib/seo` `pageMetadata()` (canonical + full Open Graph per page), icons, share image, `sitemap.ts`, `robots.ts`, Restaurant JSON-LD per branch (0 errors on validator.schema.org).

## 2026-11-01/02 — Ordering UX from owner testing (PR #17–#19)
- Cart empties when WhatsApp opens, with "ما بعتّ؟ رجّعلي السلة" (`useOrderSent`).
- "أكّد الطلب" bottom sheet straight from the menu's cart bar (`BottomSheet`, `CheckoutSheet`).
- Cart is a popup over any page (`@modal/(.)cart`, `RouteSheet`); `/cart` stays a page on direct visit; "عودة للقائمة" beside "سلتك".
- Item details: photo and labels instant, only the arrows draw (~1.2 s instead of ~2.5 s).
- "تعرّف علينا" replaces "اطلب الآن" on `/menu`; "شوف المكونات" hints on cards.

## 2026-11-01 — Hero + reviews polish (`feat/hero-reviews-polish`)
- Hero features are a glass card (blurred dark fill, hairline border, dividers, icons in soft orange discs, bolder labels), readable over the spit on phones. Larger name on phones (3.5rem), a little more spacing. md+: the spit is nudged toward the text (`rtl:translate-x-[14%]`; the photo is wider than its column, so edge alignment would push it the wrong way). Checked at 390×844, 1280×800, 1920×1080.

## 2026-11-01 — NavBar redesign (`feat/navbar`, on top of `feat/hero-spit`; both merged in PR #14)
- Fixed header: see-through gradient over the page top, solid + blur + hairline and 80 → 64px once scrolled (passive scroll listener), so menu and cart are always reachable. `scroll-padding-top: 72px` on `<html>` keeps in-page jumps below it; the menu's sticky bar now sticks at `top-64` and `pinBarToTop` stops under the header.
- Desktop: text-only links (icons removed) with an orange underline on hover and for the current page (`aria-current`; in-page anchors are never "current"), 44px round cart button with badge, "اطلب الآن".
- Phones: logo + 44px round cart and menu buttons. Full-screen menu redone: logo + ✕ row (focus goes to ✕), five large display-font links with dividers and arrows (staggered `rise-in`, current page in orange), then a full-width "اطلب الآن", WhatsApp + call buttons and opening hours (`getNavContact()` in services/content, passed from `(site)/layout` and `not-found`). Dark background with a clipped warm glow; the old spit photo `nav-mobile-bg.webp` and `navbar.mobileBackground` / link `icon` config removed.
- Checked in headless Edge at 390×844 and 1280×800 (top, scrolled, /menu, menu open).
- Owner: hero on phones back to the original composition: the spit is full screen height on the end side with half of it off screen (`inset-e-[-33dvh]`), turning behind the vertically centered text (the corner layout and 720px minimum were dropped).
- After closing the mobile menu by tap, focus returns to the menu button without a focus ring (blurred); closing with Escape keeps the ring for keyboard users.

## 2026-10-31 — Hero spit, step 2: in production (`feat/hero-spit`)
- `components/motion/`: `spitScene.ts` (lathe + texture from one photo, shading evened out, outline mask; three passed in), `useSpinSession.ts` (clock-timed spin session), `HeroSpit.tsx` (client). The lab now uses the same modules (its own `useSpin`/`spit` removed).
- `HeroSpit`: next/image photo first (`preload`, LCP); on idle, `import("three")` + the scene, built from the photo's already-downloaded `currentSrc` (no second download, same for the mask); 3D fades in, the photo fades out, one spin; hover (mouse) / tap spins again. Stays a photo under reduced motion, `deviceMemory ≤ 2`, or any WebGL/load error.
- Config `hero.spit` {image, motion} with the owner's timing (30°/s, 1 / 4 / 2.5 s).
- Checked on the dev server (headless Edge, 1280×800 and 390×844): 3D replaces the photo, no console errors.
- Design pass (owner approved): new dark backdrop from the owner (`hero/hero-bg.webp` 1672×941, `hero-bg-mobile.webp` 941×1672; glow lower-left behind the spit, text side dark) via `getImageProps` + `<picture>` (art direction, one download; `hero.backdrop` in config; `hero.background` stays for the menu banner). md+: spit `min(84dvh, 100dvh − 140px)` tall, centered below the NavBar (pole no longer cut). Warm radial glow behind the spit. Phones: text sits high (`pt-120`), a 50dvh spit fills the lower end-side corner; the hero is at least 720px tall so short phones scroll a little instead of covering the text with the spit. Checked at 1280×800, 390×844, 360×640.
- Owner: on md+ the spit fills the full screen height from the very top, behind the see-through NavBar (`md:h-dvh`), as the old hero did.
- Short screens (`short:` custom variant = max-height 760px, in globals.css): smaller hero name and more top padding on md+, so the name no longer touches the NavBar (checked at 1352×624; 1440×900 unchanged).

## 2026-10-31 — Hero spit, step 1: cleanup (`feat/hero-spit`)
- Owner: rebuild the hero spit from a new photo with lab approach B (three.js lathe), approved for production use. Removed `HeroImageSequence` (and its lint warning), the 18 `shawarma-sequence` frames (~5 MB), unused `shawrma-hero.webp`, lab approaches A (frames) and C (video), `/lab/scroll` + `ScrollSequence`, and `hero.media` from the config/types. The hero's spit slot is empty on this branch until the new motion lands.
- Lab now points at `/assets/imgs/hero/shawarma-spit.png` (single photo, owner to supply).
- Motion brief (owner): the whole photo turns, meat and metal pole together, to the right; slow and natural; eases to a stop by itself after a sensible time; hover or tap spins it again (one session, then it stops even if the pointer stays).
- Lab rebuilt on the owner's photo (`hero/shawarma-spit.webp`, 408×612: fine for the lab, a ≥1000×1500 version is needed for production): the lathe covers the whole silhouette (pole, flange and meat) read from the alpha; the front ±60° slice repeats 3× around with 15° cross-fades (mirroring looked like a kaleidoscope). `useSpin` is now a spin session (speed up → turn → slow to a stop; restart continues from the current speed; nothing renders while idle) timed by the clock, not by frames (a slow device would otherwise stretch it). Sliders: speed, speed-up, turning, slow-down; "Spin again" button. Verified in headless Edge (WebGL via SwiftShader): turns, stops on time, no WebGL error.
- New photo from the owner: `hero/shawarma_transparent.webp` (1024×1536, 857 KB); the lab uses it, texture width raised to 2048 to keep its detail. The old 408×612 `shawarma-spit.webp` is unused (owner's file, not deleted).
- Owner's timing: 30°/s, 1 s speed-up, 4 s turning, 2.5 s slow-down (lab defaults).
- Realism pass (owner: "not realistic"): the photo's own side shading is measured (brightness by distance from the axis) and evened out of the texture, so dark sides no longer sweep across the front; fixed 3D lights now shade it (warm key from the front-right, less ambient). The canvas is clipped to the photo's real ragged outline (CSS mask; lathe drawn 5% wider). Slice narrowed to ±45° (4 repeats). Limit: one photo means the pattern repeats around; 3–4 side photos of the same spit would give a real texture all round.

## 2026-10-31 — Item details (`feat/product-page`, merged in PR #13)
- `/menu/[itemId]` for every product and active offer (SSG, metadata + OG image, 404 for unknown ids) and an intercepting `@modal/(.)menu/[itemId]` slot in `(site)/layout` that opens the same content in `ui/RouteModal` (native dialog; bottom sheet on phones, centered from md; Escape/✕/backdrop/back button close it).
- `menu/ItemDetails` (server): badge + name, large photo with glow, orange center line and curved arrows drawing down to each ingredient / offer content (+ free item pill), description, size toggle + stepper (`ItemPurchase`), unavailable state. New CSS utilities `arrow-draw`, `rise-in`, `sheet-in` (all off under reduced motion).
- `MenuItemDetails` type + `getMenuItem` / `getMenuItemIds` in `services/menu`.
- Owner review: the modal fills the screen (phones: full screen; md+: up to 1100×860) and the details fit without scrolling (the photo flexes to the height left; description clamped, hidden under 680px tall). The center line is gone: each part has its own arrow, side by side in a fan (3 per row on phones, up to 6 from md); the standalone page is one screen tall too.
- Owner review 2 (reference images): two hand-drawn arrows — a wide sweep with an open V head for parts near the row edges, a wavy curl with a filled head for the middle; parts are plain bold text (gift in orange). The modal has no panel or border: content floats over a darkened, blurred page.
- Owner review 3 (her sketch): arrows now start on the plate's rim, facing their label, and bend down onto it. Photo and labels share a fixed-ratio stage (16:9 from md, 10:13 on phones) sized with container query units (`[container-type:size]`, `cqw/cqh`), so the arrow paths are computed in SVG units; >3 parts on phones stagger over two label rows. The modal closes on any tap outside controls; the browser's dialog border is removed (`border-0`).
- The dish spins and grows in (`dish-in`), then the arrows draw. Verified in headless Edge over CDP at 1280×800 and 390×844: no border, transparent panel over a blurred page, a tap on the photo closes it and returns to `/menu`. (The owner saw an old version from a stale browser tab; Next 16 keeps dev output in `.next/dev`, so `npm run build` beside a running `next dev` is safe.)
- Owner review 5: price + add are back in the focus view; taps on controls don't close it (checked over CDP: "أضف" adds to the cart and the modal stays; a tap elsewhere closes it).
- Owner review 4: the modal shows only the photo and its parts (`ItemDetails variant="focus"`; name sr-only, no glow or description) over the page, which is only blurred (no tint). No close button: any tap or Escape closes it. The dish rises in softly and then floats (`dish-in` + `dish-float`); the modal fades in (`modal-in`, replaces `sheet-in`). The standalone page keeps everything. Labels get a text shadow for contrast.
- Photo and name link to the details from menu rows, home best sellers (whole card) and home offer cards (photo + title; the button still goes to the menu offers).

## 2026-10-31 — Checkout (`feat/checkout`, on top of `feat/cart`, Phase 3 part 3 of 3, merged in PR #12)
- `OrderingSettings` (`types/order`, `data/mock/ordering`, `services/ordering getOrderingOptions`): delivery (150, +963930539614) and dine-in per branch (10 tables each, +963980785608), message greeting/closing and thank-you text with `{restaurant}`/`{name}`.
- `lib/order`: `normalizeSyrianMobile`, `orderTotals`, `fillTemplate`, `buildOrderMessage` (fixed body: type + details, items with size/note, order note, subtotal/delivery/total).
- `cart/CheckoutForm` replaces the cart summary: delivery (name, mobile, detailed address, fee) or table (branch, table number, name — required), totals, "أرسل الطلب عالواتساب" opens `wa.me` to the right number. Thank-you panel with a re-open link; "بلّش طلب جديد" clears the cart (`cartActions.clear`), "رجوع للسلة" keeps it. Nothing typed is stored.

## 2026-10-31 — Cart (`feat/cart`, Phase 3 part 2 of 3)
- Cart store `hooks/useCart` (localStorage `cart:v1` + `useSyncExternalStore`, cross-tab sync), pure logic `lib/cart`, `types/cart`, `services/cart getCartCatalog()` (prices always from the menu; stale lines pruned).
- Shared `ui/QuantityStepper`; menu "+" becomes `− n +` for the selected size. Fixed cart bar on `/menu` (count, total, link). `/cart` page (`noindex`): lines with photo, size, note, stepper, remove, total, empty state; "متابعة الطلب" disabled until `feat/checkout`. NavBar cart icon with a count badge.
- `lib/menu getSingleChoiceGroup` (shared by the menu page and the catalog).
- Owner review: each size chip shows how many of that size are in the cart (corner badge on phones, inline from md); the stepper stays per selected size (a combined count would make "−" ambiguous). No per-size photos (owner agreed: extra dashboard work, barely visible difference). Cart page wording: "عدد الأطعمة الشهية", "العودة لقائمة الطعام".
- Order note ("ملاحظات على الطلب", ≤300 chars) on `/cart`, stored with the cart: storage shape is now `CartState { lines, note }` (`parseCartState`, `useOrderNote`, `cartActions.setOrderNote`). Same `cart:v1` key (never shipped, no migration).

## 2026-10-31 — Menu category cards (`feat/menu-category-cards`, merged in PR #10)
- Emoji removed (owner: looked AI-made). New shared `ui/CategoryCards`: full-photo cards under the banner (3/4/6 per row, wrapping), name over a dark gradient, tinted name-only fallback without a photo.
- `Category.icon` → `Category.image`; `OffersContent.menuCardImage` for the offers card. Owner's photos added (`public/assets/imgs/categories/`: offers, sandwiches, meals, chickens).
- Fallback (owner): without a card photo, the card uses the first item photo in its section (first active offer / first product with a photo), shown whole (`object-contain`, since those are cut-outs) over the tinted card; name-only if there's none.
- The sticky bar's section dropdown only shows once the cards scroll away; on phones it hangs under the search row without shifting the page.

## 2026-10-29 — Menu page (`feat/menu-page`, Phase 3 part 1 of 3, commit 2b52f0c, merged in PR #9)
- Design agreed on a canvas mockup: banner → sticky category chips → horizontal item rows; cart bar and checkout come in `feat/cart` / `feat/checkout`.
- Menu data restructured with the owner: categories سندويشات / وجبات / فروج (10 products). Sandwiches and meals are separate products; the only option is the shawarma sandwich size (عادي / دبل / دبل بخبز السمون, `shortName` for the phone toggle). Extras dropped (they become cart notes). Meal and size prices are placeholders.
- `Product.image` is optional (sandwich photos not made yet → placeholder icon). Dish photos renamed to the meal ids (`*-meal.webp`); best sellers are now the meals + grilled chicken, and `getBestSellers` requires a photo. `getMenu` skips empty categories.
- `MenuBanner` content + `getMenuBanners()` (3 slides reusing offer/dish photos).
- New shared UI: `ui/AutoCarousel` (cross-fade, 5 s, pauses on hover/focus, pause button, no auto-play under reduced motion), `ui/ScrollSpyNav` (sticky chips, anchors + IntersectionObserver). Menu UI: `MenuBannerSlide`, `MenuItemRow` (server), `ItemPurchase` (client: native-radio size toggle, live price, add button not wired yet).
- `/menu` route with metadata and an empty state; root `not-found.tsx` (Arabic, with NavBar/Footer, `noindex`).
- Owner review: smaller "+" on phones (36px). Offers are now the first menu section ("العروض", `#category-offers`, same `getOffersContent()` so it disappears when offers are off); `MenuItemRow` serves products and offers (`details`, `badge`, `freeItem`). Banner offer slides and home offer cards link to `#category-offers`.
- `ScrollSpyNav` keeps the active chip centered in the chip row (scrolls the row only, so many categories stay usable). Added "سندويشة بطاطا" (250, samoon bread); crispy and zinger are in samoon bread too.
- Owner's sandwich photos added (`chicken-shawarma`, `meat-shawarma`, `crispy`, `zinger`, `fries`; transparent webp). Every product now has a photo; the placeholder icon stays for future ones.
- Fixes: `ScrollSpyNav` finds the active chip by its `href` (dropped the `data-chip-id` attribute behind a hydration warning). `AutoCarousel` hover-pause is mouse-only (a tap on touch screens paused it for good) and focus pauses only when keyboard-visible; the menu banner now changes every 3 s (owner's choice).
- Category navigation reworked (sideways-scrolling chips hid categories): an emoji `CategoryGrid` under the banner shows every section; the sticky bar shows the current section with a native-popover list of all sections on phones, wrapping chips from md. `Category.icon` (emoji) added. `ScrollSpyNav` replaced by `useScrollSpy` + `ui/SectionJumpMenu` + `ui/SectionChips`.
- Menu search (`MenuBrowser` + `ui/SearchField` + `lib/search`): searches names, ingredients/offer contents and size names, forgiving Arabic spelling; results replace the sections, with a no-results state. Samoon spelled "سمون" everywhere in the data so searches match.
- Owner review: the category grid and wrapping chips were removed (categories were listed twice); a single section dropdown in the sticky bar serves every screen size. Search is always visible (no icon to open it); ✕/Escape clear it, and the dropdown hides while searching. Smaller banner button on phones, and the text column no longer overlaps the dish.
- The popover dropdown opened at the top of the screen, away from its button: replaced by a native `<select>` (`ui/SectionSelect`) with an empty "اختر التصنيف" option (shown until a section scrolls into view). Search sits on its own row on phones. Theme sets `color-scheme: dark`. Banner slide renamed "فروج الشوارية".

## 2026-10-28 — Footer (`feat/footer`)
- `SiteInfo` content (tagline, phones with WhatsApp flag, branches with optional map link, opening hours, optional social links) via `getSiteInfo()`. Real phones and the two Suwayda branches; hours are a placeholder.
- `components/layout/Footer.tsx` in `(site)/layout`: brand, quick links (from config), `#contact` (call + WhatsApp), `#location` (branches, hours), copyright with a "صُنع بواسطة Tfaddal Menu" credit.
- `config/platform.ts` holds the product name (Tfaddal Menu) and its WhatsApp, separate from the restaurant config. Unused `restaurantConfig.contact` removed.
- Footer styling: orange top line fading at both ends with a blurred glow, larger logo with a primary glow, centered copyright, and a WhatsApp link to Tfaddal Menu next to the credit (pre-filled message naming the restaurant).
- `lib/contact.ts`: `toTelHref`, `toWhatsAppHref` (with optional pre-filled text for checkout), `formatPhone`.
- Footer tweaks: 280px brand column with a 200/240px logo and a tagline that keeps typed line breaks, content-sized columns spread evenly, "أوقات العمل" heading (9 AM–12 AM), one WhatsApp action per number.
- Logo `next/image` dimensions corrected to the real 2172×724 in NavBar and Footer (same displayed size; fixes the aspect-ratio warning).

## 2026-10-28 — Reviews section (`feat/reviews-section`)
- `Review` / `ReviewsContent` types (section on/off, `defaultQuestion`, per-review `isVisible`), 4 mock WhatsApp-style reviews, `getReviewsContent()`.
- Shared `reviews/ReviewCard`: a two-message WhatsApp-like chat in theme colors (restaurant question on the end side, customer reply on the start side), equal heights in the Slider.
- `Reviews` renders after About, reusing `ui/Slider` and `SectionTitle`.

## 2026-10-28 — Offers section (`feat/offers-section`)
- `Offer` / `OffersContent` types, mock offers (4 "buy X, get Y free" offers, placeholder prices), `getOffersContent()` (returns null when the section is off or no offer is active).
- Shared `menu/OfferCard` ("ticket": photo popping out of the top, FREE sticker, perforation, price + action), reused `ui/Slider`. `lib/highlight` gained `toPlainText`. Slider now centers a single slide.
- `Offers` renders between best sellers and About. Offer images (`public/assets/imgs/offers/*.webp`) are not added yet.

## 2026-10-27 — About section (`feat/about-section`)
- Added editable content layer: `types/content.ts` → `data/mock/about.ts` → `services/content.ts` (`getAboutContent`). Text supports `**highlight**` markers (`lib/highlight.ts`, no HTML).
- Shared UI: `ui/SectionTitle` (eyebrow + h2, marked part underlined), `ui/Underline`, `ui/HighlightedText`, `ui/Badge`. BestSellers and Hero now use them.
- `About` section (`#about`) under best sellers: text + quote beside the chef image with a “من قلب السويداء” badge.
- About image is capped (380/520px), with a radial mask fading its edges into an orange glow. The image uses a scroll-driven CSS reveal (`reveal-zoom`, `animation-timeline: view()`). The closing quote uses the shared `ui/RevealText` (client): words fade/unblur in one by one, once, when 60% visible (IntersectionObserver); text stays visible without JS (`@media (scripting: enabled)`) or under reduced motion. (Earlier clip-path and scroll-tied versions were dropped: cut off near the page bottom / too fast to notice.)
- Smooth in-page scrolling (off under reduced motion); `data-scroll-behavior="smooth"` on `<html>` so Next.js disables it on route changes.

## 2026-10-26 — Best sellers section
- Added reusable `components/ui/Slider.tsx` (client, children-based, looping, center card larger from md) and `components/menu/ProductCard.tsx` (server, props-only), plus `lib/format-price.ts` (Latin digits + currency label).
- `BestSellers` (Server Component) renders under the Hero on `/`.
- Dish images moved to `public/assets/imgs/menu/`; zinger description updated to match its image.
- Slider spans the page gutter (slides 28% wide from md, side slides flush with the gutter). Hero bottom fades into the page background; best sellers got an eyebrow, the hero's orange underline, and an ember glow behind the center plate.

## 2026-10-26 — Menu data layer (Phase 2, `feat/data-layer`)
- Added `types/menu.ts`, mock menu (3 categories, 6 products with ingredients and size/extras options), and `services/menu.ts` (`getCategories`, `getMenu`, `getBestSellers`).
- Added `restaurantConfig.currency` (SYP, “ل.س”).
- Cleanup merged to `main` via PRs #2 and #3 (Next.js 16.4.3 now on `main`). `HeroImageSequence` fixes deferred to Phase 6.

## 2026-10-25 — Next.js security patch
- Upgraded `next` and `eslint-config-next` 16.4.0 → 16.4.3 on `fix/next-security-patch` (critical advisories GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr).
- Committed the `CLAUDE.md`/`README.md` rewrite on `lab/spit-animation`; reverted the accidental comment edit in `HeroImageSequence.tsx`.

## 2026-10-25 — Requirements reset & documentation reorganization
- `PROJECT_REQUIREMENTS.md` adopted as the authoritative requirements document.
- Rewrote `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `API-CONTRACT.md` (in English). Added `DEVELOPMENT_GUIDELINES.md`, `PROJECT_STATUS.md`, `CLEANUP_PLAN.md`.
- Archived `PROJECT.md`, `CURRENT-STATE.md`, the original Arabic docs, the old `CLAUDE.md`, the README, and the removed `AGENTS.md` in `archive/2026-10-25-pre-requirements-reset/`.
- `CLAUDE.md` is now self-contained. `README.md` now describes the actual project.
- Audit findings: a critical Next.js 16.4.0 advisory, spacing-scale bugs, NavBar accessibility gaps, broken links, and no data layer. No application code changed.

## 2026-10-07
- Added dev-only motion labs: `/lab/rotation` (crossfaded frames, three.js lathe, video slot) and `/lab/scroll` (scroll-scrubbed sequence). `three` was added and is loaded on demand.
- Upgraded Next.js 16.3.5 → 16.4.0 and fixed the production build (readonly `keywords` tuple in metadata).
- The hero spit now uses `HeroImageSequence` (frame swap with autoplay, hover, and click replay).

## 2026-10-02
- Added a responsive Hero based on the design reference, with content and assets in `restaurantConfig`.
- Rebuilt the first-screen layout with Flex and a shared page gutter. The code later drifted from this; see DECISIONS.
- Lint, type-check, and build passed.

## 2026-09-27
- Added local collaboration instructions (`AGENTS.md`) and created the `.local-docs/` project memory.
- Excluded `AGENTS.md` and `.local-docs/` from git.
