# Sentry Setup Guide

## 1. Create a Sentry account

Go to [sentry.io](https://sentry.io) and sign up. If you already have an account, sign in.

## 2. Create a project

1. From the **Projects** tab, click **Create Project**.
2. Choose **React** as the platform.
3. Enter a project name, e.g. "Workout Mate".
4. Choose your team (or create a new one).
5. Click **Create Project**.

## 3. Get your DSN

1. After creating the project, Sentry shows you the DSN immediately on the setup page. It looks like `https://xxxxxx@oxxxxxx.ingest.sentry.io/xxxxxx`.
2. Copy it — this is your `VITE_SENTRY_DSN`.

If you need to find it again later: go to **Settings → Projects → click your project → Client Keys (DSN)**. Use the **DSN** value (not the Public DSN).

## 4. Add it to the project

Add the DSN to the environment file for each deployment:

**.env.local** (local dev — usually left blank):

```
VITE_SENTRY_DSN=
```

**.env.staging** (staging deployment):

```
VITE_SENTRY_DSN=https://xxxxxx@oxxxxxx.ingest.sentry.io/xxxxxx
```

**.env.production** (live site):

```
VITE_SENTRY_DSN=https://xxxxxx@oxxxxxx.ingest.sentry.io/xxxxxx
```

Leaving the DSN empty disables Sentry entirely for that environment — no errors are captured. Unlike GA4 and PostHog, Sentry initializes unconditionally at startup (no consent gate required) since error tracking falls under legitimate interest for service reliability.

## 5. Verify it works

1. Set your DSN in `.env.local` temporarily.
2. Run `pnpm dev` and open the app.
3. Look for `[Sentry] Initialized` in the browser console.
4. In Sentry, go to **Issues** in the sidebar.
5. Trigger a test error — the fastest way is to open the ErrorDialog (if error handling UI is available) or temporarily add a `throw new Error("test")` somewhere in a component.
6. The error should appear in **Issues** within a few seconds. Mark it as resolved after you're done.
7. Remove the DSN from `.env.local` when done.

## 6. Error boundary (already wired)

The app uses `@sentry/react`'s error boundary integration via `Sentry.init()`. Uncaught React rendering errors are automatically captured and sent to Sentry. The app also has a custom `ErrorBoundary` component and `ErrorContext` that report errors via `Sentry.captureException()` and `Sentry.captureMessage()` respectively.

## Separate projects for staging vs production

Create a second Sentry project for staging (e.g. "Workout Mate Staging") and put its DSN in `.env.staging`. This keeps test errors separate from real user issues. Sentry initializes with `environment` set to Vite's `MODE` value, so errors are tagged with the correct environment automatically.
