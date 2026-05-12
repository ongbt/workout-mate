# Tasks

## High — Missing infrastructure (from global rules)

- [x] **Sentry** — Error tracking (`@sentry/react`). Init in `main.tsx` with DSN from env var. Add error boundary integration.
- [x] **GA4** — Acquisition analytics with consent gating. Add consent banner (opt-in, not implied) before any GA script loads. Follow GDPR minimum.
- [x] **PostHog** — Product analytics (feature flags, session recordings). Integrate alongside GA4 with same consent gate.

## High — Missing routes & data handling

- [ ] **"Delete Account"** — Mutation that removes all user PII (profile, workouts, auth record) and propagates deletion to Sentry, GA4, PostHog. Add UI in account/settings screen.

## Medium — Security

- [ ] **Rate limiting** — Add rate limiting on public Convex write endpoints. Use Convex's built-in rate limiting or a custom middleware pattern.
- [x] **Helmet CSP** — Set CSP via `react-helmet-async` on every route as defense-in-depth (already have `public/_headers` for Cloudflare).

## Medium — UX

- [ ] **Dark/Light theme** — Add `dark:` Tailwind classes. Theme toggle in Layout header. Persist preference (localStorage + system default via `prefers-color-scheme`). Add `<meta name="color-scheme">` to `index.html`.
- [ ] **Accessibility audit** — Run automated WCAG 2.1 AA check (axe-core or Lighthouse CI). Fix issues found. Add a11y check to CI.
- [ ] **PageSpinner** — Reusable full-page spinner component (§13.2). Replace inline spinner in `main.tsx` Suspense fallback.
- [ ] **ErrorState** — Reusable error state component with message + retry button (§36.4). Separate from `ErrorBoundary`/`ErrorDialog`.
- [ ] **Reduced motion** — Add `prefers-reduced-motion` media query to `src/index.css` (§37.5).

## Medium — Architecture

- [ ] **ADR directory** — Create `docs/adr/` with a README explaining when to use ADRs. File one ADR for the existing architecture decisions (HashRouter, Convex auth providers, PWA strategy).
- [x] **shadcn/ui init** — Run `npx shadcn@latest init` to create `components.json`. Enables adding shadcn/ui components via CLI (§11.1).

## Low — CI & DX

- [ ] **Lighthouse CI** — Add Lighthouse CI check to GitHub Actions (performance + a11y + SEO). Don't gate on non-deterministic scores; use it as an informational check.
- [ ] **Bundle size guard** — Add bundle size check to CI (e.g., `@actions/create-check` with a budget threshold) to catch regressions early.
- [ ] **CSS polish** — Add `scroll-behavior: smooth`, `::selection` with brand color, themed scrollbar, and body `transition` for theme changes to `src/index.css` (§41.3).
- [ ] **LoadingSkeleton** — Reusable skeleton component matching content shapes (§36.2).
- [ ] **.env.example files** — Create `.env.development.example` and `.env.production.example` with placeholder values (§8).

## Completed

- [x] README.md — How to run + project overview
- [x] Husky + lint-staged — Pre-commit hook for linting/formatting on staged files
- [x] Pre-push hook — `pnpm lint && pnpm format:check && pnpm test`
- [x] E2E tests — playwright.config.ts, e2e/ directory, auth + home specs, multi-browser (Chromium + Firefox)
- [x] E2E in CI — e2e job in .github/workflows/ci.yml
- [x] i18next — Internationalization with language detection
- [x] CSP — public/\_headers with strict Content Security Policy
- [x] /privacy route
- [x] /terms route
- [x] Test suite — 23 test files across unit, integration, and E2E
- [x] SEO — `<meta name="description">` in index.html, per-page title management via react-helmet-async
- [x] public/robots.txt
- [x] cn() utility — clsx + tailwind-merge in src/lib/utils.ts
- [x] @/\* path alias — tsconfig paths + vite resolve.alias
- [x] strictPort: true — vite.config.ts with port 5173
- [x] Prettier — .prettierrc, .prettierignore, format/format:check scripts, CI integration
- [x] Framer Motion — Phase transition animations in WorkoutActiveScreen
- [x] Centralized auth hook — src/hooks/useAuth.ts wrapping useConvexAuth
- [x] Error handling UI — ErrorBoundary + ErrorDialog with animations
- [x] Lazy-loaded routes — React.lazy() + Suspense in App.tsx
- [x] Multi-provider auth — Google, Password, Anonymous in convex/auth.ts
- [x] Convex users.ts — currentUser query + updateProfile mutation
- [x] Convex camelCase audit — All column names consistent
- [x] PWA — vite-plugin-pwa with autoUpdate, manifest, workbox
- [x] CI — GitHub Actions: build, lint, format:check, test, e2e with Playwright report upload
- [x] LICENSE — MIT license at project root
- [x] GA4 — Consent-gated analytics with GDPR-compliant opt-in banner, CSP updates, and env-configured measurement IDs
- [x] Sentry — Error tracking with @sentry/react, init in main.tsx, error boundary + ErrorContext integration, CSP updates
- [x] PostHog — Product analytics with feature flags and session recordings, consent-gated alongside GA4, CSP updates
- [x] Helmet CSP — CSP meta tag via react-helmet-async in Layout.tsx as defense-in-depth
