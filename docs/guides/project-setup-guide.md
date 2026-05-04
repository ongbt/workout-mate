# Project Setup Guide — React + Convex + Cloudflare Pages + Google Auth

This guide documents the canonical setup for new projects with this stack,
incorporating best practices from **Workout Mate** and **Pingo**:

- **Frontend**: React 19 + Vite + TypeScript (strict)
- **Backend**: Convex (database, serverless functions, real-time)
- **Auth**: Multi-provider via `@convex-dev/auth`
- **CI**: GitHub Actions (build, lint, test, E2E)
- **Deploy**: Cloudflare Pages (connected to GitHub, custom domain, `pnpm build`)
- **Testing**: Vitest (unit) + Playwright (E2E)

---

## 0. Guiding Principles

These rules apply to every new project. They're not optional — each is backed by
patterns proven across multiple Convex + React apps.

### 0.1 Universal rules

| Rule                                        | Why                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile` in CI      | Prevents silent lockfile drift between local and CI                                                                |
| `strictPort: true` in Vite config           | Prevents silent port switches that break WebSocket/OAuth redirects                                                 |
| `@/*` path alias                            | Eliminates `../../../` relative import chains                                                                      |
| `cn()` utility (clsx + tailwind-merge)      | Single source of truth for conditional classes; resolves Tailwind conflicts                                        |
| `React.lazy()` per route                    | Code-splits each page; costs 3 lines per route, pays for itself after 3 routes                                     |
| ESLint flat config                          | Legacy `.eslintrc` format is deprecated; flat config is the only forward path                                      |
| Pre-push lint + format + test gate          | Catches unformatted files and non-auto-fixable lint errors that `lint-staged` misses; blocks broken code before CI |
| Prettier with `prettier-plugin-tailwindcss` | Consistent formatting; Tailwind class sorting prevents diff noise                                                  |
| `html[lang]` synced to i18n                 | Required for accessibility and SEO                                                                                 |
| `<title>` + meta description per page       | Every route needs its own head tags (via `react-helmet-async`)                                                     |
| Privacy + Terms pages                       | Legal requirement for app stores, OAuth verification, and compliance                                               |
| Touch targets ≥ 44×44px                     | WCAG 2.1 AA minimum for mobile                                                                                     |
| `aria-label` on icon-only buttons           | Screen readers need labels                                                                                         |

### 0.2 Convex conventions

| Rule                               | Why                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `camelCase` column names in schema | Matches JS/TS convention; avoids impedance mismatch with frontend types                 |
| `camelCase` in frontend types      | Same reason — one convention across the stack                                           |
| Spread `authTables` in schema      | Required by `@convex-dev/auth` for user/session storage                                 |
| Ownership check in every mutation  | Every mutation that reads user data must verify `userId` matches the authenticated user |
| Idempotent seed mutations          | Check if data exists before inserting; safe to call repeatedly                          |
| Separate file per domain entity    | `users.ts`, `games.ts`, `sheets.ts` — not one monolithic `mutations.ts`                 |

### 0.3 Auth rules

| Rule                                  | Why                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Google OAuth + Email/Password minimum | Google-only excludes users; add password auth for reach                         |
| Anonymous auth for quick onboarding   | Let users try the app before committing to sign-up                              |
| Centralized `useAuth()` hook          | Wraps `useConvexAuth` + user profile query — one import everywhere              |
| Auth guard in `App.tsx`               | Single gate that checks `isLoading` / `isAuthenticated` before rendering routes |
| Client secret never committed         | `client_secret_*.json` in `.gitignore`; keys stored in Convex env vars          |

### 0.4 Error handling rules

| Rule                                 | Why                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Error boundary at router level       | Catches render crashes; shows recovery UI instead of white screen          |
| Reusable `ErrorDialog` component     | Consistent error presentation; one animation/accessibility pattern         |
| try/catch around every mutation call | Network failures, auth expiry, and Convex errors all surface through catch |

---

## 1. Project Scaffold

### 1.1 Create the project

```bash
pnpm create vite@latest <project-name> --template react-ts
cd <project-name>
```

### 1.2 Install core dependencies

```bash
# Runtime
pnpm add react react-dom react-router-dom
pnpm add convex @convex-dev/auth @auth/core

# UI utilities (required)
pnpm add clsx tailwind-merge

# Animations (strongly recommended for UX)
pnpm add framer-motion

# Icons
pnpm add lucide-react

# i18n (required — start early)
pnpm add i18next react-i18next i18next-browser-languagedetector

# SEO
pnpm add react-helmet-async

# Dev tooling
pnpm add -D vite typescript @vitejs/plugin-react
```

### 1.3 Install Tailwind CSS v4

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

No PostCSS config needed — Tailwind v4's Vite plugin handles everything.

### 1.4 Install testing dependencies

```bash
# Unit tests (Vitest + happy-dom)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom happy-dom

# E2E tests (Playwright)
pnpm add -D @playwright/test
npx playwright install --with-deps
```

### 1.5 Install linting & formatting

```bash
pnpm add -D eslint @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh globals

pnpm add -D prettier prettier-plugin-tailwindcss
```

### 1.6 Install PWA support (required for mobile-first apps)

```bash
pnpm add -D vite-plugin-pwa workbox-window
```

### 1.7 Install Cloudflare tooling

```bash
pnpm add -D wrangler
```

### 1.8 Install Git hooks

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

Husky creates hook scripts in `.husky/`. Two hooks are required:

**`.husky/pre-commit`** — auto-fix staged files:

```
pnpm exec lint-staged
```

**`.husky/pre-push`** — gate that runs full lint + format check + tests before push:

```
pnpm lint && pnpm format:check && pnpm test
```

Why three gates: `lint-staged` only runs on staged files (not the full project), and it
skips non-auto-fixable lint errors. Prettier auto-formats on commit via `lint-staged`,
but if someone bypasses the commit hook (e.g., `--no-verify`), the pre-push hook catches
unformatted files before CI. The test gate blocks broken code from reaching CI.

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
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "deploy:staging": "wrangler pages deploy dist --branch staging",
    "deploy:prod": "wrangler pages deploy dist --branch main",
    "prepare": "husky",
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "workerd"],
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md,html}": ["prettier --write"],
  },
}
```

Key points:

- `build` runs `tsc -b` **before** `vite build` for type-checking.
- `format` / `format:check` for Prettier.
- `prepare` runs Husky install after `pnpm install`.
- `lint-staged` runs both ESLint and Prettier on staged files.

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
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "tests"]
}
```

Key flags:

- `strict: true` — non-negotiable.
- `noUncheckedIndexedAccess` — catches undefined from index access (e.g., `arr[0]` could be undefined).
- `noPropertyAccessFromIndexSignature` — catches typos on dynamic objects.
- `noUnusedLocals` / `noUnusedParameters` — keeps code clean.
- `verbatimModuleSyntax` — enforces explicit `import type` (required for `erasableSyntaxOnly`).
- `erasableSyntaxOnly` — bans enums, namespaces (TypeScript 6+).
- `baseUrl` + `paths` — enables `@/` imports.

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
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

const isE2E = process.env['VITE_E2E'] === 'true';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Swap in E2E mocks when running Playwright
      ...(isE2E
        ? {
            'convex/react': path.resolve('e2e/mocks/convex-react.ts'),
            '@convex-dev/auth/react': path.resolve(
              'e2e/mocks/convex-auth-react.ts',
            ),
          }
        : {}),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
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
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/i18n/**',
      ],
    },
  },
});
```

Key additions over a bare scaffold:

- `@/*` path alias — use `import { Button } from '@/components/Button'` everywhere.
- E2E mock aliases — when `VITE_E2E=true`, Convex imports are swapped for mocks
  so E2E tests run without a real backend.
- `strictPort: true` — fails fast if port 5173 is busy instead of silently picking 5174.
- PWA configured with auto-update and standalone display.
- Coverage exclusions for boilerplate files.

---

## 5. ESLint Configuration

Use the **flat config** format (`eslint.config.js`):

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

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
]);
```

---

## 6. Prettier Configuration

### 6.1 `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 6.2 `.prettierignore`

```
node_modules
dist
coverage
pnpm-lock.yaml
convex/_generated
playwright-report
test-results
```

---

## 7. `.gitignore`

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

# Convex
.convex

# Playwright
playwright-report/
test-results/

# Claude local settings
.claude/settings.local.json

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
```

---

## 8. Environment Example Files

Always provide `.example` files so new developers know what env vars to set:

### 8.1 `.env.development.example`

```env
# Copy to .env.local and fill in values
VITE_CONVEX_URL=https://<dev-slug>.convex.cloud
VITE_CONVEX_SITE_URL=https://<dev-slug>.convex.site
CONVEX_DEPLOYMENT=dev:<dev-slug>
```

### 8.2 `.env.production.example`

```env
# Copy to .env.production and fill in values
VITE_CONVEX_URL=https://<prod-slug>.convex.cloud
VITE_CONVEX_SITE_URL=https://<prod-slug>.convex.site
CONVEX_DEPLOYMENT=prod:<prod-slug>
```

The `.gitignore` above allows `.example` files but blocks real env files.

---

## 9. Path Alias & Utility Setup

### 9.1 `src/lib/utils.ts` — `cn()` helper

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn()` for ALL conditional class names. Never use template literals:

```typescript
// Bad — fragile, no conflict resolution
className={`px-4 py-2 ${isActive ? 'bg-primary' : 'bg-surface'}`}

// Good — uses cn()
className={cn('px-4 py-2', isActive ? 'bg-primary' : 'bg-surface')}
```

### 9.2 Import convention

With `@/*` aliases, imports look like:

```typescript
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';
```

Never write `../../../` relative imports — use `@/` everywhere.

---

## 10. CSS Setup (Tailwind v4)

### 10.1 `src/index.css`

```css
@import 'tailwindcss';

@theme {
  --color-primary: #22c55e;
  --color-surface: #1e293b;
  --color-background: #0f172a;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
}

html,
body,
#root {
  @apply m-0 h-full w-full p-0;
}

body {
  @apply bg-background text-text font-sans antialiased;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Minimum touch target for accessibility */
