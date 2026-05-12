# Workout Mate — Specification

## Overview

Workout Mate is a mobile-first Progressive Web App (PWA) that guides users through configurable workout sets. It provides visual countdown timers, phase indicators (exercise vs. rest), and audio cues so users can focus on their workout without watching the screen.

## Core Features

### 1. Workout Set Configuration

Users create and manage reusable workout sets. Each set defines:

- **Name** — a label for the workout (e.g. "Upper Body", "HIIT Circuit")
- **Exercises** — an ordered list of exercises, each with:
  - **Name** — the exercise name (e.g. "Push-ups", "Squats")
  - **Duration** — how long to perform the exercise, in seconds (default: 45s, minimum: 1s)
- **Rest between exercises** — time between each exercise within a round, in seconds (default: 5s, minimum: 0s)
- **Rest between rounds** — time between the last exercise of one round and the first of the next, in seconds (default: 60s, minimum: 0s)
- **Rounds** — how many times to cycle through the full exercise list (default: 2, minimum: 1)

Workout sets support full CRUD: create, edit, and delete. All data persists to `localStorage` and survives page reloads. A workout set must have at least one exercise.

### 2. Active Workout Session

When a workout is started, the app runs through a defined sequence:

```
idle → exercise → rest → exercise → rest → ... → rest (between rounds) → exercise → ... → rest → finished
```

**Invariant**: Every exercise is always followed by a rest period. The rest between exercises within a round uses `restSeconds`. The rest after the last exercise of a round uses `restBetweenRoundsSeconds` (allowing a longer pause between rounds). The final rest (after the last exercise of the last round) uses `restSeconds`.

**Phase transitions:**

1. User taps "Start Workout" → first exercise begins
2. Exercise timer reaches 0 → rest period begins
3. Rest timer reaches 0 → next exercise begins (or next round, or finished)

**Multi-round behavior:**
When the last exercise in a round finishes, a rest period of `restBetweenRoundsSeconds` follows (instead of the normal `restSeconds`). After that rest, the next round begins automatically with its first exercise. When the final round completes, the last rest uses `restSeconds` and the session transitions to "finished".

**Controls during a session:**

- **Pause** — freezes the timer
- **Resume** — continues from where the timer was paused
- **Skip** — immediately advances to the next phase (exercise → rest, rest → next exercise)
- **Stop** — ends the session and returns to idle state

**Visual feedback:**

- **Donut timer** — SVG circle that starts full and reduces clockwise as time runs down. Green for exercise, amber for rest. The countdown text (`MM:SS`) sits centered inside the circle. Both circle and text pulse red in the last 5 seconds.
- Color-coded phase indicator: green = exercise, amber = rest, blue = finished
- Current exercise name displayed prominently below the timer
- Next exercise name shown in smaller muted text beneath the current exercise (during exercise and rest phases)
- **Exercise round grid** — a grid of colored circles, one row per round, one circle per exercise:
  - Green circle for completed exercises
  - Amber pulsing circle for the current exercise
  - Red circle for upcoming exercises
  - Round labels (R1, R2, …) and exercise name headers above each column
- **Workout set name** displayed in the header bar throughout the session
- Progress bar showing overall completion across all rounds and exercises

**Completion:**
After the final rest period (following the last exercise of the last round), the session transitions to "finished" and a completion screen displays with a "Back to Home" button.

### 3. Audio Guidance

The app uses the Web Speech API (`SpeechSynthesis`) to provide hands-free cues:

| Event                                 | Audio cue                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Exercise begins (mid-round)           | `"{exercise name}. Go!"`                                                                |
| Exercise begins (new round)           | `"Round {N}. {exercise name}. Go!"`                                                     |
| Rest begins (between exercises)       | `"Rest for {N} seconds"`                                                                |
| Rest begins (between rounds)          | `"Round {N} complete. Rest for {N} seconds"`                                            |
| Last 5 seconds of any phase           | Countdown: `"5"`, `"4"`, `"3"`, `"2"`, `"1"` (suppressed while announcement is playing) |
| Every 10 seconds (50, 40, 30, 20, 10) | `"{N} seconds"`                                                                         |
| Last 5 seconds of any phase           | Countdown: `"5"`, `"4"`, `"3"`, `"2"`, `"1"`                                            |
| Workout complete                      | `"Workout complete! Great job!"`                                                        |
| New phase after skip                  | Appropriate transition cue                                                              |

