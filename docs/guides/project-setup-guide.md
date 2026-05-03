# AI Project Setup Guide — React + Convex + Cloudflare Pages + Google Auth

This guide documents the exact steps and conventions for spinning up a new project
with the following stack, derived from the **Workout Mate** project:

- **Frontend**: React 19 + Vite + TypeScript (strict)
- **Backend**: Convex (database, serverless functions, real-time)
- **Auth**: Google OAuth via `@convex-dev/auth`
- **CI**: GitHub Actions (build, lint, test)
- **Deploy**: Cloudflare Pages (connected to GitHub, custom domain, `pnpm build`)
- **Testing**: Vitest (unit) + Playwright (e2e)

---

## 1. Project Scaffold

### 1.1 Create the project

```bash
pnpm create vite@latest <project-name> --template react-ts
cd <project-name>
```

### 1.2 Install core dependencies

```bash
pnpm add react react-dom react-router-dom
pnpm add convex @convex-dev/auth @auth/core
pnpm add -D vite typescript @vitejs/plugin-react
```

### 1.3 Install Tailwind CSS v4

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

### 1.4 Install testing dependencies

```bash
# Unit tests (Vitest + happy-dom)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom happy-dom

# E2E tests (Playwright)
pnpm add -D @playwright/test
npx playwright install --with-deps
```

### 1.5 Install linting

```bash
pnpm add -D eslint @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

### 1.6 Install PWA support (optional but recommended for mobile-first apps)

```bash
pnpm add -D vite-plugin-pwa workbox-window
```

### 1.7 Install Cloudflare tooling

```bash
pnpm add -D wrangler
```

---

## 2. package.json Scripts

```jsonc
{
  "name": "<project-name>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "deploy:staging": "wrangler pages deploy dist --branch staging",
    "deploy:prod": "wrangler pages deploy dist --branch main"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "workerd"]
  }
}
```

Key points:
- `build` runs `tsc -b` **before** `vite build` for type-checking.
- `test` runs Vitest headless; `test:watch` for development.
- `deploy:staging` and `deploy:prod` are manual CLI deploys. In practice, Cloudflare
  Pages auto-deploys from GitHub branches (see §4).

---

## 3. TypeScript Configuration

Use three tsconfig files with **project references**:

### 3.1 `tsconfig.json` (root)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 3.2 `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

Key flags:
- `strict: true` — non-negotiable.
- `noUncheckedIndexedAccess` — catches undefined from index access.
- `noUnusedLocals` / `noUnusedParameters` — keeps code clean.
- `verbatimModuleSyntax` — enforces explicit `import type`.
- `erasableSyntaxOnly` — bans enums, namespaces (TypeScript 6+).

### 3.3 `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 4. Vite Configuration

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

If adding PWA (recommended for mobile-first):

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// Inside plugins array:
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg'],
  manifest: {
    name: '<App Name>',
    short_name: '<ShortName>',
    description: '<description>',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,woff2}'],
  },
})
```

---

## 5. ESLint Configuration

Use the **flat config** format (`eslint.config.js`):

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
```

---

## 6. `.gitignore`

```
# Dependencies
node_modules

# Build output
dist
dist-ssr

# Environment files (secrets)
.env
.env.local
.env.*.local

# Google OAuth client secret
client_secret_*.json

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
```

---

## 7. Unit Tests (Vitest)

### 7.1 Directory structure

```
tests/
  setup.ts          ← Global setup (auto-cleanup, jest-dom matchers)
  components/       ← Component tests mirroring src/components/
  hooks/            ← Hook tests mirroring src/hooks/
  utils/            ← Utility tests mirroring src/utils/
```

### 7.2 Test setup file (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

### 7.3 Test patterns

- **Environment**: `happy-dom` (configured in `vite.config.ts`).
- **Component tests**: Use `@testing-library/react` (`render`, `screen`, `fireEvent`).
- **Hook tests**: Use `renderHook` from `@testing-library/react`.
- **Timer tests**: Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()`.
- **Naming**: `*.test.ts` for logic, `*.test.tsx` for components.

---

## 8. E2E Tests (Playwright)

### 8.1 Playwright config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 8.2 E2E test structure

```
e2e/
  auth.spec.ts       ← Google sign-in flows
  home.spec.ts       ← Main page interactions
  <feature>.spec.ts  ← One file per feature area
