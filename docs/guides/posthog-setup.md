# PostHog Setup Guide

## 1. Create a PostHog account

Go to [eu.posthog.com](https://eu.posthog.com) and sign up. If you already have an account, sign in.

## 2. Create a project

1. After signing in, you'll be prompted to create a project. Enter a name, e.g. "Workout Mate".
2. Choose **EU** as your hosting region.
3. Click **Create project**.

If you already have an organization and want to add a project: click the project dropdown in the top bar → **New project**.

## 3. Get your project API key

1. Go to **Project settings** (gear icon in the sidebar).
2. Under **Project API key**, copy the key — this is your `VITE_POSTHOG_KEY`.
3. Your API host is `https://eu.i.posthog.com` — this goes in `VITE_POSTHOG_HOST`.

## 4. Add it to the project

Use the same key across all environments — PostHog's free tier supports one project. The SDK's `environment` is automatically set from Vite's `MODE` value, so data is tagged by environment for filtering.

**.env.local** (local dev — usually left blank):

```
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

**.env.staging** (staging deployment):

```
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

**.env.production** (live site):

```
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

Leaving the key empty disables PostHog entirely for that environment — no script loads, no data sent. Typically you'd leave it empty in `.env.local` and set it in staging and production.

## 5. Verify it works

1. Set your key in `.env.local` temporarily.
2. Run `pnpm dev` and open the app.
3. Accept the consent banner — PostHog initializes on consent, same as GA4.
4. In PostHog, go to **Activity** in the sidebar — you should see your visit appear within a few seconds.
5. Remove the key from `.env.local` when done.

## 6. Session recordings (optional)

Session recordings are disabled by default. To enable them:

1. Go to **Project settings → Session recording**.
2. Toggle recording on and configure the recording domain.
3. In `src/lib/posthog.ts`, change `disable_session_recording` to `false`.
4. Recordings will appear under **Recordings** in the sidebar.

## 7. Creating feature flags

Feature flags are available immediately after PostHog is connected:

1. Go to **Feature flags** in the sidebar → **New feature flag**.
2. Set the key (e.g. `workout-controls-above-exercises`).
3. Choose **Boolean** type for on/off toggles.
4. Configure the release condition — start with a percentage rollout or target specific users.
5. Click **Save**.

Flags are evaluated client-side with zero added latency. Use the `useFeatureFlag('flag-key')` hook anywhere in the app to read them. See `src/hooks/useFeatureFlag.ts` for the implementation.

## Separate projects for staging vs production

PostHog's free tier allows one project. Since the same API key is used across environments, the SDK sets `environment` from Vite's `MODE` value (`development`, `staging`, or `production`). Use PostHog's built-in filters to isolate environments:

- **Feature flags**: each flag can target a specific `environment`. When creating a flag, add a filter condition **User property → environment → equals → production** so staging and local dev don't get the flag.
- **Insights & dashboards**: add a global filter or per-insight filter on **Environment** to exclude staging or local traffic.
- **Session recordings**: filter by environment in the recordings list to review only production sessions.

When you upgrade to a paid plan, create a second project and split the keys by environment.
