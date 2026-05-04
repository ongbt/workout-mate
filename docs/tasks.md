# Tasks

## High — Missing infrastructure

- [x] **README.md** — How to run + project overview (required by global rules)
- [x] **LICENSE** — Add license file at project root
- [x] **Husky + lint-staged** — Pre-commit hook for linting on staged files
- [x] **E2E tests** — Add `playwright.config.ts`, `e2e/` directory, auth + home specs
- [x] **E2E in CI** — Add `e2e` job to `.github/workflows/ci.yml` (needs `check` job)

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

## Medium — Architecture & UX (from Pingo reconciliation)

- [x] **`cn()` utility** — Add `clsx` + `tailwind-merge`, create `src/lib/utils.ts` with `cn()` helper. Replace all template-literal class merging across components.
- [x] **`@/*` path alias** — Add to `tsconfig.app.json` (`paths`) and `vite.config.ts` (`resolve.alias`). Replace deep relative imports (`../../components/Layout`) with `@/components/Layout`.
- [x] **`strictPort: true`** — Add `server.port: 5173` + `server.strictPort: true` to `vite.config.ts` so dev fails fast instead of silently picking another port.
- [x] **Prettier** — Add `prettier` + `prettier-plugin-tailwindcss` as devDeps. Create `.prettierrc` and `.prettierignore`. Add `format`/`format:check` scripts to `package.json`. Add `format:check` to CI workflow. Update `lint-staged` to run Prettier on staged files.
- [ ] **Framer Motion** — Add `framer-motion` dependency. Animate phase transitions in `WorkoutActiveScreen` (idle → exercise → rest → finished) using `AnimatePresence` + `motion.div`. Animate timer display, phase indicator, and finished screen.
- [ ] **Centralized auth hook** — Create `src/hooks/useAuth.ts` that wraps `useConvexAuth` + user profile query. Components should import `useAuth` instead of calling `useConvexAuth`/`useAuthActions` directly.
- [ ] **Error handling UI** — Create reusable `ErrorDialog` component (animated modal with title, message, close). Create `ErrorBoundary` class component and wrap the router. Wrap all mutation calls in try/catch with error dialog state.
- [x] **Lazy-loaded routes** — Wrap each screen import in `React.lazy()` in `App.tsx`. Wrap `Routes` in a second `Suspense` with `PageSpinner` fallback. Extract `PageSpinner` into a shared component.
- [ ] **Multi-provider auth** — Add `Password` and `Anonymous` providers to `convex/auth.ts` (alongside existing Google). Add `signIn('password', {...})` and `signIn('anonymous')` flows to `LoginScreen`.
- [x] **Multi-browser E2E** — Add Firefox project to `playwright.config.ts`. Optionally add `mobile-chrome` (Pixel 5) for mobile-specific testing.
- [x] **Convex `users.ts` module** — Add `currentUser` query in `convex/users.ts` (for the centralized `useAuth` hook). Add `updateProfile` mutation.
- [x] **Convex naming audit** — Ensure all Convex column names use `camelCase` consistently across schema and frontend types.

## Low — Misc

- [x] **`public/robots.txt`** — Add robots.txt
- [ ] **Rate limiting** — Add rate limiting on public Convex write endpoints