button,
a {
  @apply min-h-[44px] min-w-[44px];
}

/* Safe area for notched phones */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Hide scrollbar but keep scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Remove number input spinners */
.no-spinner {
  -moz-appearance: textfield;
}
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
```

---

## 11. Entry Point & Provider Hierarchy

### 11.1 `src/main.tsx`

```typescript
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import './i18n'
import { LanguageWatcher } from '@/components/LanguageWatcher'
import App from './App'

const convex = new ConvexReactClient(import.meta.env['VITE_CONVEX_URL']!)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<PageSpinner />}>
      <HelmetProvider>
        <LanguageWatcher>
          <ConvexAuthProvider client={convex}>
            <App />
          </ConvexAuthProvider>
        </LanguageWatcher>
      </HelmetProvider>
    </Suspense>
  </StrictMode>,
)
```

Provider order (outermost → innermost):

1. `StrictMode` — React dev checks
2. `Suspense` — loading state while i18n initializes
3. `HelmetProvider` — per-page `<title>` / meta tags
4. `LanguageWatcher` — syncs `html[lang]` to i18n
5. `ConvexAuthProvider` — auth context
6. `App` — router + routes

---

## 12. App & Routing

### 12.1 `src/App.tsx` (auth guard + lazy routes)

```typescript
import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import { PageSpinner } from '@/components/PageSpinner'
import { LoginScreen } from '@/screens/LoginScreen'

