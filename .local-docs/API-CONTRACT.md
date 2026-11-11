# API Contract

> **Status: AGREED (2026-11-11)** between the frontend and the backend developer. It started as the frontend's draft (2026-11-03); the backend's answers and changes were agreed on 2026-11-11 ([DECISIONS](DECISIONS.md) 2026-11-11).
> **Amended 2026-11-11 with the backend build (Phases 1, 3, 4):** see [DECISIONS](DECISIONS.md) 2026-11-11 (contract amendments).
> **Amended 2026-11-11 with the backend's demo server (Phase 5):** see [DECISIONS](DECISIONS.md) 2026-11-11 (demo server).
> **Changing it:** a PR that edits this file, reviewed by the other side, before or together with the code. Never change the API silently.
> Context: the backend is **Laravel** with its own database, in a separate repo, hosted on Hostinger (§6). The frontend adapts in `src/services/*` and the dashboard repository, so components don't change. Frontend plan: [DASHBOARD_PLAN.md](DASHBOARD_PLAN.md) §5. Backend terms used here are explained in §10.

## 1. How the frontend calls the API

- **Server to server.** The browser never calls Laravel directly. Next.js (on Vercel) calls the API from Server Components (public reads) and Server Actions (dashboard writes). So: **no CORS needed**, and the auth token stays in an `httpOnly` cookie on the Next.js side.
- **Base URL:** `https://api.<domain>/api/v1` (server-only env var `API_BASE_URL`). Staging: `api-staging.<domain>`, or a temporary Hostinger subdomain until the domain is bought; the staging URL is sent privately.
- Every request also sends **`X-Frontend-Key`** (server-only env var `FRONTEND_API_KEY`). When the backend's `API_REQUIRE_FRONTEND_KEY` is on (it is on the demo/staging server), a request without the right key gets `403` «ما عندك صلاحية». The health check `/up` stays open.
- Public reads are cached by Next.js; after a dashboard write, Next.js refreshes the affected pages itself (no webhook needed).
- Every request sends **`Accept: application/json`** (required: without it Laravel answers a validation error with a redirect to a web page instead of JSON) and `Accept-Language: ar` (welcome, but the API's language is fixed to Arabic anyway).

## 2. Conventions (agreed 2026-11-11)

| Topic | Agreed | Why |
|---|---|---|
| Base URL | `/api/v1` on `api.<domain>` | Versioned: a breaking change later becomes `/v2` without breaking the live site |
| Auth | Laravel **Sanctum personal access tokens** (`Authorization: Bearer …`), **valid 7 days** (same as the dashboard session) | Server to server: no cookie-domain or CSRF setup between Vercel and Hostinger |
| JSON keys | **camelCase**, exactly the names in `src/types/`. The database uses snake_case; Laravel converts in its API Resources | The frontend's mapping layer stays almost empty |
| Response body | **Not wrapped**: `GET /menu` returns `[…]`, not `{ "data": […] }` | Matches the types directly |
| Optional fields | An empty optional field is **left out** of the response (no key), not sent as `null` | Matches TypeScript's `image?: string` |
| Money | Integers in SYP (`price: 250`) | No decimals in SYP |
| Dates | ISO 8601 (`2026-11-03T14:32:00+03:00`) | |
| Ids | Always **strings** in JSON. Categories, products, offers and branches: their **public slug** is the `id` (seeded records keep their current ids). Sizes, phones, banners and reviews: the **database id as a string** (`"12"`); the mock ids (`regular`, `phone-1`, `samer`, …) don't survive seeding | `/menu/<slug>` is the public URL (SEO, shared links); `#category-<slug>` is the menu anchor. **Branch ids are printed in the table QR codes** (`/t/<branchId>/<n>`): `qanawat-road` and `al-mehwari` are kept |
| Slugs | The create/update bodies of categories, products, offers and branches take an optional **`slug`**: lowercase Latin kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 80 characters, unique. Product and offer slugs are checked **against both tables** (one URL space). Empty or missing **on create** → a neutral id: `cat-xxxxxxxx`, `item-xxxxxxxx`, `offer-xxxxxxxx`, `branch-xxxxxxxx`. Empty or missing **on update** → the slug is kept. The owner sets a readable one in the «رابط الصفحة» field. Seeded records keep their current ids (`chicken-shawarma`, `qanawat-road`, …) | Automatic transliteration was tested on the real menu and rejected (`شاورما جاج` → `shaorma-gag`, `فروج` → `frog`) |
| Nested lists | Saved **by id** (§4.1): never deleted and recreated | Carts, ordering settings and QR codes point at those ids |
| Images | `POST` multipart upload returns a public URL; records store the URL. Host: `api.<domain>` (`/storage/…`), max **5 MB**, WebP / PNG / JPG. An image field accepts **only a URL returned by `POST /admin/uploads`**; anything else → `422` on that field: «الصورة مش من الصور المرفوعة، ارفعها من جديد» | Next.js `<Image>` needs the host in `next.config` (`images.remotePatterns`). No links to other hosts in the records |
| Ordering of lists | An integer `order` field + **`POST …/{id}/move` `{ direction: "up" \| "down" }`**, which returns the whole list in its new order (§4.2) | Matches the repository's `moveX(id, direction)` (up/down buttons) |
| Full save vs partial | **`PUT` = whole record:** a missing optional field is **cleared**. **`PATCH` = partial:** a missing field doesn't change; `null` **removes** an optional field (e.g. `{ "image": null }`). Products now, later offers, banners and reviews: `saveX` → `PUT`; `setXActive` and the section settings → `PATCH` | The dashboard's forms drop `undefined` keys when they serialize, so "missing" is how a form says "empty" |
| Creates | `201` with the saved record | |
| Errors | Laravel defaults (§5), messages **always in Arabic** | Shown to the owner as is |

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
| GET | `/site-info` | tagline, phones, branches, hours, social links | `getSiteInfo` | Branch staff phones left out |
| GET | `/ordering` | delivery, dine-in branches (enabled only), message texts, thank-you text | `getOrderingOptions` | Disabled types/branches left out |

**Kept as separate endpoints** (not one `GET /site`): each read gets its own cache tag in Next.js (e.g. `menu`, `offers`), so a dashboard save only refreshes what changed. Public reads also get a **time-based fallback** (e.g. 1 hour), so a change made directly on the server (a seeder or a manual fix, not through the dashboard) still reaches the site.

**Rate limit:** 300 requests per minute per client on `GET /menu` (and the later public reads). The client is the browser IP when `X-Client-IP` comes with the right `X-Frontend-Key`, otherwise the caller's IP. Over the limit → `429` with `{ "message": "محاولات كتير، جرّب بعد دقيقة" }` and a `Retry-After` header (seconds). Next.js caches the public reads, so its server stays far below this.

## 4. Dashboard endpoints (auth required)

### Auth

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{ username, password }`; optional headers `X-Client-IP`, `X-Frontend-Key` (below) | `{ token, user: { name } }`; the token expires after **7 days**. Wrong credentials → `422` with «اسم المستخدم أو كلمة السر غلط» on `username` and as the top-level `message`. After **5 failed tries per minute** (per username + IP) → `429` «محاولات كتير، جرّب بعد دقيقة» with a `Retry-After` header (seconds to wait) |
| POST | `/auth/logout` | | `204`; the token is deleted on the server |
| GET | `/auth/me` | | `{ name }`; `401` once the token is expired or deleted |

- **Login limit per browser:** the Next.js server (only it) sends `X-Client-IP` (the browser IP, from `x-forwarded-for`) and `X-Frontend-Key` (a shared secret, server-only env var `FRONTEND_API_KEY`, sent privately, never committed). With the right key, the limit counts per browser IP. Without it, the IP is the caller's, and every dashboard login shares Vercel's IP: one person guessing could lock the owner out. Only **failed** tries count, and a success resets them. `X-Frontend-Key` itself is sent on every request (§1); `X-Client-IP` only matters on login and for the public rate limit (§3).
- **Logout must call the API:** the dashboard's logout calls `POST /auth/logout` (it deletes that device's token) before deleting the cookie. Deleting the cookie alone leaves the token valid until it expires.
- **The admin account** is created, and its password changed, on the server with `php artisan admin:create`. Changing the password logs out every device.

### Content management

Under `/admin/…`. Reads return **everything**, hidden items included (the dashboard shows them).

| Resource | Endpoints | Notes |
|---|---|---|
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}`, `POST /admin/categories/{id}/move` | `PATCH` takes `name?`, `slug?`, `image?`: one endpoint for `renameCategory` and `setCategoryImage`; `image: null` removes the photo. Names are unique after trimming and collapsing spaces (`422`: «في قسم بنفس الاسم»). Delete refused while it has products: `409` «ما فيك تحذف قسم فيه أصناف (N). انقلها لقسم تاني أو احذفها أول.» |
| Products | `GET/POST /admin/products`, **`PUT /admin/products/{id}`** (whole product, `saveProduct`), **`PATCH /admin/products/{id}`** (quick change, `updateProduct`), `DELETE /admin/products/{id}` | `PATCH` accepts only `price`, `isAvailable`, `isBestSeller` and `bestSellerOrder`; other fields are ignored. A `PATCH` price that would make a size cost ≤ 0 → `422` on `price`: «في حجم سعره بيصير صفر أو أقل بهالسعر، عدّل الأحجام من صفحة الصنف» (new: the dashboard doesn't check it yet). Sizes (`optionGroups`) nested in the product, saved by id (§4.1). In responses the size group always has `id: "size"`, `required: true`, `maxSelect: 1`; on input those three are ignored and the group's `name` is kept |
| Best sellers | `PATCH /admin/products/{id}` (`isBestSeller`, `bestSellerOrder`), `POST /admin/best-sellers/{id}/move` | `Product.bestSellerOrder` (stored as 1…n, best sellers only); the public products / best-sellers GET returns them in that order. Turning it on puts the product **last**; turning it off renumbers the rest with no gaps. `bestSellerOrder` sent in a `PATCH` may be a fraction: the undo of «شيل من الأكثر مبيعاً» sends the old place minus 0.5 (`undoBestSellerPlace`); it's only used to sort, then renumbered. `POST` also accepts it (the place of a re-created best seller); `PUT` ignores it and keeps the current place. A best seller needs a photo: `422` on `isBestSeller` with `«الأكثر مبيعاً» بدّه صورة للصنف` on `POST`/`PUT`, and `«الأكثر مبيعاً» بدّه صورة للصنف. ضيف صورة أول.` on `PATCH`. Moving a product that isn't a best seller → `409` «هالصنف مش بالأكثر مبيعاً. حدّث الصفحة.» |
| Offers | `GET/POST /admin/offers`, `PATCH/DELETE /admin/offers/{id}`, `POST /admin/offers/{id}/move`, `PATCH /admin/offers-section` | Section: `isEnabled`, eyebrow, title (`**marked**` part kept as text), menu card image; partial PATCH. Offer: title, items[], freeItem, price, image, imageStyle? (`cutout`/`photo`), badge?, isActive. 422 keys: `title`, `items`, `freeItem`, `price`, `image`, `badge`, `eyebrow` |
| Banners | `GET/POST /admin/banners`, `PATCH/DELETE /admin/banners/{id}`, `POST /admin/banners/{id}/move` | Slide: eyebrow?, title (≤ 2 lines), image {src, alt}, action? { label, target: { kind: `offers` } \| { kind: `category`, categoryId } \| { kind: `product`, productId } }, isActive. Store the target ids, not a link; the public GET may return the resolved `href` and drops the button when its target is gone. When the target category or product no longer exists, the admin GET sends its id as `""`, which the dashboard shows as "target gone". 422 keys: `eyebrow`, `title`, `image`, `action.label`, `action.target` |
| Reviews | `GET/POST /admin/reviews`, `PATCH/DELETE /admin/reviews/{id}`, `POST /admin/reviews/{id}/move`, `PATCH /admin/reviews-section` | Section (partial PATCH): `isEnabled`, eyebrow, title (`**marked**` part), defaultQuestion (≤ 120). Review: customerName (first name, ≤ 20), question? (≤ 120; empty = the default one), answer (≤ 220 without `**`, several `**marked**` parts), time? (display text such as `9:41 م`, ≤ 12), isVisible. 422 keys: `eyebrow`, `title`, `defaultQuestion`, `customerName`, `question`, `answer`, `time` |
| Hero | `GET/PUT /admin/hero` | Whole `HeroContent`: badge? (≤ 24), headline (≤ 32), primaryActionLabel / secondaryActionLabel (≤ 14), features: exactly 3 × { label (≤ 28), icon: `fresh`\|`fire`\|`quality`\|`delivery`\|`fast`\|`heart` }. Button links are not stored (per deployment). 422 keys: `badge`, `headline`, `primaryActionLabel`, `secondaryActionLabel`, `features`, `features.<i>.label`, `features.<i>.icon` |
| About | `GET/PUT /admin/about` | Whole `AboutContent`: eyebrow (≤ 40), title (≤ 40, one `**marked**` part), paragraphs 1–4 (≤ 320 each, several `**marked**` parts), closing (≤ 120, may have marks), image { src, alt }, badge? (≤ 24). Lengths count the text without `**`; an odd number of `**` is refused. 422 keys: `eyebrow`, `title`, `paragraphs`, `paragraphs.<i>`, `closing`, `image`, `badge` |
| Site info | `GET/PUT /admin/site-info` | Whole `SiteInfo`: tagline (≤ 120, ≤ 3 lines), phones (≤ 10, at least one without branch) { id, number `+963…` (8–9 digits after 963), hasWhatsApp, branchId? } (new ones sent with `id: ""`; `branchId` = the branch's floor staff number, not public: the public site-info GET leaves those out), branches 1–6 { id, name ≤ 30, address ≤ 80, mapUrl? https } (same for new ids; a new branch gets a slug like §2), openingHours? + openingHoursSchema? (`["Mo-Su HH:MM-HH:MM"]`, written together), socialLinks? [{ platform: `instagram`\|`facebook`\|`threads`\|`tiktok`, url on that platform's domain }]. Phones and branches are saved by id (§4.1). On save the backend drops the dine-in settings and staff phones of deleted branches, and answers `409` when delivery (its `phoneId`) or a branch with tables (its branch phones) would be left without a WhatsApp number. 422 keys: `tagline`, `phones`, `phones.<i>.number`, `branches`, `branches.<i>.name` / `.address` / `.mapUrl`, `openingHours`, `socialLinks.<i>.url` |
| Ordering | `GET/PUT /admin/ordering` | Full `OrderingSettings`. The GET returns `dineIn.branches` for **every** branch, in branch order, including branches never set up (off, 0 tables): the same merge `toOrderingFormValues` does. A delivery phone that no longer exists comes back as `phoneId: ""`. `delivery.phoneId` points at a restaurant phone; table orders go to the branch's WhatsApp phone (no number stored here). The public `/ordering` GET returns the resolved numbers. PUT rules: `delivery.fee` integer ≥ 0; delivery on → `phoneId` is a restaurant phone (no `branchId`) with WhatsApp; `dineIn.branches` each an existing branch once, `tableCount` 0–99 (≥ 1 when on), on → the branch has a WhatsApp phone; `dineIn.isEnabled` → at least one branch on; `message.greeting` 1–120, `message.closing` ≤ 200, `thankYou` 1–240, only `{restaurant}` / `{name}` placeholders. 422 keys: `delivery.fee`, `delivery.phoneId`, `dineIn`, `dineIn.branches.<i>.tableCount` / `.isEnabled`, `message.greeting`, `message.closing`, `thankYou` |
| Images | `POST /admin/uploads` (multipart `image`) | `201 { url, width, height }` (`apiRepository.uploadImage` maps `url` → `src`). The type is checked from the file's **content**: WebP, PNG or JPG; ≤ **5 MB**, ≤ 4000 px per side, **never SVG** (it can carry scripts). Only these URLs are accepted in image fields (§2). An upload that no record uses after **24 hours** is deleted by a daily cleanup |

Writes return the saved record, so the dashboard shows exactly what was stored; creates answer `201`.

### 4.1 Saving whole lists: by id

Some saves send a whole list inside a record: sizes inside a product (`optionGroups[].options[]`), phones and branches inside site info. The backend **updates each row by its id**; it never deletes the list and recreates it, because other data points at those ids:

- `ProductOption.id`: each **cart line stores the size's `optionId`** in the customer's browser. New ids would drop sizes from saved carts.
- `ContactPhone.id`: `ordering.delivery.phoneId` points at it.
- `Branch.id`: the printed QR codes and `ordering.dineIn.branches[].branchId` point at it.

Rules: an item sent **with its id** is updated; an item sent with **`id: ""`** is created and gets a new id; a saved item **missing from the list** is deleted (with the cleanup in BACKEND_REQUIREMENTS §4.4). All of it happens in one database transaction: if any part fails, nothing is saved.

An id that doesn't belong to the parent (another product's size, or an id the browser made up) is **refused**, never created. For sizes: `422` on `optionGroups.0.options.<i>.id`: «هالحجم مش تابع لهالصنف، حدّث الصفحة». The same will apply to phones and branches in site info.