```

---

## 9. GitHub Repository & CI

### 9.1 Create repo and push

```bash
gh repo create <org>/<project-name> --private --source=. --remote=origin --push
```

### 9.2 CI workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main, staging]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm lint
      - run: pnpm test -- run

  e2e:
    runs-on: ubuntu-latest
    needs: check
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps chromium
      - run: pnpm test:e2e
```

Notes:
- `check` and `e2e` run in parallel for speed; `check` includes build + lint + unit tests.
- E2E installs Playwright browsers in CI (`--with-deps` for system deps).
- Both branches (`main` and `staging`) trigger CI on push and PR.

---

## 10. Cloudflare Pages Deployment

### 10.1 Initial setup

1. Create a Cloudflare Pages project connected to the GitHub repository.
2. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
3. Add a custom domain in Cloudflare Pages dashboard (e.g., `app.example.com`).

### 10.2 Branch deployment strategy

| Git Branch | Cloudflare Environment | Convex Backend |
|---|---|---|
| `staging` | Preview deployment (staging URL) | Dev Convex (`dev:<slug>`) |
| `main` | Production (custom domain) | Prod Convex (`prod:<slug>`) |

Cloudflare Pages auto-deploys on push to these branches — no manual `wrangler deploy` needed
for routine pushes. The CLI deploy commands are available as fallbacks:

```bash
pnpm deploy:staging  # wrangler pages deploy dist --branch staging
pnpm deploy:prod     # wrangler pages deploy dist --branch main
```

### 10.3 Environment variables in Cloudflare

Set these in the Cloudflare Pages dashboard (per-environment):

| Variable | Staging Value | Production Value |
|---|---|---|
| `VITE_CONVEX_URL` | `https://<dev-slug>.convex.cloud` | `https://<prod-slug>.convex.cloud` |
| `VITE_CONVEX_SITE_URL` | `https://<dev-slug>.convex.site` | `https://<prod-slug>.convex.site` |

Do **not** put these in `wrangler.toml` — manage them via the Cloudflare Pages UI
so they differ per branch/deployment.

### 10.4 `wrangler.toml`

```toml
[pages]
build_dir = "dist"
build_command = "pnpm build"
```

### 10.5 Cloudflare Pages `_redirects` (if using SPA routing)

Create `public/_redirects`:

```
/*    /index.html   200
```

This is **not needed** if using HashRouter (like Workout Mate). If you use
BrowserRouter with React Router, this file is required for SPA fallback.

---

## 11. Convex Setup

### 11.1 Create Convex project

```bash
npx convex dev --configure
```

This interactively creates a project in your Convex team and generates `.env.local`
with the `CONVEX_DEPLOYMENT` variable.

### 11.2 `convex.json`

```json
{
  "project": "",
  "team": ""
}
```

Leave `project` and `team` empty — they are resolved from the environment
(`CONVEX_DEPLOYMENT` in `.env.*`).

### 11.3 Environment files

#### `.env.local` (local dev — loaded by default)

```env
VITE_CONVEX_URL=https://<dev-slug>.convex.cloud
CONVEX_DEPLOYMENT=dev:<dev-slug>
VITE_CONVEX_SITE_URL=https://<dev-slug>.convex.site
```

#### `.env.staging` (staging — same Convex dev deployment)

```env
VITE_CONVEX_URL=https://<dev-slug>.convex.cloud
CONVEX_DEPLOYMENT=dev:<dev-slug>
VITE_CONVEX_SITE_URL=https://<dev-slug>.convex.site
```

#### `.env.production` (production)

```env
VITE_CONVEX_URL=https://<prod-slug>.convex.cloud
CONVEX_DEPLOYMENT=prod:<prod-slug>
VITE_CONVEX_SITE_URL=https://<prod-slug>.convex.site
```

**Key env vars explained:**
- `VITE_CONVEX_URL` — The Convex deployment URL (`.convex.cloud`). Used by the
  React client.