// Route-level code splitting
const HomeScreen = lazy(() => import('@/screens/HomeScreen'))
const PrivacyScreen = lazy(() => import('@/screens/PrivacyScreen'))
const TermsScreen = lazy(() => import('@/screens/TermsScreen'))
// ... other routes

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth()

  if (isLoading) return <PageSpinner />
  if (!isAuthenticated) return <LoginScreen />

  return (
    <HashRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/privacy" element={<PrivacyScreen />} />
          <Route path="/terms" element={<TermsScreen />} />
          {/* ... */}
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
```

Key patterns:

- **HashRouter** — works on Cloudflare Pages without `_redirects` SPA fallback.
- **Auth guard at App level** — one gate, not scattered across pages.
- **`React.lazy()` per route** — each screen is its own chunk.
- **Shared `PageSpinner`** — one loading component, consistent everywhere.

### 12.2 `PageSpinner` component

```typescript
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
```

---

## 13. Centralized Auth Hook

### 13.1 `src/hooks/useAuth.ts`

```typescript
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut: convexSignOut } = useAuthActions();

  const user = useQuery(api.users.currentUser);

  const profile = user
    ? {
        id: user._id,
        name: user.name ?? 'Anonymous',
        avatarUrl: user.image ?? null,
      }
    : null;

  const signOut = async () => {
    await convexSignOut();
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signOut,
  };
}
```

This hook is the **single import** for auth state everywhere in the app.
Individual components never call `useConvexAuth` or `useAuthActions` directly —
they import `useAuth` from `@/hooks/useAuth`.

---

## 14. i18n Setup

### 14.1 `src/i18n/index.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from './en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    load: 'languageOnly',
    keySeparator: false,
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### 14.2 `src/i18n/en.ts`

