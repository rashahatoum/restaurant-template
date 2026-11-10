# API Contract — DRAFT for discussion

> **Status: DRAFT (2026-11-03), not agreed.** Written by the frontend as a starting point for the Laravel backend developer. Everything here can change; the frontend adapts in `src/services/*` and the dashboard repository, so components don't change.
> Context: the backend is **Laravel** with its own database (owner, 2026-11-03). Frontend plan: [DASHBOARD_PLAN.md](DASHBOARD_PLAN.md) §5.

## 1. How the frontend calls the API

- **Server to server.** The browser never calls Laravel directly. Next.js (on Vercel) calls the API from Server Components (public reads) and Server Actions (dashboard writes). So: **no CORS needed**, and the auth token stays in an `httpOnly` cookie on the Next.js side.
- Public reads are cached by Next.js; after a dashboard write, Next.js refreshes the affected pages itself (no webhook needed at first).
- Every request sends `Accept: application/json` and `Accept-Language: ar`.

## 2. Conventions (proposals, backend decides)

| Topic | Proposal | Why |
|---|---|---|
| Base URL | `/api/v1` | Versioned |
| Auth | Laravel **Sanctum personal access tokens** (`Authorization: Bearer …`) | Server-to-server, no cookie-domain or CSRF setup |
| JSON keys | camelCase, matching `src/types/` (snake_case is fine too: the frontend maps it in one place) | Least mapping |
| Money | Integers in SYP (`price: 250`) | No decimals in SYP |
| Dates | ISO 8601 (`2026-11-03T14:32:00+03:00`) | |
| Ids | Backend ids for records, **plus a unique Latin `slug` for products and offers** | `/menu/<slug>` is the public URL (SEO, shared links). Categories also need a stable slug (menu anchors `#category-<slug>`). **Branch ids are printed in the table QR codes** (`/t/<branchId>/<n>`): keep `qanawat-road` and `al-mehwari` |
| Images | `POST` multipart upload returns a public URL; records store the URL | Next.js `<Image>` needs the image host allowed in `next.config` |
| Ordering of lists | An integer `order` field + a "reorder" endpoint taking the ids in order | Up/down buttons in the dashboard |
| Errors | Laravel defaults (§5), messages in Arabic | Shown to the owner as is |

## 3. Public endpoints (no auth)

What the website needs. Shapes = the TypeScript types in `src/types/` (fields listed in ARCHITECTURE §5 / §8).

| Method | Path | Returns | Frontend function | Rules (today in `services/`) |
|---|---|---|---|---|
| GET | `/menu` | categories in order, each with its products (sizes included) | `getMenu`, `getMenuItem`, `getBestSellers`, `getCartCatalog` | Empty categories left out; unavailable products **included** (shown dimmed) |
| GET | `/offers` | section texts + active offers, or `null` when the section is off | `getOffersContent` | Only `isActive` offers |
| GET | `/banners` | active menu banner slides in order | `getMenuBanners` | |
| GET | `/reviews` | section texts + visible reviews, or `null` when off | `getReviewsContent` | Only `isVisible` |
| GET | `/hero` | headline, badge, button labels, 3 features | `getHeroContent` | |
| GET | `/about` | About content | `getAboutContent` | |
| GET | `/site-info` | tagline, phones, branches, hours, social links | `getSiteInfo` | |
| GET | `/ordering` | delivery, dine-in branches (enabled only), message texts, thank-you text | `getOrderingOptions` | Disabled types/branches left out |

A single `GET /site` returning all of it is also fine; the frontend can split it.

## 4. Dashboard endpoints (auth required)

