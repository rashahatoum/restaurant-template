# Development Guidelines

How code is written in this project. Scope and priorities come from [PROJECT_REQUIREMENTS.md](PROJECT_REQUIREMENTS.md). Structure comes from [ARCHITECTURE.md](ARCHITECTURE.md). AI collaboration rules live in `CLAUDE.md` at the repo root.

## 1. Next.js (16, App Router)

- This is Next.js **16**. APIs differ from older versions. Before using a Next API you aren't sure about, read the matching guide in `node_modules/next/dist/docs/01-app/` (for example `05-server-and-client-components.md`, `06-fetching-data.md`, `12-images.md`, `14-metadata-and-og-images.md`, and `02-guides/json-ld.md`).
- **Server Components by default; client at the smallest element (owner rule, 2026-11-06).** Add `"use client"` only to the smallest component that needs state, effects, refs to DOM, event handlers or browser APIs: the button, not the card; the badge, not the header. Patterns, in order of preference:
  1. **No JS:** CSS (`:has()`, `:target`, scroll-driven animations with a static fallback) or native HTML (`<details>`, `<dialog>`, form `action`). Check browser support first.
  2. **Leaf island:** extract just the interactive leaf (`CartLink` with the count badge, `NavLink` with `aria-current`) and render it inside a server tree.
  3. **Client wrapper + server children:** when a client component controls content (dialog, carousel, sheet, scroll-aware header), the content arrives as `children` or ReactNode props rendered on the server (like `Slider`, `AutoCarousel`, `MenuBrowser` today).
  4. **Serializable props only:** pass the few values the island needs; don't import `restaurantConfig` or big modules into client files (they ship to the browser).
  - `"use client"` marks a **boundary**. Keep it on files with hooks or state (they still work if a server file imports them later); leave it off hook-free presentational components (`Switch`, `OrderSentPanel`, `ToastViewport`), so a server parent can render them. A script that lists boundaries vs inner client files: see DECISIONS 2026-11-06.
  - Browser-held data (cart, dashboard draft) justifies client rendering; when the data moves to the server (Laravel), turn those screens into server lists with client leaves.
  - Review: for each client file, ask "which lines actually need the browser?" Everything else moves out.
- Pages fetch through `services/*` and never import mock data directly.
- Every public route exports `metadata` or `generateMetadata`. Dev/prototype routes (`/lab`, `/dashboard`) set `robots: { index: false }`.
- Use `next/link` for internal navigation and `next/image` for images. Set `priority` **only** on the actual LCP image, and set `sizes` whenever the image isn't fixed-width.
- Heavy client-only code (three.js, large motion engines) is lazy-loaded with `next/dynamic` or `import()`.
- Dev-only routes guard with `if (process.env.NODE_ENV === "production") notFound();`, which matches the existing lab pages.

## 2. TypeScript

- `strict` stays on. Don't use `any`. Prefer `unknown` plus narrowing.
- Domain models go in `src/types/`. Component prop types stay next to their component (`interface XProps`).
- Config and mock data use `as const` together with `satisfies SomeType`, which gives literal types and validation at the same time.
- Model finite choices as unions (`theme: "fire"`, `motion.kind: "spit-rotation" | "static"`), not free strings, and drive lookup maps from them so a typo fails type-checking.
- Don't create a type, utility, or abstraction until there is a second real use or a requirement that forces it.

## 3. Components

- Follow the existing file conventions: PascalCase file names, `const Name = (props) => { … }` with `export default Name`, and `/* ===== SECTION ===== */` banners only in long files.
- **Reusable components take props.** Only page-level and section-level components read `restaurantConfig` or call services. (`HeroImageSequence` currently breaks this rule; see the cleanup plan.)
- Don't hard-code brand content (names, labels, CTA text, links) inside reusable components. Put it in config or data.
- One interactive concern per client component. Don't make a whole section client-side because of one button.
- Repeated class strings across siblings (for example the two hero CTAs) are a signal to extract a component, but only once there is a second use.
- Use stable keys from data (`id`, `href`), not array indexes.

## 4. Styling, theming, responsiveness