Speech uses a rate of 0.9 for clarity and cancels any in-progress utterance before speaking a new one. The initial "Start Workout" tap satisfies the iOS user-gesture requirement for speech synthesis.

## Data Model

```typescript
interface Exercise {
  id: string; // UUID v4
  name: string; // User-provided label
  durationSeconds: number; // Default 45, minimum 1
}

interface WorkoutConfig {
  id: string; // UUID v4
  name: string; // User-provided label
  exercises: Exercise[]; // Minimum 1 exercise
  restSeconds: number; // Default 5, minimum 0
  restBetweenRoundsSeconds: number; // Default 60, minimum 0
  rounds: number; // Default 2, minimum 1
}

type WorkoutPhase = 'idle' | 'exercise' | 'rest' | 'finished';
```

**Persistence**: `WorkoutConfig[]` serialized as JSON to `localStorage` under key `workout-mate-configs`.

## Non-Functional Requirements

### Platform

- Runs entirely client-side — no backend, no network requests after initial load
- PWA: installable on mobile home screen, works offline via service worker
- Portrait orientation only
- Works on iOS Safari, Android Chrome, and desktop browsers

### Performance

- Timer is drift-free (uses absolute `Date.now()` timestamps, not accumulated intervals)
- Timer ticks at 100ms granularity
- Operates correctly when the browser tab is backgrounded (drift correction handles throttled timers)

### Accessibility

- Minimum 44×44px tap targets on all interactive elements
- High-contrast dark theme (slate-900 background, slate-50 text)
- Audio cues for users who cannot watch the screen
- `env(safe-area-inset-bottom)` padding for notched devices

### Constraints

- TypeScript strict mode, no `any`
- No external API dependencies
- Fully static build output (single-page app with hash routing)

## Routes

| Path            | Screen | Purpose                      |
| --------------- | ------ | ---------------------------- |
| `#/`            | Home   | Workout list, create new     |
| `#/workout/new` | Edit   | Create a new workout set     |
| `#/workout/:id` | Edit   | Edit an existing workout set |
| `#/active/:id`  | Active | Run a workout session        |

Hash-based routing (`HashRouter`) ensures the PWA handles refreshes and direct URL access without server-side redirects.

## Technical Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Framework       | React 19                                    |
| Language        | TypeScript 6 (strict)                       |
| Build           | Vite 8                                      |
| Styling         | Tailwind CSS 4 (CSS-first `@theme`)         |
| Routing         | react-router-dom 7 (HashRouter)             |
| State           | React Context + localStorage                |
| Audio           | Web Speech API (SpeechSynthesis)            |
| IDs             | uuid v4                                     |
| PWA             | vite-plugin-pwa + workbox                   |
| Testing         | Vitest + @testing-library/react + happy-dom |
| Package manager | pnpm                                        |

## Design Principles

### Progressive enhancement for browser APIs

Every browser API used by the app (Speech Synthesis, Wake Lock, Web Audio) follows the same pattern: feature-detect with a falsy guard, wrap calls in try/catch, and fail silently. There are no "your browser doesn't support X" banners or fallback UI. The app is fully usable without any browser API — it just gets quieter.

Applies to:

- **Web Speech API** — `useSpeechSynthesis` checks `'speechSynthesis' in window` and returns no-ops if missing. All call sites call `speak()` unconditionally.
- **Wake Lock API** — `useWakeLock` checks `'wakeLock' in navigator` and catches all errors silently. Low battery, device policy, or missing support all degrade gracefully.
- **Web Audio API** — `useBeep` wraps `AudioContext` construction in try/catch and returns a no-op on failure.

### Two-tier announcement timing

Voice announcements fall into two categories with different timing semantics:

| Tier             | Behavior                                               | Examples                                     |
| ---------------- | ------------------------------------------------------ | -------------------------------------------- |
| **Blocking**     | Timer pauses until speech completes, then timer starts | _"Rest for 45 seconds"_, _"Push-ups. Go!"_   |
| **Non-blocking** | Speech plays while timer is counting down              | _"Next: Push-ups"_, countdown _"30 seconds"_ |

Blocking announcements use `startTimerAfterSpeech(text, durationMs)` which passes the timer start as the `onEnd` callback to `speak()`. Non-blocking announcements use `speak()` directly with no callback. The `isSpeaking` flag in the countdown effect suppresses countdown ticks while any speech is active, preventing overlaps.