Organize translations by domain:

```typescript
export const en = {
  'app.title': 'My App',
  'app.tagline': 'A short description',

  'actions.save': 'Save',
  'actions.cancel': 'Cancel',
  'actions.delete': 'Delete',
  'actions.signOut': 'Sign out',
  'actions.signInWithGoogle': 'Sign in with Google',

  'screens.home.pageTitle': 'Home | My App',
  'screens.home.pageDescription': 'Description for SEO',

  'components.emptyState.noData': 'Nothing here yet',
  'components.emptyState.description': 'Create your first item to get started',
};
```

Rules:

- Keys use dot notation for namespacing: `domain.component.key`.
- Every page has `pageTitle` and `pageDescription` keys for SEO.
- Start with English only; add other languages when needed.
- **Never hardcode user-facing strings in JSX** — always use `t('key')`.

### 14.3 `LanguageWatcher` component

```typescript
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function LanguageWatcher({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return <>{children}</>
}
```

---

## 15. SEO — Per-Page Meta Tags

Every screen sets its own `<title>` and `<meta description>` via `react-helmet-async`:

```typescript
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

export function HomeScreen() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('screens.home.pageTitle')}</title>
        <meta name="description" content={t('screens.home.pageDescription')} />
      </Helmet>
      {/* page content */}
    </>
  )
}
```

Also set global defaults in `index.html` (Open Graph, Twitter cards, structured data).

---

## 16. Error Handling

### 16.1 Error Boundary

```typescript
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-5">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-sm text-text-muted text-center">
            {this.state.error.message}
          </p>
          <button
            onClick={() => {
              this.setState({ error: null })
              window.location.reload()
            }}
            className="px-6 py-3 rounded-xl bg-primary text-background font-semibold"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap the router in `ErrorBoundary`:

```typescript
<HashRouter>
  <ErrorBoundary>
    <Suspense fallback={<PageSpinner />}>
      <Routes>...</Routes>
    </Suspense>
  </ErrorBoundary>
</HashRouter>
```

### 16.2 Mutation error handling

Every mutation call must handle errors:

```typescript
const createItem = useMutation(api.items.create);

const handleCreate = async (data: ItemData) => {
  try {
    await createItem(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    setDialog({ title: 'Failed to create', message });
  }
};
```

### 16.3 `ErrorDialog` component

```typescript
interface ErrorDialogProps {
  open: boolean
  title: string
  message: string
  onClose: () => void
}

export function ErrorDialog({ open, title, message, onClose }: ErrorDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-surface rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-text-muted">{message}</p>
        <button
          onClick={onClose}
          className="py-3 rounded-xl bg-primary text-background font-semibold"
        >
          OK
        </button>
      </div>
    </div>
  )
}
```

---

## 17. Privacy & Terms Pages

Every project must have these routes (required for OAuth verification, app stores, legal):

- `/privacy` — Privacy Policy with sections: data we collect, how we use data, data storage, third-party services, account deletion, contact.
- `/terms` — Terms of Service with sections: acceptance, description of service, user responsibilities, limitation of liability, changes, contact.

Store the content in i18n keys, not hardcoded HTML. See Workout Mate's
`src/i18n/index.ts` for the full structure.

---

## 18. Unit Tests (Vitest)

### 18.1 Directory structure

Two valid options — pick one and use it consistently across all projects:

**Option A: Separate `tests/` directory** (Workout Mate style)

```
tests/
  setup.ts
  components/
  hooks/
  utils/
  screens/
  integration/