- **Tokens only** in reusable components: `bg-primary`, `text-foreground`, `border-border`, and so on. No `text-white`, `bg-black/60`, or hex values. If a needed token is missing (for example an overlay or a divider), add it to the theme instead of hard-coding it.
- New brand = new `[data-theme="…"]` block in `globals.css` plus a config change. Components don't change.
- **Spacing scale is 1px** (`--spacing: 1px`): `p-16` is 16px and `size-5` is **5px**. Write the pixel value you mean, and double-check classes copied from Tailwind docs or snippets.
- Use the `page-gutter` spacing token for horizontal page padding instead of repeating `px-[8vw]`. Avoid arbitrary values when a token or scale value works.
- **RTL:** use logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`, `border-s`) instead of `left`/`right`/`pl`/`pr`, unless the placement is intentionally physical (for example an image that must stay on the left).
- **Mobile-first:** base classes target ~360px. Add `sm`/`md`/`lg`/`xl` upward. Check at 360, 768, 1280 and ≥1536px.
- Avoid `whitespace-nowrap` on headings unless the text is guaranteed to fit at 360px.
- Body text inherits Tajawal from `body` (set in `globals.css`), so don't add `font-body` to elements. Use `font-display` (Playpen Sans Arabic) only for display headings. Loaded weights: 400/500/700/800, so `font-semibold` (600) and `font-black` (900) fall back to the nearest loaded weight.

## 5. Accessibility

- Use semantic landmarks (`header`, `nav`, `main`, `footer`) and one `h1` per page with a logical heading order.
- Links navigate and buttons act. Never put `onClick` on a `div`.
- Toggles (the mobile menu, accordions) need `aria-expanded` and `aria-controls`. Overlays close on Escape and on link click, restore focus, and lock background scroll.
- All controls must be keyboard reachable with a visible focus style. Write accessible names in Arabic.
- Decorative images use `alt=""`. Meaningful images get Arabic alt text from config or data.
- Check contrast for orange-on-charcoal and text over photos.
- Respect `prefers-reduced-motion`: no autoplaying motion, and show the static fallback instead.

## 6. Performance

- Keep the JS budget small. Server-render everything that isn't interactive.
- Hero: the static image must be the LCP element and render without JS. Motion loads after it and must not delay it.
- Image sequences: preload and decode frames before playing. Serve size-appropriate frames to mobile and avoid shipping 5 MB of 1024×1536 frames to phones. Respect `Save-Data`.
- Animate with `requestAnimationFrame`, `transform`, and `opacity`. Never step animations with `setInterval` + React state per frame. Clean up rAF, timers, observers, and WebGL resources on unmount.
- No layout shift: give images dimensions, reserve space for async content, and use `next/font` (already in place).

## 7. Data, state, persistence

- Follow [ARCHITECTURE.md](ARCHITECTURE.md) §5–6: `types/` → `data/mock/` → `services/` → components. Pure calculations go in `lib/`.
- Don't use `useEffect` to derive state or to fetch data that a Server Component could fetch. Legitimate uses: subscribing to browser APIs, timers and animation loops, and imperative libraries (three.js).
- Wrap browser storage access in a `try`/`catch` and keep the UI working when storage is empty or unavailable.
- Money is computed from integers in the smallest unit (or by whatever rule is agreed once the currency is known), never by repeated float addition. Format prices in one helper.

## 8. Dependencies

- Don't add, upgrade, or remove a package without an explanation (need, size, alternatives) and approval.
- Prefer the platform (canvas, CSS, Intl, native forms) before reaching for a library.

## 9. Verification & review

Before reporting a change as done, run:

```bash
npm run lint
npm run typecheck    # tsc --noEmit
npm run build
```

Then check manually: mobile (360px) and desktop, RTL alignment, keyboard navigation, and reduced motion (DevTools → Rendering → emulate `prefers-reduced-motion`).

Review checklist:

- [ ] Server/client boundary is as small as possible
- [ ] No mock-data imports outside `services/`
- [ ] Tokens instead of hard-coded brand values; correct px values on the 1px spacing scale
- [ ] Logical (RTL-safe) spacing and positioning
- [ ] Accessible names, roles, keyboard support
- [ ] Metadata present for new public routes
- [ ] No unrelated files touched
- [ ] Affected `.local-docs/` files updated

**Tests:** there is no test runner yet. When pure logic arrives (cart totals, WhatsApp message builder), propose a lightweight unit-test setup for `src/lib/`. That needs approval.