Edge cases handled:

- Starting a new blocking announcement cancels any in-flight utterance (via `speechSynthesis.cancel()` inside `speak()`)
- Non-blocking countdown speech (`"30 seconds"`) won't overlap with phase transitions because `isSpeaking` suppresses the tick
- The first countdown tick after a phase transition is suppressed (`suppressFirstReadoutRef`) regardless of tier

## Edge Cases & Behavior

| Scenario                              | Behavior                                                              |
| ------------------------------------- | --------------------------------------------------------------------- |
| No workouts configured                | Empty state with prompt to create first workout                       |
| All exercises deleted in editor       | Delete button disabled when only 1 exercise remains                   |
| Timer reaches 0 while phone is asleep | `Date.now()` catches up on wake; phase completes correctly            |
| Speech synthesis unavailable          | App functions silently; no errors thrown                              |
| Corrupt localStorage data             | Falls back to empty array; user data is lost but app is usable        |
| User leaves active workout screen     | Timer continues; returning shows current state                        |
| PWA update available                  | Toast prompt appears; user can update or dismiss                      |
| Background tab                        | Timer stays accurate via drift correction even if ticks are throttled |

## Defaults

| Parameter                   | Default    |
| --------------------------- | ---------- |
| Exercise duration           | 15 seconds |
| Rest between exercises      | 5 seconds  |
| Rest between rounds         | 60 seconds |
| Rounds                      | 2          |
| Timer tick interval         | 100ms      |
| Countdown warning threshold | 5 seconds  |

## Planned Features

### 4. Workout Session History & Logging

When a user completes a workout session (reaches the `finished` phase without stopping early), a session record is persisted to Convex. The home screen gains a "History" section or tab showing past sessions in reverse chronological order.

**Session record schema:**

```typescript
interface WorkoutSession {
  _id: Id<'sessions'>;
  userId: Id<'users'>;
  workoutId: string;
  workoutName: string;
  completedAt: number; // Date.now()
  totalDurationMs: number; // actual wall-clock time from start to finish
  exerciseCount: number;
  roundsCompleted: number;
  _creationTime: number;
}
```

**Behavior:**

- Sessions are created only on natural completion (not on Stop/Skip-to-end).
- Each session is immutable — no edit or delete needed for MVP.
- The home screen shows the 10 most recent sessions as a compact list (date, workout name, duration).
- A "View All" option navigates to a full history view with basic filtering (by workout name).

**Convex additions:**

- `sessions` table with `by_user` index on `userId`
- `create` mutation (called from client on workout completion)
- `list` query (paginated, ordered by `completedAt desc`)
- `count` query (total sessions for stats)

### 5. Streaks & Simple Stats

A stats summary displayed on the home screen above the workout list, driven by session data.

**Metrics displayed:**

| Metric         | Definition                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| Current streak | Consecutive days with at least 1 completed session, ending today or yesterday |
| Longest streak | Best-ever consecutive-day run                                                 |
| Total workouts | Lifetime count of completed sessions                                          |
| Total minutes  | Sum of `totalDurationMs` across all sessions, displayed in hours/minutes      |

**Behavior:**

- A "day" is defined in the user's local timezone (midnight to midnight).
- Streak breaks if no session was completed on a given day — it does not need to be the same workout.
- If the user has no sessions yet, the stats section shows placeholder values ("--") with a motivational prompt.
- Stats update optimistically after session completion.

**Convex additions:**

- `getStats` query aggregating from `sessions` table

### 6. Exercise Library

A built-in library of bodyweight exercises that users can browse and insert into their workout sets, reducing manual typing.

**Library data model:**

```typescript
interface LibraryExercise {
  _id: Id<'exerciseLibrary'>;
  name: string;
  category: 'strength' | 'cardio' | 'core' | 'flexibility' | 'full-body';
  defaultDurationSeconds: number; // suggested duration
}
```

**Initial library (~40 exercises):**

| Category    | Examples                                                                               |
| ----------- | -------------------------------------------------------------------------------------- |
| Strength    | Push-ups, Squats, Lunges, Dips, Glute Bridges, Calf Raises, Wall Sit                   |
| Cardio      | High Knees, Jumping Jacks, Burpees, Mountain Climbers, Butt Kicks, Skaters             |
| Core        | Plank, Crunches, Bicycle Crunches, Leg Raises, Russian Twists, Dead Bug, Flutter Kicks |
| Flexibility | Downward Dog, Child's Pose, Cat-Cow, Standing Forward Fold, Spinal Twist               |
| Full-Body   | Burpees, Bear Crawls, Inchworms, Star Jumps, Tuck Jumps                                |