- `VITE_CONVEX_SITE_URL` — The Convex site URL (`.convex.site`). Used by the auth
  config for the OAuth callback domain.
- `CONVEX_DEPLOYMENT` — `dev:<slug>` or `prod:<slug>`. Used by the Convex CLI
  (`npx convex dev`, `npx convex deploy`, `npx convex env set`).

### 11.4 Deploy Convex

```bash
# Deploy to dev
npx convex deploy --env-file .env.local

# Deploy to prod
npx convex deploy --env-file .env.production
```

### 11.5 Seed data (optional)

The Workout Mate pattern uses a `seedDefaults` mutation that checks for existing
data before inserting. Invoke it from the Convex dashboard or via a one-shot script:

```typescript
// In a mutation like convex/<module>.ts:seedDefaults
export const seedDefaults = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("<table>").first()
    if (existing) return
    for (const record of DEFAULT_RECORDS) {
      await ctx.db.insert("<table>", record)
    }
  },
})
```

---

## 12. Google OAuth Authentication

### 12.1 Google Cloud Console setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a **Web Application** OAuth 2.0 Client ID.
3. Add authorized JavaScript origins:
   - `http://localhost:5173` (local dev)
   - `https://<dev-slug>.convex.site` (dev Convex)
   - `https://<prod-slug>.convex.site` (prod Convex)
   - `https://<your-custom-domain>` (production URL)
4. Add authorized redirect URIs:
   - `http://localhost:5173/api/auth/callback/google`
   - `https://<dev-slug>.convex.site/api/auth/callback/google`
   - `https://<prod-slug>.convex.site/api/auth/callback/google`
   - `https://<your-custom-domain>/api/auth/callback/google`
5. Download the credentials JSON (named `client_secret_*.apps.googleusercontent.com.json`).

**Important**: All environments (dev, staging, prod) can share the **same** OAuth
client. Add all URLs as authorized origins/redirects on the single client.

### 12.2 Store Google client secret in Convex

```bash
# Set in dev Convex
npx convex env set AUTH_GOOGLE_ID="<client_id>" --env-file .env.local
npx convex env set AUTH_GOOGLE_SECRET="<client_secret>" --env-file .env.local

# Set in prod Convex
npx convex env set AUTH_GOOGLE_ID="<client_id>" --env-file .env.production
npx convex env set AUTH_GOOGLE_SECRET="<client_secret>" --env-file .env.production
```

Get the `client_id` and `client_secret` from the downloaded JSON file.

### 12.3 Convex auth files

#### `convex/auth.ts`

```typescript
import Google from "@auth/core/providers/google"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
})
```

#### `convex/auth.config.ts`

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
}
```

#### `convex/http.ts`

```typescript
import { httpRouter } from "convex/server"
import { auth } from "./auth"

const http = httpRouter()
auth.addHttpRoutes(http)

export default http
```

### 12.4 Convex schema — include auth tables

In `convex/schema.ts`, spread `authTables` into your schema:

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  // Your tables go here, e.g.:
  items: defineTable({
    name: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
})
```

### 12.5 React auth wrapper (`src/main.tsx`)

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'

const convex = new ConvexReactClient(import.meta.env['VITE_CONVEX_URL']!)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
)
```

### 12.6 Auth helper — generate JWT keys (optional)

If your app needs JWT signing (e.g., custom tokens), create `scripts/gen-jwt.mjs`:

```javascript
import { exportJWK, exportPKCS8, generateKeyPair } from "jose"

const keys = await generateKeyPair("RS256", { extractable: true })
const privateKey = await exportPKCS8(keys.privateKey)
const publicKey = await exportJWK(keys.publicKey)
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] })

console.log(`JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"`)
console.log(`JWKS=${jwks}`)
```

Run: `node .\scripts\gen-jwt.mjs`

### 12.7 Login screen pattern

```tsx
import { useAuthActions } from "@convex-dev/auth/react"

