# Dashboard — Plan (v2)

> Status: **v2 approved; D0–D6 built and merged (PRs #25–#36).** Next: D7 (API readiness), one area at a time as the Laravel API reaches staging.
> v2 (2026-11-03, owner): a **Laravel backend** (with the database) is coming from a backend developer; the frontend must make plugging in its API trivial. Login page added. Backend error messages need a designed UI. Public pages stay Server Components; preview only where it helps.
> Field reference: [ARCHITECTURE.md](ARCHITECTURE.md) §8. Endpoints: [API-CONTRACT.md](API-CONTRACT.md) (agreed with the backend developer 2026-11-11, amended with the backend build in PR #39).

## 0. Conflicts to resolve first

Resolved 2026-11-03 (owner approved):

- [x] `PROJECT_REQUIREMENTS.md` updated: backend = Laravel (separate developer); the dashboard gets a login; hero texts and About editable; until the API exists, the dashboard works on mock data saved in the browser.
- [x] `CLAUDE.md` → "Engineering rules" updated the same way.

The frontend still builds **no** database or server persistence of its own. It only prepares a clean seam for the Laravel API.

## 1. Goal and success criteria

A dashboard the owner can use **from a phone, with no training**.

| Task | Target |
|---|---|
| Change a price | ≤ 3 taps from the dashboard home |
| Mark a dish sold out / back | 1 tap in the list |
| Add a product with a photo | ≤ 1 min, one screen |
| Understand every screen | All Arabic, no technical words |
| Something fails | A clear Arabic message saying what happened and what to do; nothing typed is lost |

## 2. Everything the dashboard controls (full review)

Legend: ✏️ edit · ➕ add/delete · 🔀 reorder · 🔘 on/off · 👁 live preview in the form.

### 2.1 Menu

| Screen | What the owner controls | Notes |
|---|---|---|
| **Products** (list) | price ✏️ inline · available 🔘 · best seller 🔘 · open form | Quick actions without a form |
| **Product** (form) 👁 | name, description, ingredients (chips, may be empty: drinks), price, category, photo + type (cut-out / full photo), sizes (name, short name, price difference), available 🔘, best seller 🔘, delete | Preview: menu row + item page. Best seller needs a photo (shown as a hint) |
| **Categories** | ➕ name, photo (optional), 🔀 order | Can't delete a category that still has products (offer "move them to…") |

### 2.2 Promotions

| Screen | What the owner controls | Notes |
|---|---|---|
| **Offers** section | section 🔘 (home + menu), eyebrow, title (highlight button), menu card photo | Off also hides the "العروض" card and section in the menu |
| **Offer** (form) 👁 | title, items (chips), free item, price, photo (4:3), badge, active 🔘, ➕ 🔀 | Preview: offer card |
| **Menu banner** 👁 | ➕ 🔀 slides: eyebrow, title (2 short lines), photo, button text + **destination picked from a list** (offers, a category, the menu), active 🔘 | No typing links |
| **Best sellers** | which products (same switch as in Products), 🔀 order in the slider | One shortcut screen; data lives on the product |

### 2.3 Home page content

| Screen | What the owner controls | Notes |
|---|---|---|
| **About** | eyebrow, title, paragraphs, closing (highlight button), photo (4:5), badge | No preview (text section) |
| **Reviews** section | section 🔘, eyebrow, title, default question | |
| **Review** (form) 👁 | first name, question (optional), answer (≤ 220, counter, highlight), time, visible 🔘, ➕ 🔀 | Preview: the WhatsApp-style card |

### 2.4 Ordering and restaurant info

| Screen | What the owner controls | Notes |
|---|---|---|
| **Ordering** | delivery 🔘 + fee + WhatsApp number; dine-in 🔘; per branch: 🔘, table count, WhatsApp number; message greeting / closing and thank-you text with `{restaurant}` `{name}` inserted by buttons | The message body stays fixed (cashier layout) |
| **Restaurant info** | tagline, phones (number + "has WhatsApp"), branches (name, address, map link) ➕, opening hours, social links ➕ | Phone numbers validated (Syrian format) |
| **Table QR codes** ✅ D6c | print the QR sheet per branch from the dashboard | `/dashboard/qr` (replaced `npm run qr`); print for real after the domain exists |

### 2.5 Hero (owner: editable, a priority with About)

| Screen | What the owner controls | Notes |
|---|---|---|
| **Hero** | headline, badge (e.g. "من قلب السويداء"), the two button labels, the 3 features (text + icon picked from a small set) | Moves these fields from `config/restaurant.ts` to content behind a service (`getHeroContent`). The photos and the 3D spit stay config |

### 2.6 Not editable (decided)

| Item | Where it lives | Why |
|---|---|---|
| "الأكثر مبيعاً" section eyebrow / title | `BestSellers` | Owner: no need |
| Name, logo, colors, currency, time zone, SEO, nav links, hero photos and motion | Config, per deployment | Set once per restaurant |
| Order message body, order number format | `lib/order` | Fixed layout for the cashier |

## 3. UX principles

1. **Tasks, not tables.** Home shows tiles with counts ("المنيو · 16 صنف"), not entities.
2. **Frequent actions in the list:** price, available, best seller. One tap, instant save, toast with "تراجع".
3. **Forms:** one screen, rare fields folded ("خيارات إضافية"), a sticky "احفظ" bar that appears only after a change.
4. **Preview only where it helps** (👁 above): product, offer, review, banner. Text-only screens have none.
5. **Never lose input.** On any error the form keeps every value.
6. **Forgiving:** delete confirms with the item's name; undo for quick actions; "رجّع البيانات الأصلية" while on mock data.
7. **Guide:** hints under fields (photo shape, counters), examples as placeholders, plain-Arabic errors next to the field.
8. **Same look as the site:** brand tokens, dark theme, RTL, touch targets ≥ 44px, keyboard and reduced motion supported.
9. **Phone first;** from `md`, list and form side by side.

## 4. Login

### Screen

```
┌────────────────────────────────┐
│          [logo]                │
│      لوحة تحكم أهل الكرم        │
│                                │
│ اسم المستخدم  [              ]  │
│ كلمة السر     [          👁 ]  │
│                                │
│ [        تسجيل الدخول        ] │
│ ⓘ رسالة الخطأ هون عند الحاجة     │
└────────────────────────────────┘
```

- Wrong credentials: "اسم المستخدم أو كلمة السر غلط" (never says which one). Button shows a spinner and is disabled while checking. Password show/hide. `autocomplete="username"` / `"current-password"` so phones offer to save it.
- After 5 failed tries: "محاولات كتير، جرّب بعد دقيقة".
- Logout in the dashboard menu. The login lasts **7 days** on that device, then asks again (default; easy to change). No "تذكّرني" box.

### How it works (now → Laravel)

| | Now (before the API) | With Laravel |
|---|---|---|
| Check credentials | Server Action compares with `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` **env vars** (`.env.local` locally, Vercel settings online). Initial user: the one the owner gave | Server Action calls the Laravel login endpoint; users live in the Laravel database |
| Session | Signed, `httpOnly`, `secure` cookie (HMAC with `SESSION_SECRET`, Web Crypto, no new dependency) | Same cookie holds the Laravel token (Sanctum); the browser's JavaScript never sees it |
| Protect pages | `src/proxy.ts` (Next 16's name for middleware) redirects `/dashboard/*` to `/dashboard/login` without a session (fast check), and the dashboard layout verifies it again on the server | Unchanged |

**Security notes:**
- Credentials never go into the code or git; only env vars. The live site needs them set on Vercel.
- `12345678` is fine to start, but the site is public on Vercel: change it before sharing the dashboard link. Real passwords will be managed by Laravel.
- This is a single shared account. Roles and multiple users come with Laravel.

## 5. Architecture: ready for the Laravel API

### 5.1 The seam

```
Public pages (Server Components, stay fast)
    → services/*.ts  get…()            mock today  →  apiFetch() to Laravel later (cached, revalidated)

Dashboard screens (client)
    → dashboard/repository  (one interface, async, returns Result)
         ├─ localRepository   today: mock seed + browser draft (localStorage, images in IndexedDB)
         └─ apiRepository     later: Server Actions → apiFetch() → Laravel
```

- **Screens never know where data comes from.** They call `repository.updateProduct(id, changes)` and get `Result<T>`: `{ ok: true, data }` or `{ ok: false, error: AppError }`. Switching to Laravel = writing `apiRepository` and flipping one env var; no screen changes.
- **Why Server Actions in the middle (BFF):** the Laravel URL and token stay on the server, no CORS or cookie-domain setup between Vercel and the Laravel host, and after a successful save the action calls `revalidateTag("menu")` so the public site shows the change while staying static and fast.
- **One HTTP client:** `lib/api/client.ts` `apiFetch()`: base URL from `API_BASE_URL` (server-only env), JSON headers, `Accept-Language: ar`, the token from the session cookie, a timeout, and every failure turned into an `AppError` (5.3). Nothing else calls `fetch` for the API.
- **Mapping lives in services:** if Laravel sends `snake_case` or different shapes, small `fromApi…` functions in `services/` convert to our `types/`. Components keep their types.
- **Switch:** `API_BASE_URL` unset → mock + browser draft (today). Set → Laravel. Can be per area later if the backend delivers endpoints one by one.
- Public reads with a real API can fail, so the public site also gets `error.tsx` / `loading.tsx` (ROADMAP Phase 3 TODO), with a friendly fallback ("القائمة مش متاحة هلق، اطلب على الواتساب" + number).

### 5.2 What the backend developer gets

`API-CONTRACT.md` got a **draft** for discussion (now agreed, 2026-11-11): resources and operations the UI needs, mapped to our types (menu, categories, products, offers, banners, reviews, about, site info, ordering, login/logout/me, image upload), plus the expected error format (Laravel's default, below). The backend developer decides the final endpoints; only `services/` and `apiRepository` adapt.

### 5.3 Errors: one model, designed messages

**Model** (`lib/api/errors.ts`):

```ts
type AppErrorKind =
  | "validation" | "unauthenticated" | "forbidden" | "not_found" | "conflict"
  | "too_large" | "rate_limited" | "server" | "offline" | "timeout";

interface AppError {
  kind: AppErrorKind;
  message: string;                          // Arabic, ready to show
  fieldErrors?: Record<string, string[]>;   // validation only
  status?: number;
}
```

**From Laravel:** `422 { message, errors: { field: [...] } }` → `validation` with `fieldErrors` (backend asked to send Arabic messages via `Accept-Language: ar`; otherwise our Arabic fallback per field). `401` → `unauthenticated`, `403` → `forbidden`, `404` → `not_found`, `409` → `conflict`, `413` → `too_large`, no `419` (Bearer tokens, no CSRF; API-CONTRACT §5), `429` → `rate_limited`, `5xx` → `server`; no response → `offline` / `timeout`.

**Messages and where they appear:**

| Kind | Arabic message | UI |
|---|---|---|
| validation | the field's own message, e.g. "السعر لازم يكون رقم أكبر من صفر" | Red text under the field (`aria-describedby`), focus moves to the first error, short summary at the top of the form |
| unauthenticated | "انتهت الجلسة، سجّل دخول من جديد" | Dialog → login, then back to the same screen |
| forbidden | "ما عندك صلاحية لهالتعديل" | Form alert |
| not_found | "هالعنصر ما عاد موجود، يمكن انحذف" | Alert with "ارجع للقائمة" |
| conflict | "في حدا عدّل هالعنصر قبلك. حدّث لتشوف آخر نسخة" | Alert with "حدّث" (keeps your text to copy) |
| too_large | "الصورة كبيرة، اختار صورة أصغر من 5MB" | Under the image field |
| rate_limited | "محاولات كتير، جرّب بعد دقيقة" | Form alert / login |
| server | "صار خلل عندنا، جرّب كمان شوي" | Toast with "جرّب مرة تانية" |
| offline | "ما في اتصال بالإنترنت. تعديلاتك لسا هون" | Toast with retry; form untouched |
| timeout | "الاتصال بطيء، ما وصلنا رد" | Toast with retry |

**Components** (`components/dashboard/feedback/`): `FieldError`, `FormAlert` (error / warning / success), `Toast` (with action: تراجع / جرّب مرة تانية), `ErrorState` (full screen when a page can't load: icon, message, retry), `SessionExpiredDialog`. All in brand tokens, icons + text (never color alone), `role="alert"` / `aria-live`.

A dev-only `/lab/errors` page shows every message and component for review (not linked, `notFound()` in production like the other lab pages).

## 6. Technical notes

- Routes: `src/app/(dashboard)/dashboard/…` with its own layout (no public NavBar), `noindex`, not in the sitemap. `login` outside the protected layout. Read the Next 16 guides first (`proxy`, authentication, server actions, route groups).
- Draft (before the API): snapshot of the seed in `localStorage` (`dashboard:v1`), validated on load like the cart; images compressed in the browser (canvas → WebP, ≤ ~800px) and stored in IndexedDB; transparency detected to preselect cut-out / full photo. No new dependency.
- With the API: images upload through the API (multipart) and come back as URLs; `next.config` allows the Laravel image host.
- Forms: native inputs and validation, pure validators in `lib/` (also mirrored by Laravel). Shared field components only once a second screen needs them.
- New local items get generated ids; Laravel will assign real ids.

## 7. Phases (one reviewable PR each)

| # | Phase | Delivers |
|---|---|---|
| D0 ✅ (2026-11-03, owner review pending) | Foundations. **Built:** login + signed 7-day cookie + `src/proxy.ts`, `lib/api/errors` (`AppError`, `Result`, `fromHttpResponse`), feedback components + `/lab/errors`, status color tokens, layout shell with the prototype notice, home tiles ("قريباً") from `getDashboardSeed`. **Moved to first use:** the `repository` + browser draft → D1 (first write); `apiFetch` → D7 (first API call). Planned scope was: | Requirements/CLAUDE.md update (approved), route group + layout shell (prototype notice, phone bottom nav), **login + session + proxy**, `lib/api` (client + `AppError` + Result), feedback components + `/lab/errors`, `repository` interface + `localRepository` (seed + draft + reset), home tiles |
| D1 ✅ (2026-11-03, owner review pending) | Menu quick edits | Products by category: inline price, available / best-seller switches, undo. **Built:** `/dashboard/menu` (category chips, `ProductQuickRow`, `PriceEditor`, `Switch`), `repository` (`updateProduct`, `resetToOriginal`) + `localRepository` over the browser draft (`lib/dashboard/draft*`, `useDashboardData`), `useToast` + `ToastViewport`, `ConfirmDialog`, home tiles counted from the draft + "رجّع البيانات الأصلية" |
| D2a ✅ (2026-11-06, `feat/dashboard-d2`, owner review pending) | Product form | `/dashboard/menu/new` and `/dashboard/menu/[id]`: add / edit / delete with live preview (`MenuItemRow` + `ItemDetails`, inert), sizes under a native `<details>`, save bar, unsaved-changes warning. Category tab kept in the URL |
| D2b ✅ (2026-11-06, `feat/dashboard-d2`, owner review pending) | Categories | `/dashboard/categories`: add, rename in place, reorder (↑ ↓), delete (empty only; with products → toast "شوف أصنافه"). Empty categories are flagged "ما بيطلع للزبون". Category photo comes with D3 |
| D2 (plan) | Product form + categories | Add / edit / delete with preview (row + item page), sizes, categories add / rename / reorder / delete |
| D3 ✅ (2026-11-07, `feat/dashboard-d3`, owner review pending) | Images | Picker, compression, IndexedDB, cut-out detection. **Built:** `ImagePicker` in the product form and category rows, `prepareImage`, `local-images` + `useImageSrc` + `DashboardImage`, repository `uploadImage` / `setCategoryImage` |
| D4 | Offers + banner + best-seller order | Split: **D4a ✅ (2026-11-07, PR #29 merged)** offers section + CRUD with card/menu-row preview, `HighlightInput` «ميّز»; **D4b ✅ (PR #30 merged)** banner slides with a typed destination (`offers` / `category` / `product`, owner-approved; href computed in services, hidden when the target is gone; `DRAFT_VERSION` → 2); **D4c ✅ (2026-11-07, review pending)** `/dashboard/best-sellers` order via `Product.bestSellerOrder` + add from a list |
| D5 | Hero + About + Reviews | Split (owner, 2026-11-08): **D5a ✅ (PR #32 merged)** `/dashboard/home-content`: hero texts moved to content (`getHeroContent`), three features with an icon picker (six icons), About form (1–4 paragraphs, several highlights per paragraph via `HighlightInput variant="text"`), no preview; **D5b ✅ (PR #33 merged)** `/dashboard/reviews`: section settings, list (visible, order, delete), form with the WhatsApp card preview, answer ≤ 220 with «ميّز», time picked from a clock |
| D6 | Ordering + restaurant info | Split (owner, 2026-11-08): **D6a ✅ (PR #34 merged)** `/dashboard/info`: tagline, social links (+ footer icons under the logo, Threads added), phones with ids (edits follow to ordering), branches, hours from two clock times; **D6b ✅ (2026-11-10)** `/dashboard/ordering`: delivery (fee, number picked from the restaurant's WhatsApp phones), tables per branch (number = the branch's staff phone), message texts with «اسم المطعم» / «اسم الزبون» buttons (Arabic placeholders in the form, `{restaurant}` / `{name}` saved), live WhatsApp preview via `buildOrderMessage` (PR #35 merged); **D6c ✅ (2026-11-10, PR #36 merged; added by the owner)** table QR codes: short link `/t/<branch>/<n>`, `/dashboard/qr` (range per branch, menu code, domain warning), server-made A4 print sheet |
| D7 | API readiness | Contract ✅ agreed with the backend developer (2026-11-11, amended in PR #39). Still to do: `apiFetch`, public `error.tsx` / `loading.tsx`, `apiRepository` behind the env switch, then the per-area tasks in API-CONTRACT §7 |

Each phase: lint, typecheck, build, manual check at 360px / desktop / keyboard / reduced motion, docs.

Progress weights (owner asked for a completion % after every pushed step; fixed so the number is consistent): D0 10 · D1 8 · D2a 12 · D2b 6 · D3 8 · D4a 10 · D4b 8 · D4c 4 · D5 14 (D5a 7 · D5b 7) · D6 12 (D6a 6 · D6b 6) · D7 8 = 100. Done after D4a (PR #29): 54%. After D4b (PR #30): 62%. After D4c (PR #31): **66%**. After D5a (PR #32): 73%. After D5b (PR #33): **80%**. After D6a (PR #34): **86%**. After D6b (PR #35): 92% on the old scale. **Re-weighted 2026-11-10** (owner added D6c table QR codes, 4): total 104, shown as a share of it. After D6b: 92/104 = **88%**. After D6c: 96/104 = **92%**. After D7: 100%.


## 8. Out of scope for now

Multiple users and roles (Laravel), order management and counting (DECISIONS 2026-11-03), analytics, drag-and-drop reordering (up/down buttons first), export / import of the draft.

## 9. Answered (2026-11-03)

1. Requirements / CLAUDE.md update: approved and done.
2. Hero texts: editable (with About, a priority). Best-sellers title: not editable.
3. Login lasts 7 days per device (default, adjustable).
4. Backend developer's preferences unknown: the draft in `API-CONTRACT.md` starts that conversation. **Since then:** agreed 2026-11-11, amended in PR #39 (DECISIONS).