**Behavior:**

- In the Workout Edit screen, an "Add from Library" button opens a searchable modal.
- Exercises can be filtered by category.
- Selecting an exercise inserts it into the current workout's exercise list with its suggested duration.
- The library is seeded via a Convex mutation (`seedExerciseLibrary`), similar to `seedDefaults`.
- Users cannot add custom exercises to the library (it's a static reference set).

**Convex additions:**

- `exerciseLibrary` table
- `list` query (with optional category filter)
- `seedExerciseLibrary` mutation

### 7. Warm-up & Cool-down Phases

Optional configurable periods before the first exercise and after the last exercise of every workout session.

**Schema additions to `WorkoutConfig`:**

```typescript
interface WorkoutConfig {
  // ... existing fields
  warmupSeconds: number; // default 0 (disabled), minimum 0
  cooldownSeconds: number; // default 0 (disabled), minimum 0
}
```

**Phase sequence with warm-up/cooldown:**

```
idle → warmup → exercise → rest → ... → exercise → rest → cooldown → finished
```

**Behavior:**

- Warm-up and cool-down are each treated as a distinct phase with their own visual color:
  - Warm-up: **blue** (`bg-blue-500`)
  - Cool-down: **purple** (`bg-purple-500`)
- Voice announcements:
  - Warm-up start: `"Warm up for {N} seconds"`
  - Cool-down start: `"Cool down for {N} seconds"`
  - Completion transitions use standard blocking announcements.
- If `warmupSeconds` is 0, the phase is skipped entirely (no warm-up shown). Same for `cooldownSeconds`.
- The Workout Edit screen includes optional fields for warm-up and cool-down durations (collapsed by default, expanding when the user clicks "Add warm-up" / "Add cool-down").
- Warm-up and cool-down durations are persisted as part of the workout config.

**Engine changes (`useActiveWorkout.ts`):**

- `WorkoutPhase` type gains `'warmup'` and `'cooldown'`.
- Phase transition logic accounts for warm-up as the first phase and cool-down as the last.
- Skip from warm-up jumps to the first exercise; skip from the last rest jumps to cool-down (if enabled) or to finished.

### 8. Duplicate Workout

A convenience action that clones an existing workout so users can create variants without rebuilding from scratch.

**Behavior:**

- Each workout card on the home screen gains a "Duplicate" action (via a context menu or long-press).
- Tapping "Duplicate" calls a Convex mutation that creates a new workout with:
  - `name`: `"{original name} (Copy)"`
  - All other fields (exercises, durations, rest periods, rounds) identical to the original.
- The new workout is owned by the current user.
- After duplication, navigate to the edit screen for the new workout so the user can rename or adjust it.
- Duplication does not copy session history.

**Convex additions:**

- `duplicate` mutation (or reuses `create` with data from an existing workout)

### 9. Workout Scheduling & Reminders

Users can set a preferred daily workout time and receive a browser notification reminding them to work out.

**Behavior:**

- A settings/account screen (new) includes a "Workout Reminder" section.
- User selects:
  - **Enabled** toggle (default: off)
  - **Time** — a time picker (e.g., "07:00")
  - **Days** — which days of the week (default: all)
- At the scheduled time, if the app is installed as a PWA and notifications are granted, a push notification fires: `"Time to work out! {workout name} is waiting."`
- If the browser doesn't support Notification API or permission is denied, the toggle shows a muted state with a note.
- Scheduling uses a `setInterval` poll (checking every 60s whether the current time matches the user's schedule). No server-side scheduling needed for MVP.

**Prerequisites:**

- Settings/Account screen must be created first (this is also needed for Delete Account).
- Notification permission must be requested and granted.

## Auth Setup Guide (Convex + Google OAuth)

### Prerequisites

Before running `npx convex dev` for the first time, create the following:

**Google Cloud Console:**

1. Create a project at https://console.cloud.google.com
2. Configure the OAuth consent screen (External, add your email as a test user)
3. Create an OAuth client (Web application type)
4. Authorized JavaScript origins: `http://localhost:5173` and `https://<your-project>.convex.site`
5. Authorized redirect URI: `https://<your-project>.convex.site/api/auth/callback/google`
   - Note: Google does NOT accept wildcards (`*`) in redirect URIs. Use your exact Convex deployment URL.

### Files Required

| File                    | Purpose                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `convex/auth.ts`        | Named exports: `auth`, `signIn`, `signOut`, `store` from `convexAuth({ providers: [Google] })` |
| `convex/auth.config.ts` | Default export: plain config `{ providers: [{ domain, applicationID }] }` for token validation |
| `convex/http.ts`        | HTTP router with `auth.addHttpRoutes(http)` — enables OAuth callback endpoints                 |

### Environment Variables

All set via `npx convex env set <KEY> <VALUE>`:

| Variable             | How to generate                           | Notes                                                |
| -------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `SITE_URL`           | `http://localhost:5173` (dev)             | Must match your Vite dev server                      |
| `AUTH_GOOGLE_ID`     | Copy from Google Cloud Console            |                                                      |
| `AUTH_GOOGLE_SECRET` | Copy from Google Cloud Console            |                                                      |
| `AUTH_SECRET`        | `base64` of 32 random bytes               | Used internally by auth library                      |
| `JWT_PRIVATE_KEY`    | RSA 2048-bit PKCS#8 PEM                   | Must be RSA (not EC). Newlines replaced with spaces. |
| `JWKS`               | JSON Web Key Set from matching public key | Must correspond to `JWT_PRIVATE_KEY`                 |
| `JWT_KID`            | Random UUID (lowercase)                   |                                                      |

**Generating JWT keys (requires `jose` package):**

```js
import { exportJWK, exportPKCS8, generateKeyPair } from 'jose';

const keys = await generateKeyPair('RS256', { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);

// Set these via npx convex env set:
// JWT_PRIVATE_KEY = privateKey with newlines → spaces
// JWKS = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] })
```

**Important:** `JWT_PRIVATE_KEY` must be an RSA key. EC/P-256 keys will fail with _"PrivateKeyInfo algorithm is not rsaEncryption"_. The key must be in PKCS#8 format, not a random base64 string (which fails with _"must be PKCS#8 formatted string"_).

### Common Errors & Solutions

| Error                                                       | Cause                                             | Fix                                                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Missing environment variable SITE_URL`                     | Not set                                           | `npx convex env set SITE_URL http://localhost:5173`                                                                     |
| `This Convex deployment does not have HTTP actions enabled` | Missing `convex/http.ts`                          | Create `convex/http.ts` with `auth.addHttpRoutes(http)`                                                                 |
| `Invalid Redirect: cannot contain a wildcard (*)`           | Wildcard in Google redirect URI                   | Use your exact Convex deployment URL                                                                                    |
| `No matching routes found`                                  | Wrong redirect URI format in Google               | Must be `https://<project>.convex.site/api/auth/callback/google`                                                        |
| `Missing environment variable JWT_PRIVATE_KEY`              | Not generated                                     | Generate RSA PKCS#8 key pair                                                                                            |
| `"pkcs8" must be PKCS#8 formatted string`                   | Used random base64, not a real key                | Generate a proper RSA key pair with `crypto.generateKeyPairSync` or `jose`                                              |
| `PrivateKeyInfo algorithm is not rsaEncryption`             | Used EC key instead of RSA                        | Use `"RS256"` algorithm (RSA 2048-bit)                                                                                  |
| `Environment variable AUTH_SECRET is used but not set`      | Missing config                                    | Set with `base64` of 32 random bytes                                                                                    |
| `No auth provider found matching the given token`           | `auth.config.ts` missing or wrong format          | Create with plain `export default { providers: [...] }`                                                                 |
| `Missing environment variable JWKS`                         | Only set private key, not public                  | Generate both from same key pair and set `JWKS`                                                                         |
| Login button stays after auth (client stuck)                | `HashRouter` intercepts OAuth callback URL params | Use `useConvexAuth()` hook directly instead of `Authenticated`/`Unauthenticated` wrapper components inside `HashRouter` |

### Client-Side Pattern

The `Authenticated`/`Unauthenticated` wrapper components from `convex/react` conflict with `HashRouter` because the router strips query parameters from the OAuth callback URL before the auth provider can process them. Solution: use the `useConvexAuth()` hook directly and conditionally render:

```tsx
function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginScreen />;

  return (
    <HashRouter>
      <Routes>...</Routes>
    </HashRouter>
  );
}
```