### 4.2 Moving items

`POST /admin/{resource}/{id}/move` with `{ "direction": "up" | "down" }` for categories, offers, banners, reviews and best sellers. It returns the **whole list in its new order** (what `moveX` returns today). Moving the first item up or the last item down returns the list unchanged with `200`.

Why not a `reorder` endpoint taking all the ids: the Server Action doesn't need to load the full list first, the swap happens in one database transaction, and two open tabs can't overwrite each other's order with an old list.

## 5. Errors

Laravel's default JSON, which the frontend turns into one `AppError` (DASHBOARD_PLAN §5.3):

| Status | Body | Shown as |
|---|---|---|
| 422 | `{ "message": "…", "errors": { "price": ["السعر لازم يكون رقم أكبر من صفر"] } }` | Under each field. Field keys = the request's field names, camelCase (nested: `optionGroups.0.options.1.priceDelta`) |
| 401 | `{ "message": "Unauthenticated." }` | "Session ended" → login |
| 403 | `{ "message": "ما عندك صلاحية" }` when `X-Frontend-Key` is missing or wrong (§1) | "No permission" |
| 404 | | "This item no longer exists" |
| 409 | `{ "message": "…" }` (always Arabic) | A **business rule refused the change** (category still has products; moving a product that isn't a best seller; delivery or a branch would be left without a WhatsApp number). The message says why |
| 413 | | "Image too large" (see below) |
| 429 | Login (§4 Auth) or public reads (§3); `Retry-After` in seconds | "Too many tries, wait a minute" |
| 5xx | | "Something went wrong on our side" + retry |

- **No edit-conflict detection:** there is one admin, so the backend doesn't check whether "someone edited this before you". `409` only means a business rule. The frontend's default `conflict` text in `lib/api/errors.ts` ("في حدا عدّل هالعنصر قبلك…") becomes a generic one (agreed; frontend task, §7).
- **Image too large comes two ways:** a file over 5 MB that the server still accepted → **`422`** on the `image` field, with an Arabic message. A request bigger than the server's PHP upload limit → **`413`** (Laravel never sees it). Both mean "choose a smaller photo".
- **No `419`:** that is Laravel's CSRF error for cookie logins; with Bearer tokens it never happens.
- **Messages:** always Arabic (the app's language is fixed to `ar`, rules and texts ported from `src/lib/dashboard/validation.ts`). If a message ever comes back in English, the frontend falls back to its own Arabic text for that field.

## 6. Hosting and deployment

- **Hostinger web hosting (shared)** for Laravel and the database, in an **EU data centre** (closer to Syria for the images, which customers' phones load directly from it).
- **One domain, two hosts:** `<domain>` → Vercel (the site), `api.<domain>` → Hostinger (the API and the images). Buying the domain also unblocks printing the table QR codes (PROJECT_STATUS known issue 2).
- **Vercel function region:** Vercel runs server code in `iad1` (US East) by default. Every dashboard save and every cache refresh is a call from Vercel to Hostinger, so set the function region (Vercel project settings) to the EU region closest to the Hostinger data centre. The demo server is in Frankfurt → **`fra1`**.
- **Demo/staging server:** up on a temporary Hostinger subdomain, seeded with the mock content. Its URL and the key are sent privately.
- **The build calls the API:** the static pages (and `generateStaticParams`) read the menu while Vercel builds. If the API is down, the build fails. So `API_BASE_URL` stays unset (→ mock data) on preview deployments until staging is stable.
- **No IP allow-listing:** Vercel's outgoing IPs change, so the API is public and the admin routes are protected by the token.
- **Server Actions body size limit:** uploads go browser → Server Action → Laravel. Next.js limits a Server Action's body (1 MB by default; check the Next 16 docs for the setting). Photos are resized to ≤ 800 px WebP and should fit, but large PNG cut-outs might not.

## 7. Frontend changes, when each area switches to the API

Not needed now; done one area at a time (Phase D7), after that area works on staging.

| Where | Change |
|---|---|
| `src/lib/api/client.ts` (new, planned) | `apiFetch()`: base URL, headers, token from the session cookie, timeout, failures → `AppError` |
| `src/services/*.ts` | Bodies switch from mock data to `apiFetch()` with cache tags; signatures unchanged |
| `apiRepository` + Server Actions (new) | Each method calls one endpoint and revalidates the matching tag. `saveProduct` → `PUT`, `updateProduct` → `PATCH`; later the same split for offers, banners and reviews (§2) |
| `src/services/auth.ts` | `authenticate()` calls `POST /auth/login`; the session cookie stores the Laravel token instead of checking the env-var account |
| `apiFetch` (every request) | Send `X-Frontend-Key` on every request (§1); on login also `X-Client-IP` (from `x-forwarded-for`, §4 Auth) |
| Dashboard `logout` action | Call `POST /auth/logout` before deleting the cookie (§4 Auth) |
| `lib/auth/login-attempts.ts` | Keep as an extra first layer (optional, now that the API counts per browser) |
| `checkProductQuickChanges` | Optionally add the new size-price check on a quick price change (§4 Products) |
| `ProductForm` new sizes | Send new sizes with `id: ""`. Today the form gives them `size-xxxxxxxx` (`newRowId`), which the API refuses (§4.1); a local key for the row is fine, as `SiteInfoForm` does for phones and branches |
| `src/lib/api/errors.ts` | Generic default `conflict` message (§5) |
| `next.config.ts` | `images.remotePatterns` for `api.<domain>`, and the staging host until the domain is bought; possibly the Server Actions body size limit (§6) |
| Env vars (Vercel) | `API_BASE_URL` and `FRONTEND_API_KEY` (server only; the key is sent privately); `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` go once login uses Laravel |
| Public `error.tsx` / `loading.tsx` | Planned (DASHBOARD_PLAN §5.1): public reads can now fail |
| Product / offer / category / branch forms | The «رابط الصفحة» slug field (§2): now the only way to get a readable URL for a new item |
| Vercel settings | Function region `fra1` (§6) |

## 8. Out of scope for now

Orders (they go to WhatsApp; nothing is stored), order counting/analytics, payments, customer accounts, multiple restaurants.

## 9. Questions

**Answered (2026-11-11):** Sanctum tokens, 7 days (§2, §4) · camelCase (§2) · slugs: a neutral id unless the owner sets one in «رابط الصفحة» (§2, amended: transliteration rejected) · images on `api.<domain>`, 5 MB (§2) · Arabic messages (§5) · delivery order: auth → categories + products + uploads → offers → banners → reviews → hero + about → site info → ordering (BACKEND_REQUIREMENTS §9) · `move` instead of `reorder` (§4.2) · generic `conflict` message (§5) · mock data export: the backend exports it itself (BACKEND_REQUIREMENTS §6).

**Still open:**
1. Which domain? It decides `api.<domain>` and the URL printed in the QR codes.

## 10. Backend terms used in this doc

| Term | Meaning here |
|---|---|
| **Sanctum personal access token** | A long random string Laravel gives on login. Next.js sends it on every admin request (`Authorization: Bearer <token>`); Laravel stores only a hash of it, so a database leak doesn't leak working tokens. Logging out deletes it; after 7 days it stops working |
| **API Resource** | The Laravel class that turns a database row into the JSON the frontend gets: it renames `is_available` → `isAvailable`, puts the slug in `id`, and leaves out hidden fields |
| **FormRequest** | The Laravel class that holds a request's validation rules and their Arabic messages. A failed rule returns the `422` with `errors` per field |
| **Migration / seeder** | A migration creates or changes database tables in code (versioned in git). A seeder fills tables with starting data: here, the content of `src/data/mock/`, keeping the slugs (§2 Ids) |
| **Transaction** | Several database writes that succeed or fail together: a move, or a site-info save, never ends half done |
| **Slug** | The Latin, URL-safe name of a record (`chicken-shawarma`), used as its public id |
| **Rate limiting** | Counting failed login tries per username + IP and refusing (`429`) after 5 in a minute. `Retry-After` says how many seconds to wait |
| **Shared hosting** | A server shared with other sites (Hostinger web plan): PHP + MySQL + cron, no root access. Enough here because Next.js caches almost every read |
| **`post_max_size` / `upload_max_filesize`** | PHP's own limits on a request and an uploaded file. Above them PHP refuses before Laravel runs, hence the bare `413` |
| **Staging** | A second copy of the API with test data (`api-staging.<domain>`), where new endpoints are tried before production |
| **Cron / daily cleanup** | A scheduled task on the server; here it deletes uploaded photos that no record uses |