```

**Option B: Co-located tests** (Pingo style)

```
src/
  components/
    Button.tsx
    Button.test.tsx
  hooks/
    useTimer.ts
    useTimer.test.ts
```

Either is fine. The guide uses Option A for consistency with the scaffold.

### 18.2 Test setup file (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock i18n globally so tests don't need real translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

afterEach(() => {
  cleanup();
});
```

### 18.3 Test patterns

- **Environment**: `happy-dom` (configured in `vite.config.ts`).
- **Component tests**: `render`, `screen`, `fireEvent` from `@testing-library/react`.
- **Hook tests**: `renderHook` from `@testing-library/react`.
- **Timer tests**: `vi.useFakeTimers()` + `vi.advanceTimersByTime()`.
- **Router tests**: Wrap in `MemoryRouter` with `initialEntries`.
- **Convex tests**: Mock `useQuery` / `useMutation` at the module level.
- **Naming**: `*.test.ts` for logic, `*.test.tsx` for components.

---

## 19. E2E Tests (Playwright)

### 19.1 Playwright config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Add these as CI capacity allows:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 30_000,
    env: {
      VITE_E2E: 'true',
    },
  },
  testMatch: '**/*.spec.ts',
});
```

### 19.2 E2E mock infrastructure

When `VITE_E2E=true`, the Vite config swaps Convex imports for local mocks.
Create these mock files:

**`e2e/mocks/convex-react.ts`** — mocks `ConvexReactClient`, `useQuery`, `useMutation`, `useConvexAuth`

**`e2e/mocks/convex-auth-react.ts`** — mocks `ConvexAuthProvider`, `useAuthActions`, `signIn`

This lets E2E tests run without a real Convex backend — faster, deterministic,
and works in CI without secrets. For critical flows (auth, real-time sync),
add a separate `e2e:integration` script that runs against the real Convex dev server.

### 19.3 E2E directory structure

```
e2e/
  mocks/
    convex-react.ts
    convex-auth-react.ts
  types.ts
  home.spec.ts
  auth.spec.ts
  <feature>.spec.ts
```

---

## 20. Convex Backend Setup

### 20.1 Create Convex project

```bash
npx convex dev --configure
```

This interactively creates a project in your Convex team and generates `.env.local`
with the `CONVEX_DEPLOYMENT` variable.

### 20.2 `convex.json`

```json
{
  "project": "",
  "team": ""
}
```

### 20.3 Schema (`convex/schema.ts`)

Use `camelCase` for all column names:

```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  items: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_owner', ['ownerId'])
    .index('by_public', ['isPublic']),
});
```

Rules:

- Always spread `authTables` — required by `@convex-dev/auth`.
- Use `camelCase` for column names.
- Add indexes for every query pattern you'll use.
- Use `v.optional()` for nullable fields (not `v.union(v.null(), ...)`).
- Timestamps use `v.number()` (Unix ms), not `v.string()`.

### 20.4 Auth (`convex/auth.ts`)

```typescript
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { Anonymous } from '@convex-dev/auth/providers/Anonymous';
import { convexAuth } from '@convex-dev/auth/server';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google, Password, Anonymous],
});
```

Provide at minimum Google + Password. Anonymous is strongly recommended for
apps that benefit from try-before-signup.

### 20.5 Auth config (`convex/auth.config.ts`)

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: 'convex',
    },
  ],
};
```

### 20.6 HTTP router (`convex/http.ts`)

```typescript
import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
```

### 20.7 Domain-based files

Separate Convex functions by domain — one file per entity:

```
convex/
  schema.ts
  auth.ts
  auth.config.ts
  http.ts
  users.ts       ← user profile queries/mutations
  items.ts       ← item CRUD
  seed.ts        ← seed data
```

### 20.8 Seed pattern

```typescript
// convex/seed.ts
import { mutation } from './_generated/server';

const DEFAULTS = [
  { name: 'Default Item 1' /* ... */ },
  { name: 'Default Item 2' /* ... */ },
];

export const seedDefaults = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query('items').first();
    if (existing) return; // idempotent — safe to call repeatedly
    for (const item of DEFAULTS) {
      await ctx.db.insert('items', item);
    }
  },
});
```

### 20.9 Ownership check pattern

Every mutation that reads user-owned data must verify ownership:

```typescript
export const update = mutation({
  args: { id: v.id('items'), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const item = await ctx.db.get(args.id);
    if (!item || item.ownerId !== userId) throw new Error('Not found');

    await ctx.db.patch(args.id, { name: args.name });
  },
});
```

---

## 21. Google OAuth Setup

### 21.1 Google Cloud Console

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
5. Download the credentials JSON.

All environments can share one OAuth client — just add all URLs as authorized origins/redirects.

### 21.2 Store secrets in Convex

```bash
# Dev
npx convex env set AUTH_GOOGLE_ID="<client_id>" --env-file .env.local
npx convex env set AUTH_GOOGLE_SECRET="<client_secret>" --env-file .env.local

# Prod
npx convex env set AUTH_GOOGLE_ID="<client_id>" --env-file .env.production
npx convex env set AUTH_GOOGLE_SECRET="<client_secret>" --env-file .env.production
```

Get `client_id` and `client_secret` from the downloaded JSON file.

### 21.3 Convex Auth env vars

Set in **Convex** (via `npx convex env set`), not in `.env` files:

| Variable             | Source                               |
| -------------------- | ------------------------------------ |
| `AUTH_GOOGLE_ID`     | `client_id` from downloaded JSON     |
| `AUTH_GOOGLE_SECRET` | `client_secret` from downloaded JSON |

These are per-deployment (dev and prod separately).

---

## 22. GitHub Repository & CI

### 22.1 Create repo and push

```bash
gh repo create <org>/<project-name> --private --source=. --remote=origin --push
```

### 22.2 CI workflow (`.github/workflows/ci.yml`)

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
      - run: pnpm format:check
      - run: pnpm test:coverage

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  e2e:
    needs: check
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

      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Key CI rules:

- Always use `--frozen-lockfile` — CI must fail if lockfile is out of date.
- Run `format:check` in CI to enforce Prettier.
- Upload coverage as an artifact so it survives between jobs.
- E2E runs after `check` passes (serial, not parallel) to avoid wasting Playwright minutes on broken builds.

---

## 23. Cloudflare Pages Deployment

### 23.1 Initial setup

1. Create a Cloudflare Pages project connected to the GitHub repository.
2. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
3. Add a custom domain in Cloudflare Pages dashboard.

### 23.2 Branch deployment strategy

| Git Branch | Cloudflare Environment     | Convex Backend              |
| ---------- | -------------------------- | --------------------------- |
| `staging`  | Preview deployment         | Dev Convex (`dev:<slug>`)   |
| `main`     | Production (custom domain) | Prod Convex (`prod:<slug>`) |

Cloudflare Pages auto-deploys on push to these branches.

### 23.3 Environment variables in Cloudflare

Set these in the Cloudflare Pages dashboard (per-environment):

| Variable               | Staging Value                     | Production Value                   |
| ---------------------- | --------------------------------- | ---------------------------------- |
| `VITE_CONVEX_URL`      | `https://<dev-slug>.convex.cloud` | `https://<prod-slug>.convex.cloud` |
| `VITE_CONVEX_SITE_URL` | `https://<dev-slug>.convex.site`  | `https://<prod-slug>.convex.site`  |

Do **not** put these in `wrangler.toml` — manage them via the Cloudflare Pages UI.

### 23.4 `wrangler.toml`

```toml
[pages]
build_dir = "dist"
build_command = "pnpm build"
```

### 23.5 SPA routing

