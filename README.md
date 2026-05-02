# Workout Mate

React 19 + Vite + TypeScript + Convex + Cloudflare Pages + Google OAuth.

## Quick start

```bash
pnpm install
pnpm dev          # Vite on localhost:5173
```

In a second terminal:

```bash
npx convex dev    # Watches convex/ changes and pushes to dev deployment
```

There is no local Convex server. Both the frontend and Convex backend run against a **cloud dev deployment**.

## Architecture

```
Local dev       → Convex dev deployment    + Vite dev server (localhost:5173)
Staging (preview)→ Convex dev deployment    + Cloudflare Pages preview URL
Production      → Convex prod deployment   + Cloudflare Pages custom domain
```

Convex gives exactly two deployments per project: **dev** and **prod**. Staging shares the dev deployment.

## Convex

### Deployments

| Deployment | Slug | Used for |
|---|---|---|
| Dev | `resolute-wildcat-738` | Local dev + staging preview |
| Prod | `rapid-gull-240` | Production |

### Commands

```bash
npx convex dev                              # Local dev — watch + push to dev
npx convex deploy --env-file .env.local     # Push functions to dev
npx convex deploy                           # Push functions to prod (interactive)
npx convex env list                         # Dev env vars
npx convex env list --prod                  # Prod env vars
npx convex env set KEY VALUE                # Set on dev
npx convex env set KEY VALUE --prod         # Set on prod
npx convex run functionName --prod          # Run mutation/action on prod
npx convex logs --prod --history 20         # View prod logs
```

`npx convex deploy` is interactive — it prompts "Do you want to push to prod?" and must be run in a real terminal.

### Env files

- `.env.local` — dev (default, gitignored)
- `.env.staging` — staging (copy to `.env.local` for local staging testing)
- `.env.production` — production (`--env-file .env.production`)

All use `CONVEX_DEPLOYMENT` to select the target deployment:
```
CONVEX_DEPLOYMENT=dev:resolute-wildcat-738   # dev/staging
CONVEX_DEPLOYMENT=prod:rapid-gull-240        # production
```

### Env vars are per-deployment

Every env var set on dev must be duplicated on prod. Use the same values except `SITE_URL`:

| Variable | Dev | Prod |
|---|---|---|
| `SITE_URL` | `http://localhost:5173` | Custom domain |
| `AUTH_GOOGLE_ID` | Same | Same |
| `AUTH_GOOGLE_SECRET` | Same | Same |
| `AUTH_SECRET` | Same | Same |
| `JWT_KID` | Same | Same |
| `JWT_PRIVATE_KEY` | Same | Same |
| `JWKS` | Same | Same |

### JWT_PRIVATE_KEY gotchas

The key must be RSA PKCS#8 format. Newlines in the key value get stored as spaces in `.env` files — **this is normal and works correctly**.

**Do NOT use `--from-file` with a key name argument.** The command `npx convex env set JWT_PRIVATE_KEY --from-file .env` reads the `KEY=` prefix as part of the value, producing a double-prefixed value.

Correct ways:
```bash
# File must be in .env format: KEY=VALUE
npx convex env set --from-file .env --prod

# Or set interactively (pastes into a prompt):
npx convex env set JWT_PRIVATE_KEY --prod
```

### Database seeding

Convex has no built-in "run on deploy" hook. Seed tables by:
1. Making the seed mutation **idempotent** (check if data exists, return early)
2. Calling it from the client on first load via `useEffect` when the query returns empty
3. Manually after deploy: `npx convex run module:seedFunction --prod`

## Cloudflare Pages

### Setup

- Connect GitHub repo in Cloudflare Dashboard > Workers & Pages > Pages
- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Preview deployments: all non-main branches (including `staging`)

### Environment variables

Pages env vars are separate from repo `.env` files. Set via Cloudflare API or dashboard:

```bash
ACCOUNT_ID="..."
TOKEN="..."
PROJECT="workout"

curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deployment_configs": {
      "preview": {
        "env_vars": {
          "VITE_CONVEX_URL": {"value": "https://resolute-wildcat-738.convex.cloud"},
          "VITE_CONVEX_SITE_URL": {"value": "https://resolute-wildcat-738.convex.site"}
        }
      },
      "production": {
        "env_vars": {
          "VITE_CONVEX_URL": {"value": "https://rapid-gull-240.convex.cloud"},
          "VITE_CONVEX_SITE_URL": {"value": "https://rapid-gull-240.convex.site"}
        }
      }
    }
  }' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT"
```

- `preview` env vars apply to all non-production branches (including `staging`)
- `production` env vars apply only to `main`
- Wrangler CLI **cannot** set plaintext env vars for Pages projects — use the API or dashboard

### Env vars are baked at build time

`VITE_*` env vars are inlined into the JS bundle during `vite build`. Changing them requires a **new build** (push to the branch).

Verify the baked URL in production:
```bash
JS_URL=$(curl -s https://your-domain.com | grep -o '/assets/index-[^.]*\.js')
curl -s "https://your-domain.com$JS_URL" | grep -o 'rapid-gull.*\.cloud'
```

Trigger a rebuild with an empty commit:
```bash
git commit --allow-empty -m "Trigger rebuild" && git push
```

### Custom domains

Set in Cloudflare Dashboard > Pages > your-project > Custom domains. The domain's DNS must already be on Cloudflare. `VITE_CONVEX_URL` does not change when adding a custom domain.

## Google OAuth

One OAuth 2.0 client supports all environments — add all URIs to a single client.

**Authorized JavaScript origins**:
```
http://localhost:5173
https://staging.<project>.pages.dev
https://<custom-domain>.com
```

**Authorized redirect URIs**:
```
https://resolute-wildcat-738.convex.site/api/auth/callback/google
https://rapid-gull-240.convex.site/api/auth/callback/google
```

URIs must be exact — Google rejects wildcards. The consent screen must be published (not "Testing") for production users.

## Staging workflow

```
feature → PR to staging → CI passes → merge → Cloudflare Pages auto-deploys preview
                                                (uses dev Convex backend)
                                                validate
                                                PR staging → main → Cloudflare Pages auto-deploys production
                                                                     npx convex deploy (for backend changes)
```

Staging shares the dev Convex deployment, so:
- Changes to dev Convex affect staging immediately
- OAuth from staging redirects to `SITE_URL` on dev (usually `localhost:5173`) — may not work unless `SITE_URL` is temporarily changed

## Git branches

| Branch | Cloudflare Pages env | Convex deployment |
|---|---|---|
| `main` | production | `rapid-gull-240` (prod) |
| `staging` | preview | `resolute-wildcat-738` (dev) |

## CI

GitHub Actions workflow runs on PRs to `main` and `staging`:

```yaml
steps:
  - pnpm install --frozen-lockfile
  - pnpm build
  - pnpm lint
  - pnpm test -- run
```

## Deployment checklist

- [ ] `npx convex env list --prod` — all env vars set and correct
- [ ] `npx convex deploy` — functions deployed (answer Yes to prod prompt)
- [ ] Cloudflare Pages env vars set via API/dashboard (both `preview` and `production`)
- [ ] Push to trigger build with baked `VITE_*` URLs
- [ ] `curl` the JS bundle to verify correct Convex URL is baked
- [ ] Seed data: `npx convex run module:seedFunction --prod`
- [ ] Google OAuth: all origins and redirect URIs added
- [ ] Google OAuth consent screen published
- [ ] Custom domain working and serving the latest build
- [ ] `npx convex logs --prod --history 20` — no errors on prod