function LoginScreen() {
  const { signIn } = useAuthActions()
  return (
    <button onClick={() => signIn("google")}>
      Sign in with Google
    </button>
  )
}
```

### 12.8 Convex Auth env vars summary

These must be set in **Convex** (via `npx convex env set`), not in `.env` files:

| Variable | Source |
|---|---|
| `AUTH_GOOGLE_ID` | `client_id` from the downloaded JSON |
| `AUTH_GOOGLE_SECRET` | `client_secret` from the downloaded JSON |

These are set per-deployment (dev and prod separately).

---

## 13. Environment Matrix

| Environment | Vite `.env` file | Convex Deployment | Cloudflare Pages |
|---|---|---|---|
| **Local Dev** | `.env.local` | `dev:<slug>` | `pnpm dev` (localhost) |
| **Staging** | `.env.staging` | `dev:<slug>` (same as dev) | Preview URL (staging branch) |
| **Production** | `.env.production` | `prod:<slug>` | Custom domain (main branch) |

---

## 14. Git Branching & Environment Strategy

This section explains how GitHub branches drive both Convex and Cloudflare deployments,
and how to work within this model day to day.

### 14.1 The Big Picture

```
GitHub branches         Convex deployments        Cloudflare Pages
─────────────────      ──────────────────        ─────────────────
main ──────────────►   prod:<slug>───────────►   Production (custom domain)
staging ───────────►   dev:<slug>────────────►   Preview (staging URL)
feature/* ─────────►   (local dev only) ─────►   (not deployed)
```

**Key rule**: the Git branch determines EVERYTHING — which Convex backend the
frontend talks to, and which Cloudflare environment serves the app.

### 14.2 Branch Conventions

| Branch | Purpose | Deploys to | Backend |
|---|---|---|---|
| `main` | Production code, always shippable | Cloudflare Pages production | Convex `prod:<slug>` |
| `staging` | Pre-production validation | Cloudflare Pages preview | Convex `dev:<slug>` |
| `feature/*` | Active development work | None (run `pnpm dev` locally) | Local Convex dev server |

**Rules**:
- `main` is protected — all changes arrive via PR.
- `staging` is the integration branch. PR feature branches into `staging`,
  verify everything works, then promote `staging` → `main` via a second PR.
- Never push directly to `main` or `staging`. Always work on feature branches.
- Squash-merge keeps history clean on both branches.

### 14.3 How the Vite Build Picks the Right Backend

During `pnpm build`, Vite reads `VITE_CONVEX_URL` from the environment. The
build-time value is baked into the static bundle.

Cloudflare Pages sets this variable per-deployment in its dashboard (§10.3).
When a push to `staging` triggers a build, Cloudflare injects the staging
`VITE_CONVEX_URL` (pointing at `dev:<slug>`). When a push to `main` triggers a
build, it injects the production `VITE_CONVEX_URL` (pointing at `prod:<slug>`).

This means the **same source code** produces two different builds — one talking
to dev Convex, one talking to prod Convex — purely from the env var.

### 14.4 Daily Workflow

#### Starting a new feature

```bash
git checkout staging
git pull origin staging
git checkout -b feature/my-feature
pnpm dev                          # uses .env.local → dev Convex
```

#### Deploying a backend change (Convex schema, functions, mutations)

Convex deploys are **orthogonal to Git branches**. You deploy Convex separately
with `npx convex deploy`:

```bash
# While on your feature branch:

# Deploy backend changes to dev for testing
npx convex deploy --env-file .env.local

# Once the PR merges to staging, deploy to dev again
# (ensures dev matches what staging expects)
npx convex deploy --env-file .env.staging

# When the PR merges to main, deploy to prod
npx convex deploy --env-file .env.production
```

**Important**: Deploy Convex backend changes **before** (or at the same time as)
the frontend PR that depends on them. The frontend build in Cloudflare will use
whatever the Convex schema looks like at build time, but the runtime behavior
depends on the currently deployed Convex code.

#### Merging to staging

```bash
# 1. Push your feature branch
git push origin feature/my-feature

# 2. Create a PR from feature/my-feature → staging
gh pr create --base staging --head feature/my-feature --title "feat: ..."

# 3. After PR review and CI passes, squash-merge into staging
# Cloudflare auto-deploys the staging preview with VITE_CONVEX_URL → dev Convex

# 4. Verify everything works on the staging preview URL
```

#### Promoting staging to main

```bash
# 1. Create a PR from staging → main
gh pr create --base main --head staging --title "Release: staging → main"

# 2. Merge after CI passes
# Cloudflare auto-deploys to production with VITE_CONVEX_URL → prod Convex

# 3. Deploy Convex backend to prod if there are backend changes
npx convex deploy --env-file .env.production
```

### 14.5 Environment Variable Management

#### In Convex (backend secrets)

Set per-deployment with `npx convex env set`:

```bash
# Dev
npx convex env set AUTH_GOOGLE_ID="..." --env-file .env.local
npx convex env set AUTH_GOOGLE_SECRET="..." --env-file .env.local

# Prod
npx convex env set AUTH_GOOGLE_ID="..." --env-file .env.production
npx convex env set AUTH_GOOGLE_SECRET="..." --env-file .env.production
```

Convex env vars are **not** in Git — they are stored encrypted in Convex Cloud.

#### In Cloudflare Pages (frontend build vars)

Set via Cloudflare Pages dashboard → Settings → Environment variables.
Configure separately for the `staging` and `main` branch deployments:

- `VITE_CONVEX_URL` — different per branch
- `VITE_CONVEX_SITE_URL` — different per branch

These are build-time variables that get baked into the static bundle.

#### Why staging uses dev Convex

Both `staging` and local dev share the **same** Convex deployment (`dev:<slug>`).
This is intentional:

- Feature development happens against dev Convex.
- Staging is a "dressed rehearsal" using the same dev backend — the frontend
  is built and served by Cloudflare (matching prod infra), but the backend is
  dev, so you can test end-to-end without risking prod data.
- If you need a separate Convex deployment for staging, create a second Convex
  project. In practice, dev Convex is sufficient for most teams.

### 14.6 Coordinating Frontend + Backend Changes

When a change touches both the frontend (React) and backend (Convex):

1. **Deploy Convex to dev first.** This makes the new mutations/actions/schema
   available so the staging frontend can use them.
2. **Merge the frontend PR to staging.** Cloudflare builds with the staging
   `VITE_CONVEX_URL`, which points at dev Convex (where the new backend code
   already lives).
3. **Verify on staging preview URL.**
4. **Merge staging → main.**
5. **Deploy Convex to prod.** Do this immediately after the main merge so the
   production frontend never talks to a backend that's missing the new code.

**Rollback note**: Convex keeps old function versions around briefly.
Cloudflare Pages keeps previous deploys available for instant rollback.
If something breaks, roll back Cloudflare Pages first (instant), then
revert the Convex deploy if needed.

---

## 15. Quick-Start Checklist

When creating a new project, follow this order:

1. [ ] `pnpm create vite@latest <name> --template react-ts`
2. [ ] Install all dependencies (§1.2–1.7)
3. [ ] Configure `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` (§3)
4. [ ] Configure `vite.config.ts` with plugins + test config (§4)
5. [ ] Configure `eslint.config.js` (§5)
6. [ ] Create `.gitignore` (§6)
7. [ ] Set up `tests/setup.ts` + `playwright.config.ts` (§7–8)
8. [ ] `gh repo create` + push initial commit (§9.1)
9. [ ] Create `.github/workflows/ci.yml` (§9.2)
10. [ ] `npx convex dev --configure` + deploy to dev (§11.1)
11. [ ] Create `.env.local`, `.env.staging`, `.env.production` (§11.3)
12. [ ] Create Google OAuth client (§12.1) and download JSON
13. [ ] Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex (§12.2)
14. [ ] Create Convex auth files (`auth.ts`, `auth.config.ts`, `http.ts`) (§12.3)
15. [ ] Wire up `main.tsx` with `ConvexAuthProvider` (§12.5)
16. [ ] Create Convex schema with `authTables` spread (§12.4)
17. [ ] Create Cloudflare Pages project + connect GitHub (§10.1)
18. [ ] Set env vars in Cloudflare Pages dashboard (§10.3)
19. [ ] Add custom domain in Cloudflare Pages (§10.1)
20. [ ] Push branch — verify CI passes + Cloudflare deploys
