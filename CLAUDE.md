# CLAUDE.md — Instructions for Claude Code

Restaurant website, digital menu, and WhatsApp ordering, built frontend-first and reusable across brands. The first brand is **Ahl Al Karam (أهل الكرم)**, a shawarma restaurant.

## Source of truth

1. **`.local-docs/PROJECT_REQUIREMENTS.md` is authoritative** for scope and direction. If code, older docs, or these instructions conflict with it, follow the requirements and point out the conflict. Do not edit it without explicit approval.
2. Read only the doc relevant to the task:

| Need | File |
|---|---|
| What exists, known issues, open questions | `.local-docs/PROJECT_STATUS.md` |
| Structure, data flow, state, motion design | `.local-docs/ARCHITECTURE.md` |
| Coding conventions, review checklist | `.local-docs/DEVELOPMENT_GUIDELINES.md` |
| Phases and what's next | `.local-docs/ROADMAP.md` |
| Approved and pending cleanup items | `.local-docs/CLEANUP_PLAN.md` |
| Why things are the way they are | `.local-docs/DECISIONS.md` |
| Backend integration notes | `.local-docs/API-CONTRACT.md` |

`.local-docs/` is git-ignored (local only). `archive/` holds superseded docs; don't treat it as current.

## Next.js 16 warning

This version has breaking changes, so APIs, conventions, and file structure may differ from your training data. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices. (`next dev` may regenerate an `AGENTS.md` containing this same notice. That file is git-ignored, and this file takes precedence.)

## Working with the owner

The owner is a frontend developer experienced with React and Next.js who writes code alongside you. She wants to understand the reasoning behind architectural decisions and changes, not just receive code. Treat her as a partner, not someone asking for mechanical output.

- **Before any code change:** briefly explain what you'll do, why, which files change, and the approach. Then **wait for explicit approval**.
- **After a feature is approved:** implement it fully within the agreed scope, including verification and affected docs, without stopping at every step.
- **Big decisions** (architecture, a new dependency, wide structural change, anything hard to reverse): present the options and trade-offs briefly, then wait.
- Keep explanations short unless she asks for more. Don't explain React, TypeScript, or Tailwind basics she already uses.
- Focus teaching on Next.js specifics, architecture, non-obvious patterns, scalability, and real risks. Don't explain every line.
- **When she writes the code:** review it first, point out the problem and its cause briefly, and help her fix it rather than replacing her solution.
- Don't expand scope or start the next step without approval.

After each feature, report:
1. Files changed
2. What changed (brief)
3. Two to four key learning points
4. What to test manually
5. Then update only the affected `.local-docs/` files

## Engineering rules

- **Frontend-first.** Do not add a backend, database, auth, API routes for persistence, or SaaS/multi-tenant infrastructure. Future integration happens behind `src/services/*`.
- **Separate UI, models, and data access:** `types/` → `data/mock/` → `services/` → components. Components never import mock data directly. Pure business logic (totals, fees, the WhatsApp message) goes in `lib/`.
- **Server Components by default.** Use client components only for real browser interaction, and keep them small. No `useEffect` without a real reason.
- **Preserve working functionality.** Use incremental, reviewable changes. Don't do large rewrites or refactors without approval. Don't modify unrelated files.
- **No new, upgraded, or removed dependencies** without explaining the need and getting approval. Don't add R3F, Drei, or GSAP until a specific motion justifies it.
- No premature abstractions, types, or utilities. Wait for a second real use.
- Mobile-first, Arabic RTL (use logical utilities like `ps-`, `pe-`, `start-`, `end-`), accessible, and SEO on every public route.
- Use design tokens in reusable components. Keep brand-specific values in `src/config/restaurant.ts` and the `[data-theme]` block, so another restaurant can reuse everything.
- **Motion** must be isolated, prop-driven, lazy-loaded, respect `prefers-reduced-motion`, and render over a static image fallback.

## Project gotchas

- **Tailwind spacing is 1px per unit** (`--spacing: 1px` in `globals.css`): `p-16` is 16px and `size-5` is 5px.
- `/lab/*` routes are dev-only experiments (`notFound()` in production). Don't link to them, and don't import lab code into production components. Promote code out of the lab deliberately instead.
- `three` is imported dynamically (`import("three")`) and only in the lab.

## Verification

Run these before calling anything done:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Then check manually at 360px and on desktop, in RTL, with the keyboard, and with reduced motion emulated. Report failures honestly, with their output.

## Documentation upkeep

- Document reality. Never mark something `DONE` unless it exists and works. Label planned work as planned.
- Keep `PROJECT_STATUS.md` short and current. Log only significant changes in `CHANGELOG.md`. Add decisions to `DECISIONS.md`.
- Don't invent API contracts. Update `API-CONTRACT.md` only when integration needs are real.

## Git

- Never `commit`, `push`, or `merge` unless explicitly asked.
- `.local-docs/` and `AGENTS.md` stay untracked until the owner decides otherwise.

## Communication & Language Preferences

- Always communicate with me in Arabic (preferably clear, conversational Levantine Arabic).
- Explain technical concepts, architectural decisions, errors, and recommendations in Arabic.
- Keep technical terms such as React, Next.js, API, Components, Hooks, and TypeScript in English.
- Write code, variable names, function names, and file names in English.
- Write technical documentation in English unless I explicitly request Arabic.
- Write user-facing restaurant content in Arabic with RTL support.
- Before making significant code changes, explain what you intend to change and why, in Arabic.
- When reviewing code, explain problems and solutions in Arabic, using practical examples.
- Treat me as a Frontend Developer who wants to understand architectural decisions, not just receive generated code.