If using `HashRouter`: no `_redirects` file needed.
If using `BrowserRouter`: create `public/_redirects` with `/* /index.html 200`.

---

## 24. Environment Matrix

| Environment    | Vite `.env` file  | Convex Deployment | Cloudflare Pages       |
| -------------- | ----------------- | ----------------- | ---------------------- |
| **Local Dev**  | `.env.local`      | `dev:<slug>`      | `pnpm dev` (localhost) |
| **Staging**    | `.env.staging`    | `dev:<slug>`      | Preview URL            |
| **Production** | `.env.production` | `prod:<slug>`     | Custom domain          |

---

## 25. Git Branching Strategy

```
GitHub branches         Convex deployments        Cloudflare Pages
─────────────────      ──────────────────        ─────────────────
main ──────────────►   prod:<slug>───────────►   Production (custom domain)
staging ───────────►   dev:<slug>────────────►   Preview (staging URL)
feature/* ─────────►   (local dev only) ─────►   (not deployed)
```

Rules:

- `main` is protected — all changes arrive via PR.
- Feature branches merge into `staging` first; `staging` promotes to `main`.
- Never push directly to `main` or `staging`.
- Deploy Convex backend changes **before** the frontend PR that depends on them.
- When merging `staging` → `main`, deploy Convex to prod immediately after.

---

## 26. Quick-Start Checklist

### A. Project Initialization

- [ ] `pnpm create vite@latest <name> --template react-ts`
- [ ] Install all dependencies (§1.2–1.7)
- [ ] Install Husky + lint-staged (§1.8) — create `.husky/pre-commit` and `.husky/pre-push`

### B. Tooling & Config

- [ ] Configure `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` (§3)
- [ ] Configure `vite.config.ts` with `@/*` alias, plugins, `strictPort`, test config (§4)
- [ ] Configure `eslint.config.js` (§5)
- [ ] Configure `.prettierrc` + `.prettierignore` (§6)
- [ ] Create `.gitignore` (§7)
- [ ] Create `.env.development.example` + `.env.production.example` (§8)
- [ ] Create `src/index.css` with Tailwind v4 `@theme` + accessibility base styles (§10)

### C. Frontend Foundation

- [ ] Create `src/lib/utils.ts` with `cn()` helper (§9.1)
- [ ] Set up `src/main.tsx` with full provider hierarchy including `ConvexAuthProvider` (§11)
- [ ] Set up `src/App.tsx` with auth guard + lazy routes (§12)
- [ ] Create `src/hooks/useAuth.ts` (§13)
- [ ] Set up `src/i18n/index.ts` + `src/i18n/en.ts` (§14)

### D. Shared Components & Legal

- [ ] Create `PageSpinner` (§12.2), `ErrorDialog` (§16.3), and `ErrorBoundary` (§16.1)
- [ ] Create `PrivacyScreen` + `TermsScreen` (§17)

### E. Testing Infrastructure

- [ ] Set up `tests/setup.ts` (§18.2)
- [ ] Set up `playwright.config.ts` (§19.1)
- [ ] Create `e2e/mocks/convex-react.ts` + `e2e/mocks/convex-auth-react.ts` (§19.2)

### F. Backend & Authentication

- [ ] `npx convex dev --configure` + deploy to dev (§20.1)
- [ ] Create Convex schema with `authTables` spread (§20.3)
- [ ] Create Convex auth files: `auth.ts` (multi-provider), `auth.config.ts`, `http.ts` (§20.4–20.6)
- [ ] Create `.env.local`, `.env.staging`, `.env.production`
- [ ] Create Google OAuth client in Google Cloud Console (§21.1) and download JSON
- [ ] Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Convex (§21.2)

### G. CI/CD & Launch

- [ ] `gh repo create` + push initial commit (§22.1)
- [ ] Create `.github/workflows/ci.yml` (§22.2)
- [ ] Create Cloudflare Pages project + connect GitHub repository (§23.1)
- [ ] Set `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` in Cloudflare Pages dashboard (§23.3)
- [ ] Add custom domain in Cloudflare Pages (§23.1)
- [ ] Push branch — verify CI passes + Cloudflare Pages deploys successfully
