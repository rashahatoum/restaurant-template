# Backend Requirements — for the Laravel developer

> **Start here.** This is what the frontend needs from the Laravel backend, in one place. The endpoint-by-endpoint draft (paths, field limits, error keys) is in [API-CONTRACT.md](API-CONTRACT.md); this file explains the product, the data, and the rules around it.
> Status: 2026-11-11, written by the frontend. Everything marked **Proposal** is open for you to change; tell us and we adapt on our side.

## 1. The product in two minutes

A website + digital menu for a shawarma restaurant in Sweida, **Ahl Al Karam (أهل الكرم)**, built to be reused for other restaurants later (one restaurant per deployment, not multi-tenant).

- **Customers** browse the menu (Arabic, RTL, mobile first), add dishes to a cart, and send the order as a **WhatsApp message** to the restaurant. They can order **delivery** or **from their table** (each table has a printed QR code).
- **The owner** manages everything from a dashboard at `/dashboard`: menu, prices, photos, offers, banner, best sellers, reviews, home texts, restaurant info, ordering settings, QR codes.

The frontend is **Next.js 16** on Vercel. Today all data is mock files and the dashboard saves in the owner's browser only. **Your API replaces both.**

### What the backend owns
- The database and all content listed in §3.
- The dashboard login (one admin account for now).
- Image uploads and serving.
- Validation (the same rules the dashboard already applies, §4) with **Arabic messages**.

### What the backend does NOT do (out of scope)
- **Orders are not stored.** They go from the customer's phone straight to WhatsApp. No order table, no order API.
- No payments, no customer accounts, no analytics, no multiple restaurants.
- No email, SMS or WhatsApp sending.

## 2. How the frontend talks to you

- **Server to server only.** The browser never calls Laravel. Next.js calls your API from its server (public pages and dashboard actions). **No CORS needed.**
- **Auth (Proposal):** Sanctum personal access tokens, `Authorization: Bearer …`. Next.js keeps the token in an httpOnly cookie on its side. The dashboard session lasts 7 days today.
- **Every request** sends `Accept: application/json` and `Accept-Language: ar`.
- **Base URL (Proposal):** `/api/v1`. JSON keys in camelCase to match our types (snake_case is fine: we map it in one file, just tell us).
- **Caching:** public pages cache your responses; after a dashboard save, Next.js refreshes the affected pages itself. **No webhook needed.**
- **Writes return the saved record**, so the dashboard shows exactly what was stored.

## 3. The data

Exact shapes are TypeScript types in the repo; **your JSON should match them** (or tell us what differs):
- [src/types/menu.ts](../src/types/menu.ts): `Category`, `Product`, `ProductOptionGroup`, `ProductOption`
- [src/types/content.ts](../src/types/content.ts): `Offer` + `OffersContent`, `MenuBanner`, `Review` + `ReviewsContent`, `HeroContent`, `AboutContent`, `SiteInfo` (`ContactPhone`, `Branch`, social links)
- [src/types/order.ts](../src/types/order.ts): `OrderingSettings`
- [src/types/dashboard.ts](../src/types/dashboard.ts): what the dashboard sends (`ProductInput` = product without id, etc.)

### Entities at a glance

| Entity | Kind | Key fields | Notes |
|---|---|---|---|
| Category | list, ordered | id, name, image?, order | Delete refused while it has products |
| Product | list | id (**URL slug**), categoryId, name, description, ingredients[], price, image?, imageStyle?, isAvailable, isBestSeller, bestSellerOrder?, optionGroups? (sizes) | Sizes: one group, ≥ 2 options, each with a price difference from the base price |
| Offers section | singleton | isEnabled, eyebrow, title, menuCardImage? | |
| Offer | list, ordered | id (**URL slug**), title, items[], freeItem, price, image, imageStyle?, badge?, isActive | "Buy X, get Y free" |
| Menu banner slide | list, ordered | eyebrow?, title, image {src, alt}, action? {label, target}, isActive | Target is an id (offers / category / product), never a typed link |
| Reviews section | singleton | isEnabled, eyebrow, title, defaultQuestion | |
| Review | list, ordered | customerName, question?, answer, time?, isVisible | Typed in by the owner from WhatsApp |
| Hero | singleton | badge?, headline, two button labels, exactly 3 features {label, icon} | |
| About | singleton | eyebrow, title, paragraphs[1–4], closing, image, badge? | |
| Site info | singleton | tagline, phones[], branches[], openingHours + openingHoursSchema, socialLinks[] | Phones and branches have ids (other settings point at them) |
| Ordering settings | singleton | delivery {isEnabled, fee, phoneId}, dineIn {isEnabled, branches[{branchId, isEnabled, tableCount}]}, message {greeting, closing}, thankYou | Points at phones and branches by id |
| Admin user | 1 row | username, password (hashed) | Login only |

