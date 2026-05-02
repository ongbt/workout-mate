# Local Development Guide

## Quick start

```bash
pnpm install
pnpm dev          # Vite on localhost:5173
```

In a second terminal, watch and push Convex function changes:

```bash
npx convex dev
```

## How it works

There is no local Convex server. Both the frontend and Convex backend run against a **cloud dev deployment**.

| What | Command | Connects to |
|---|---|---|
| React dev server | `pnpm dev` | Reads `.env.local` → dev Convex (`resolute-wildcat-738`) |
| Convex function push | `npx convex dev` | Pushes `convex/` changes to dev deployment |

## Environment variables

`.env.local` (gitignored):

```
VITE_CONVEX_URL=https://resolute-wildcat-738.convex.cloud
CONVEX_DEPLOYMENT=dev:resolute-wildcat-738
VITE_CONVEX_SITE_URL=https://resolute-wildcat-738.convex.site
```

`VITE_*` vars are read at dev-server time by Vite. In staging/production, they are set in Cloudflare Pages and baked into the JS bundle at build time.

## Convex deployments

Convex gives exactly two deployments per project:

| Deployment | Name | Used for |
|---|---|---|
| **dev** | `resolute-wildcat-738` | Local dev + staging preview |
| **prod** | `rapid-gull-240` | Production |

## Deploying

### Backend changes (Convex)

```bash
npx convex deploy             # Push functions to prod (interactive — type "yes")
npx convex env set KEY VAL    # Set on dev
npx convex env set KEY VAL --prod  # Set on prod
```

### Frontend changes (Cloudflare Pages)

Push to the relevant branch. Cloudflare Pages auto-builds and deploys.

| Branch | Cloudflare Pages env | Convex deployment |
|---|---|---|
| `main` | production | prod (`rapid-gull-240`) |
| `staging` | preview | dev (`resolute-wildcat-738`) |

## OAuth limitation on staging

OAuth from the staging preview URL won't work unless the dev Convex deployment's `SITE_URL` is temporarily changed to match the staging URL — which would break local OAuth. This is a known trade-off of Convex's two-deployment model.

See `docs/guides/production-setup.md` for full deployment details.
