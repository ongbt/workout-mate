# Production Setup Guide

Lessons and rules for deploying the Convex + Cloudflare Pages + Google OAuth stack.

## Architecture

```
Local dev       → Convex dev deployment    + Vite dev server (localhost:5173)
Staging (preview)→ Convex dev deployment    + Cloudflare Pages preview URL
Production      → Convex prod deployment   + Cloudflare Pages custom domain
```

Convex has exactly two fixed deployments per project: **dev** and **prod**. There is no built-in staging tier. Staging shares the dev deployment.

## Convex

### Dev vs Prod

- `npx convex dev` — runs against dev deployment (set in `.env.local` via `CONVEX_DEPLOYMENT`)
- `npx convex deploy` — deploys functions to prod deployment (interactive, requires typing "yes")
- `npx convex env list` — shows dev env vars
- `npx convex env list --prod` — shows prod env vars
- `npx convex env set KEY VALUE` — sets on dev
- `npx convex env set KEY VALUE --prod` — sets on prod
- `npx convex env remove KEY --prod` — removes from prod
- `npx convex run functionName --prod` — runs a mutation/action on prod
- `npx convex logs --prod --history 20` — view prod logs

### Env vars are per-deployment

Every env var set on dev must be duplicated on prod. Use the same values except `SITE_URL`:

| Variable | Dev | Prod |
|---|---|---|
| `SITE_URL` | `http://localhost:5173` | Custom domain (e.g. `https://workout.bouncybison.click`) |
| `AUTH_GOOGLE_ID` | Same | Same |
| `AUTH_GOOGLE_SECRET` | Same | Same |
| `AUTH_SECRET` | Same | Same |
| `JWT_KID` | Same | Same |
| `JWT_PRIVATE_KEY` | Same (see below) | Same (see below) |
| `JWKS` | Same | Same |

### JWT_PRIVATE_KEY gotchas

The key must be RSA PKCS#8 format. The key value has newlines which Convex stores as spaces in `.env` files — this is **normal and works correctly**.

**Do NOT use `--from-file` with a key name argument.** The command `npx convex env set JWT_PRIVATE_KEY --from-file .env` reads the `KEY=` prefix as part of the value, producing a double-prefixed `JWT_PRIVATE_KEY=JWT_PRIVATE_KEY=-----BEGIN...`.

Correct way to set from a file:
```bash
# File must be in .env format: KEY=VALUE
npx convex env set --from-file .env --prod
```

Or set interactively (pastes into a prompt):
```bash
npx convex env set JWT_PRIVATE_KEY --prod
```

### Database seeding

Convex has no built-in "run on deploy" hook. Seed tables by:
1. Making the seed mutation **idempotent** (check if data exists before inserting, return early)
2. Calling it from the client on first load with `useEffect` when the query returns an empty array
3. Also run manually after first deploy: `npx convex run module:seedFunction --prod`

### `convex deploy` is interactive

The deploy command prompts "Do you want to push to prod?" and cannot be scripted with `echo yes |`. Run it in a real terminal.

## Cloudflare Pages

### Project setup

- Connect GitHub repo in Cloudflare Dashboard > Workers & Pages > Pages > Connect to Git
- Production branch: `main`
- Build command: `pnpm build`
- Build output: `dist`
- Preview deployments: all non-main branches (including `staging`)

### Environment variables

Pages env vars are separate from your repo's `.env` files. They must be set via the Cloudflare API or dashboard:

```bash
# Set via API (requires OAuth token from ~/.wrangler/config/default.toml)
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
          "VITE_CONVEX_URL": {"value": "https://<dev-deployment>.convex.cloud"},
          "VITE_CONVEX_SITE_URL": {"value": "https://<dev-deployment>.convex.site"}
        }
      },
      "production": {
        "env_vars": {
          "VITE_CONVEX_URL": {"value": "https://<prod-deployment>.convex.cloud"},
          "VITE_CONVEX_SITE_URL": {"value": "https://<prod-deployment>.convex.site"}
        }
      }
    }
  }' \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT"
```

- `preview` env vars apply to all non-production branches (including `staging`)
- `production` env vars apply only to the production branch (`main`)

Wrangler CLI **cannot** set plaintext env vars for Pages projects (only secrets via `wrangler pages secret`). Use the API or dashboard.

### Env vars are baked at build time

`VITE_*` env vars are inlined into the JS bundle during `vite build`. If you change env vars, you must trigger a **new build** (push to the branch) for them to take effect. The previous build's JS will have stale values.

To verify the baked URL in production:
```bash
JS_URL=$(curl -s https://your-domain.com | grep -o '/assets/index-[^.]*\.js')
curl -s "https://your-domain.com$JS_URL" | grep -o 'rapid-gull.*\.cloud'
```

### Triggering a rebuild

An empty commit + push is the simplest way:
```bash
git commit --allow-empty -m "Trigger rebuild" && git push
```

### Custom domains

Set in Cloudflare Dashboard > Pages > your-project > Custom domains. The domain's DNS must already be in Cloudflare. Env vars do NOT change when aliasing a custom domain — the `VITE_CONVEX_URL` stays the same.

## Google OAuth

### One OAuth client for all environments

A single Google OAuth 2.0 client supports multiple origins and redirect URIs. Do not create separate clients per environment — just add all URIs to one client.

### Required URIs

**Authorized JavaScript origins** (3):
```
http://localhost:5173
https://staging.<project>.pages.dev
https://<custom-domain>.com
```

**Authorized redirect URIs** (2, or more if preview deployments needed):
```
https://<dev-deployment>.convex.site/api/auth/callback/google
https://<prod-deployment>.convex.site/api/auth/callback/google
```

Each URI must be exact — Google rejects wildcards (`*`) in redirect URIs.

### OAuth consent screen

Must be published (not "Testing") for production users. If in testing mode, add your email as a test user.

## Staging workflow

```
feature → PR to staging → CI passes → merge → Cloudflare Pages auto-deploys preview
                                              (uses dev Convex backend)
                                              validate
                                              PR staging → main → Cloudflare Pages auto-deploys production
                                                                   npx convex deploy (for backend changes)
```

### Staging shares dev Convex

The staging preview URL points to the dev Convex deployment. This means:
- Changes pushed to dev Convex affect staging immediately
- OAuth from staging redirects to `SITE_URL` set on dev (usually `localhost:5173`) — OAuth on staging may not work unless `SITE_URL` is temporarily changed

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
- [ ] Push to trigger build with baked `VITE_*` urls
- [ ] `curl` the JS bundle to verify correct Convex URL is baked
- [ ] Seed data: `npx convex run module:seedFunction --prod`
- [ ] Google OAuth: all origins and redirect URIs added
- [ ] Google OAuth consent screen published
- [ ] Custom domain working and serving the latest build
- [ ] `npx convex logs --prod --history 20` — no errors on prod
