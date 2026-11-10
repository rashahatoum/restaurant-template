# Restaurant Digital Experience — Project Requirements

## 1. Project Overview

Build a modern, responsive restaurant website and interactive digital menu using Next.js, React, TypeScript, and Tailwind CSS.

The product should be reusable for different restaurant brands, with customizable content, visual identity, and interactive hero animations.

The first implementation is for a shawarma restaurant named **Ahl Al Karam (أهل الكرم)**.

## 2. Current Scope

This is a **frontend-first project**.

- The backend is **Laravel**, with its database, built by a separate backend developer (confirmed by the owner, 2026-11-03). The frontend does not build a database or its own server persistence.
- Until the Laravel API is available, use local mock data with strongly typed models; the dashboard saves its edits in the browser.
- Introduce a data access layer so the Laravel API can be plugged in without changing components.
- No SaaS or multi-tenant infrastructure.
- Prioritize clean architecture, performance, maintainability, accessibility, and responsive design.

Do not introduce unnecessary abstractions or complex infrastructure.

## 3. Core Features

### Restaurant Website
- Responsive navigation and mobile menu.
- Interactive hero section.
- Restaurant introduction and key benefits.
- Featured products and promotional offers.
- Customer reviews.
- Location, opening hours, and contact information.
- SEO-friendly pages.

### Digital Menu
- Product categories.
- Product images, names, descriptions, and prices.
- Product details and configurable options where needed.
- Quantity selection.
- Featured and promotional products.
- Mobile-first browsing experience.
- Direct QR Code access to the menu.

### Cart & Checkout
- Add, remove, and update cart items.
- Calculate order totals.
- Collect customer details and delivery notes.
- Support configurable delivery fees.
- Generate a structured WhatsApp order message.
- No online payment integration in the MVP.

### Dashboard
- Login page (username and password). Until the Laravel API exists, the initial account is set in server environment variables, never in the code.
- Manage products and categories.
- Edit prices and offers.
- Select featured or best-selling products manually.
- Manage customer reviews.
- Edit the hero texts and the About section.
- Preview changes where it helps (inside the edit forms). Public pages stay Server Components.
- Clear, designed Arabic messages for errors returned by the backend.

Until the API is connected, the dashboard works on mock data with browser-based persistence; these changes are local to the browser and are not shared with customers. Once connected, it reads and writes through the Laravel API.

## 4. Interactive Hero Motion

The hero should support different animation experiences depending on the restaurant identity.

Examples:

- Shawarma: a realistic rotating vertical skewer.
- Burger: ingredients separating into layers and assembling again.
- Pizza: smooth rotation with optional 3D movement.

Evaluate Three.js, React Three Fiber, Drei, CSS animation, and GSAP according to the specific interaction.

Do not assume every animation requires 3D.

Requirements:
- Smooth animation.
- High visual quality.
- Good mobile performance.
- Reduced-motion accessibility support.
- Static fallback for unsupported or low-performance devices.
- Isolated and reusable motion components.

## 5. Data Architecture

Separate UI components from data sources.

Use:
- TypeScript types for domain models.
- Local mock data for development.
- Services or repositories for data access.
- Stable interfaces for future API integration.
- Clear loading, empty, and error states where relevant.

Components should not depend directly on the internal structure of mock data files.

## 6. Design Requirements

- Premium, modern restaurant aesthetic.
- Mobile-first and fully responsive.
- Arabic RTL support.
- Reusable UI components.
- Customizable colors, fonts, images, and branding.
- Consistent spacing, typography, and interaction patterns.
- Accessible navigation and controls.

The initial Ahl Al Karam theme uses dark charcoal backgrounds, warm orange accents, and expressive Arabic typography.

## 7. Technical Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- React Icons
- Three.js / React Three Fiber where justified
- Mock Data (until the API is connected)
- Browser persistence for the dashboard before the API
- Backend: Laravel REST API (separate developer)

Additional dependencies require justification before installation.

## 8. Development Principles

- Reuse and improve existing code when appropriate.
- Avoid unnecessary rewrites.
- Prefer simple, readable, maintainable solutions.
- Use Server Components by default when suitable.
- Use Client Components for browser interactions.
- Keep business logic separate from presentation.
- Explain important architectural decisions.
- Implement and review features incrementally.
- Do not modify unrelated files.
- Validate changes using lint, type checking, and build.

## 9. Future Development

The backend is Laravel. Its database design, authentication details, and API contract are owned by the backend developer and are not finalized; the frontend proposes what it needs (API-CONTRACT.md) and adapts in `services/` and the dashboard repository.

Do not build backend logic or a database in the frontend.

## 10. Immediate Priority

Before developing new features:

1. Audit the existing project.
2. Identify architecture problems, unused files, duplicated code, dependency issues, and incomplete features.
3. Compare the existing implementation with these requirements.
4. Propose a safe cleanup and refactoring plan.
5. Wait for approval before making modifications.