### Formats
- **Money:** whole numbers in Syrian pounds (`price: 250`). No decimals.
- **Phones:** international, no spaces: `+963930539614`.
- **Highlights in text:** some texts mark words with `**double stars**` (titles, review answers, About paragraphs). Store the text as is; the frontend renders the marks. Lengths are counted **without** the stars.
- **Message placeholders:** ordering texts may contain `{restaurant}` and `{name}` (only these two).
- **Opening hours:** two fields written together: `openingHours` (Arabic text) and `openingHoursSchema` (`["Mo-Su 09:00-24:00"]`).
- **Images:** a URL string on the record (`image`, `image.src`). The dashboard already resizes photos to ≤ 800 px WebP before upload.

## 4. Rules the API must enforce

The dashboard checks all of these before sending, but **the API is the source of truth** and must apply them too (someone can call the API without the dashboard). The exact rules and error messages live in one file: [src/lib/dashboard/validation.ts](../src/lib/dashboard/validation.ts). The limits per field and the 422 error keys per endpoint are in [API-CONTRACT.md](API-CONTRACT.md) §4.

Rules that span several records (easy to miss):

1. **Category with products can't be deleted** → `409`.
2. **Best sellers** are ordered 1…n (`bestSellerOrder`); keep them renumbered with no gaps after a change. A best seller needs a photo.
3. **Banner buttons** store a target id. If the category / product is deleted, the public response drops the button (the slide stays).
4. **Phones and ordering:** delivery points at a restaurant phone (`phoneId`); table orders go to the branch's own phone (`ContactPhone.branchId`, the floor staff number, **never shown publicly**). Saving site info that would leave delivery or a branch with tables without a WhatsApp number → `409`. Deleting a branch also deletes its staff phones and its table settings.
5. **Ordering settings:** what is switched on must have a WhatsApp number to go to; tables on → at least one branch on, table count 1–99.
6. **Product and offer ids share one URL space** (`/menu/<id>`), so they must never collide.

## 5. IDs and slugs: please keep them stable

Ids are public in two places that can't be updated once they're out:

- **Printed QR codes** hold the branch id: `https://<domain>/t/qanawat-road/5`. If a branch id changes, the printed codes for that branch stop working. **Keep the two current branch ids: `qanawat-road` and `al-mehwari`.**
- **Shared links and Google** use the product / offer id as the URL: `/menu/chicken-shawarma`. Keep them stable, and give new ones a Latin, kebab-case slug (**open question:** generated from the Arabic name, or typed by the owner?).
- Category ids are used in menu anchors (`#category-<id>`): stable and Latin too.

Numeric database ids are fine internally, as long as the API exposes these slugs as `id` (or as a separate `slug` we can use).

## 6. Seed data

The real content is already written as mock data: [src/data/mock/](../src/data/mock/) (`menu.ts`, `offers.ts`, `menu-banners.ts`, `reviews.ts`, `hero.ts`, `about.ts`, `site-info.ts`, `ordering.ts`). **Please seed the database from it with the same ids**, so the live site starts with the same content and URLs. Photos are in [public/assets/](../public/assets/); they need to move to your image storage. We can export the mock data as JSON for your seeders if that helps (tell us).

## 7. Public responses (what customers see)

The public endpoints apply the "visible only" rules for us, so hidden data never leaves the server:

- Menu: empty categories left out; unavailable products **included** (shown dimmed).
- Offers / reviews: only active / visible items; `null` when the section is switched off.
- Banners: only active slides; buttons whose target is gone are dropped.
- Site info: **branch staff phones left out**.
- Ordering: only enabled order types and branches, with the WhatsApp numbers resolved.

Dashboard endpoints (`/admin/…`) return **everything**, hidden items included.

## 8. Errors

Use Laravel's default JSON. The frontend maps each status to a designed Arabic message (details: API-CONTRACT §5):

- `422` with `errors` per field (keys = request field names, nested with dots: `optionGroups.0.options.1.priceDelta`). **Arabic messages please** (`lang/ar`); an English message falls back to our own text.
- `401` (session ended → login), `403`, `404`, `409` (conflict, with a message), `413` (image too large), `429` (login tries), `5xx`.

## 9. What we need back from you

1. **Answers** to the open questions (API-CONTRACT §7): auth tokens, camelCase or snake_case, slugs, image host, Arabic messages, delivery order.
2. **A staging URL** and a test admin account (sent privately, never in the repo).
3. **The image host** (domain), so we allow it in Next.js.
4. **Changes to the contract** as you build: tell us and we update `API-CONTRACT.md`, so it stays the agreed version.
5. **Suggested order of delivery:** auth + menu (categories, products, images) first, then offers, banners, reviews, home texts, site info, ordering.

## 10. Where to look in the repo

| You want | Look at |
|---|---|
| Endpoint list, limits, 422 keys | [API-CONTRACT.md](API-CONTRACT.md) |
| Data shapes | `src/types/` |
| Seed content | `src/data/mock/` |
| Validation rules + Arabic messages | `src/lib/dashboard/validation.ts` |
| What the public site reads (and the visibility rules) | `src/services/` |
| Every dashboard write (one interface) | `src/lib/dashboard/repository.ts` |
| Why things are the way they are | [DECISIONS.md](DECISIONS.md) |
| Overall requirements | [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md) |
