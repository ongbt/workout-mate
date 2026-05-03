# Tasks

## High — Missing infrastructure

- [x] **README.md** — How to run + project overview (required by global rules)
- [x] **LICENSE** — Add license file at project root
- [x] **Husky + lint-staged** — Pre-commit hook for linting on staged files
- [ ] **E2E tests** — Add `playwright.config.ts`, `e2e/` directory, auth + home specs
- [ ] **E2E in CI** — Add `e2e` job to `.github/workflows/ci.yml` (needs `check` job)

## Medium — Missing services

- [ ] **Sentry** — Error tracking (`@sentry/react`)
- [ ] **GA4** — Acquisition analytics with consent gating
- [ ] **PostHog** — Product analytics
- [x] **i18next** — Internationalization (mandatory per global rules)
- [x] **CSP** — `public/_headers` with strict Content Security Policy

## Medium — Missing routes

- [x] **`/privacy` route** — Privacy policy page
- [x] **`/terms` route** — Terms of service page
- [ ] **"Delete Account"** — Remove PII, propagate to analytics

## Low — Testing & SEO

- [x] **Test coverage** — Expand from 4 test files toward 80-90% unit / 60-80% integration
- [x] **SEO** — Add `<meta name="description">` to `index.html`, per-page title management
- [ ] **Dark/Light theme** — Add `dark:` Tailwind classes and theme toggle

## Low — Misc

- [x] **`public/robots.txt`** — Add robots.txt
- [ ] **Rate limiting** — Add rate limiting on public Convex write endpoints
