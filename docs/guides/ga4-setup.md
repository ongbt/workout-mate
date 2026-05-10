# GA4 Setup Guide

## 1. Create a Google Analytics account

Go to [analytics.google.com](https://analytics.google.com) and sign in with your Google account. If this is your first time, click **Start measuring** to create an account.

## 2. Create a GA4 property

1. In the Admin panel (gear icon, bottom-left), click **Create Property**.
2. Enter a property name, e.g. "Workout Mate".
3. Select your reporting time zone and currency.
4. Click **Next**, fill in business details (any values work), then click **Create**.
5. Choose **Web** as the platform when prompted.

## 3. Get your Measurement ID

1. After creating the web stream, you'll see a **Measurement ID** in the format `G-XXXXXXXXXX`.
2. Copy it — this is your `VITE_GA_MEASUREMENT_ID`.

If you already created the property and need to find it again: go to **Admin → Data Streams → click your web stream** — the Measurement ID is shown at the top.

## 4. Add it to the project

Add the ID to the environment file for the deployment you want to track:

**.env.local** (local dev — usually left blank):

```
VITE_GA_MEASUREMENT_ID=
```

**.env.production** (live site):

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leaving the ID empty disables analytics entirely for that environment — no script loads, no requests fire.

## 5. Verify it works

1. Set your ID in `.env.local` temporarily.
2. Run `pnpm dev` and open the app.
3. Accept the consent banner.
4. In Google Analytics, go to **Reports → Real-time** — you should see your visit appear within a few seconds.
5. Remove the ID from `.env.local` when done.

## Separate properties for staging vs production

Create a second GA4 property for staging (e.g. "Workout Mate Staging") and put its ID in `.env.staging`. This keeps test traffic separate from real user data.