### Auth

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }` | `{ token, user: { name } }`; `422` on wrong credentials (one generic message), `429` after too many tries |
| POST | `/auth/logout` | | `204` |
| GET | `/auth/me` | | `{ name }` (checks the token is still valid) |

### Content management

Under `/admin/…`. Reads return **everything**, hidden items included (the dashboard shows them).

| Resource | Endpoints | Notes |
|---|---|---|
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}`, `POST /admin/categories/reorder` | Delete refused (`409`) while it has products |
| Products | `GET/POST /admin/products`, `PATCH/DELETE /admin/products/{id}` | `PATCH` accepts partial bodies: the list changes only `price`, `isAvailable` or `isBestSeller`. Sizes (`optionGroups`) nested in the product |
| Best-seller order | `POST /admin/best-sellers/reorder` | Ids in slider order |
| Best sellers | `PATCH /admin/products/{id}` (`isBestSeller`), `POST /admin/best-sellers/reorder` (ids in order) | `Product.bestSellerOrder` (1…n, best sellers only); the public products / best-sellers GET returns them in that order |
| Offers | `GET/POST /admin/offers`, `PATCH/DELETE /admin/offers/{id}`, `POST /admin/offers/reorder`, `PATCH /admin/offers-section` | Section: `isEnabled`, eyebrow, title (`**marked**` part kept as text), menu card image; partial PATCH. Offer: title, items[], freeItem, price, image, imageStyle? (`cutout`/`photo`), badge?, isActive. 422 keys: `title`, `items`, `freeItem`, `price`, `image`, `badge`, `eyebrow` |
| Banners | `GET/POST /admin/banners`, `PATCH/DELETE /admin/banners/{id}`, `POST /admin/banners/reorder` | Slide: eyebrow?, title (≤ 2 lines), image {src, alt}, action? { label, target: { kind: `offers` } \| { kind: `category`, categoryId } \| { kind: `product`, productId } }, isActive. Store the target ids, not a link; the public GET may return the resolved `href` and drop buttons whose target is gone. 422 keys: `eyebrow`, `title`, `image`, `action.label`, `action.target` |
| Reviews | `GET/POST /admin/reviews`, `PATCH/DELETE /admin/reviews/{id}`, `POST /admin/reviews/reorder`, `PATCH /admin/reviews-section` | Section (partial PATCH): `isEnabled`, eyebrow, title (`**marked**` part), defaultQuestion (≤ 120). Review: customerName (first name, ≤ 20), question? (≤ 120; empty = the default one), answer (≤ 220 without `**`, several `**marked**` parts), time? (display text such as `9:41 م`, ≤ 12), isVisible. 422 keys: `eyebrow`, `title`, `defaultQuestion`, `customerName`, `question`, `answer`, `time` |
| Hero | `GET/PUT /admin/hero` | Whole `HeroContent`: badge? (≤ 24), headline (≤ 32), primaryActionLabel / secondaryActionLabel (≤ 14), features: exactly 3 × { label (≤ 28), icon: `fresh`\|`fire`\|`quality`\|`delivery`\|`fast`\|`heart` }. Button links are not stored (per deployment). 422 keys: `badge`, `headline`, `primaryActionLabel`, `secondaryActionLabel`, `features`, `features.<i>.label`, `features.<i>.icon` |
| About | `GET/PUT /admin/about` | Whole `AboutContent`: eyebrow (≤ 40), title (≤ 40, one `**marked**` part), paragraphs 1–4 (≤ 320 each, several `**marked**` parts), closing (≤ 120, may have marks), image { src, alt }, badge? (≤ 24). Lengths count the text without `**`; an odd number of `**` is refused. 422 keys: `eyebrow`, `title`, `paragraphs`, `paragraphs.<i>`, `closing`, `image`, `badge` |
| Site info | `GET/PUT /admin/site-info` | Whole `SiteInfo`: tagline (≤ 120, ≤ 3 lines), phones (≤ 10, at least one without branch) { id, number `+963…` (8–9 digits after 963), hasWhatsApp, branchId? } (new ones sent with `id: ""`; `branchId` = the branch's floor staff number, not public: the public site-info GET should leave those out or the frontend filters them), branches 1–6 { id, name ≤ 30, address ≤ 80, mapUrl? https } (same for new ids), openingHours? + openingHoursSchema? (`["Mo-Su HH:MM-HH:MM"]`, written together), socialLinks? [{ platform: `instagram`\|`facebook`\|`threads`\|`tiktok`, url on that platform's domain }]. On save the backend should drop the dine-in settings and staff phones of deleted branches, and answer `409` when delivery (its `phoneId`) or a branch with tables (its branch phones) would be left without a WhatsApp number. 422 keys: `tagline`, `phones`, `phones.<i>.number`, `branches`, `branches.<i>.name` / `.address` / `.mapUrl`, `openingHours`, `socialLinks.<i>.url` |
| Ordering | `GET/PUT /admin/ordering` | Full `OrderingSettings`, including disabled branches. `delivery.phoneId` points at a restaurant phone; table orders go to the branch's WhatsApp phone (no number stored here). The public `/ordering` GET returns the resolved numbers. PUT rules: `delivery.fee` integer ≥ 0; delivery on → `phoneId` is a restaurant phone (no `branchId`) with WhatsApp; `dineIn.branches` each an existing branch once, `tableCount` 0–99 (≥ 1 when on), on → the branch has a WhatsApp phone; `dineIn.isEnabled` → at least one branch on; `message.greeting` 1–120, `message.closing` ≤ 200, `thankYou` 1–240, only `{restaurant}` / `{name}` placeholders. 422 keys: `delivery.fee`, `delivery.phoneId`, `dineIn`, `dineIn.branches.<i>.tableCount` / `.isEnabled`, `message.greeting`, `message.closing`, `thankYou` |
| Images | `POST /admin/uploads` (multipart `image`) | Returns `{ url, width, height }`; max size to agree (proposal 5 MB); WebP/PNG/JPG |

Writes return the saved record, so the dashboard shows exactly what was stored.

## 5. Errors

Laravel's default JSON, which the frontend turns into one `AppError` (DASHBOARD_PLAN §5.3):

| Status | Body | Shown as |
|---|---|---|
| 422 | `{ "message": "…", "errors": { "price": ["السعر لازم يكون رقم أكبر من صفر"] } }` | Under each field. Field keys = the request's field names (nested: `optionGroups.0.options.1.priceDelta`) |
| 401 | `{ "message": "Unauthenticated." }` | "Session ended" → login |
| 403 | | "No permission" |
| 404 | | "This item no longer exists" |
| 409 | `{ "message": "…" }` | Conflict (e.g. category still has products; or someone else edited it) |
| 413 | | "Image too large" |
| 429 | | "Too many tries, wait a minute" |
| 5xx | | "Something went wrong on our side" + retry |

**Request to the backend:** Arabic validation messages (`lang/ar`, chosen by `Accept-Language: ar`). If a message comes back in English, the frontend falls back to its own Arabic text for that field.

## 6. Out of scope for now

Orders (they go to WhatsApp; nothing is stored), order counting/analytics, payments, customer accounts, multiple restaurants.

## 7. Questions for the backend developer

1. Sanctum tokens server-to-server OK? Token lifetime (the dashboard login lasts 7 days)?
2. camelCase or snake_case?
3. Slugs: generated from the Arabic name (transliteration) or typed by the owner?
4. Where are images stored and served from (host for `next.config`)?
5. Arabic validation messages available?
6. Order of delivery: which endpoints first? (Suggestion: auth + `/menu` + products, then the rest.)
