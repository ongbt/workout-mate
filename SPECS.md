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

| Event | Audio cue |
|---|---|
| Exercise begins (mid-round) | `"{exercise name}. Go!"` |
| Exercise begins (new round) | `"Round {N}. {exercise name}. Go!"` |
| Rest begins (between exercises) | `"Rest for {N} seconds"` |
| Rest begins (between rounds) | `"Round {N} complete. Rest for {N} seconds"` |
| Last 5 seconds of any phase | Countdown: `"5"`, `"4"`, `"3"`, `"2"`, `"1"` (suppressed while announcement is playing) |
| Every 10 seconds (50, 40, 30, 20, 10) | `"{N} seconds"` |
| Last 5 seconds of any phase | Countdown: `"5"`, `"4"`, `"3"`, `"2"`, `"1"` |
| Workout complete | `"Workout complete! Great job!"` |
| New phase after skip | Appropriate transition cue |

Speech uses a rate of 0.9 for clarity and cancels any in-progress utterance before speaking a new one. The initial "Start Workout" tap satisfies the iOS user-gesture requirement for speech synthesis.

## Data Model

```typescript
interface Exercise {
  id: string;               // UUID v4
  name: string;             // User-provided label
  durationSeconds: number;  // Default 45, minimum 1
}

interface WorkoutConfig {
  id: string;               // UUID v4
  name: string;             // User-provided label
  exercises: Exercise[];    // Minimum 1 exercise
  restSeconds: number;              // Default 5, minimum 0
  restBetweenRoundsSeconds: number;  // Default 60, minimum 0
  rounds: number;                   // Default 2, minimum 1
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

| Path | Screen | Purpose |
|---|---|---|
| `#/` | Home | Workout list, create new |
| `#/workout/new` | Edit | Create a new workout set |
| `#/workout/:id` | Edit | Edit an existing workout set |
| `#/active/:id` | Active | Run a workout session |

Hash-based routing (`HashRouter`) ensures the PWA handles refreshes and direct URL access without server-side redirects.

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-first `@theme`) |
| Routing | react-router-dom 7 (HashRouter) |
| State | React Context + localStorage |
| Audio | Web Speech API (SpeechSynthesis) |
| IDs | uuid v4 |
| PWA | vite-plugin-pwa + workbox |
| Testing | Vitest + @testing-library/react + happy-dom |
| Package manager | pnpm |

## Design Principles

### Progressive enhancement for browser APIs

Every browser API used by the app (Speech Synthesis, Wake Lock, Web Audio) follows the same pattern: feature-detect with a falsy guard, wrap calls in try/catch, and fail silently. There are no "your browser doesn't support X" banners or fallback UI. The app is fully usable without any browser API — it just gets quieter.

Applies to:
- **Web Speech API** — `useSpeechSynthesis` checks `'speechSynthesis' in window` and returns no-ops if missing. All call sites call `speak()` unconditionally.
- **Wake Lock API** — `useWakeLock` checks `'wakeLock' in navigator` and catches all errors silently. Low battery, device policy, or missing support all degrade gracefully.
- **Web Audio API** — `useBeep` wraps `AudioContext` construction in try/catch and returns a no-op on failure.

### Two-tier announcement timing

Voice announcements fall into two categories with different timing semantics:

| Tier | Behavior | Examples |
|---|---|---|
| **Blocking** | Timer pauses until speech completes, then timer starts | *"Rest for 45 seconds"*, *"Push-ups. Go!"* |
| **Non-blocking** | Speech plays while timer is counting down | *"Next: Push-ups"*, countdown *"30 seconds"* |

Blocking announcements use `startTimerAfterSpeech(text, durationMs)` which passes the timer start as the `onEnd` callback to `speak()`. Non-blocking announcements use `speak()` directly with no callback. The `isSpeaking` flag in the countdown effect suppresses countdown ticks while any speech is active, preventing overlaps.

Edge cases handled:
- Starting a new blocking announcement cancels any in-flight utterance (via `speechSynthesis.cancel()` inside `speak()`)
- Non-blocking countdown speech (`"30 seconds"`) won't overlap with phase transitions because `isSpeaking` suppresses the tick
- The first countdown tick after a phase transition is suppressed (`suppressFirstReadoutRef`) regardless of tier

## Edge Cases & Behavior

| Scenario | Behavior |
|---|---|
| No workouts configured | Empty state with prompt to create first workout |
| All exercises deleted in editor | Delete button disabled when only 1 exercise remains |
| Timer reaches 0 while phone is asleep | `Date.now()` catches up on wake; phase completes correctly |
| Speech synthesis unavailable | App functions silently; no errors thrown |
| Corrupt localStorage data | Falls back to empty array; user data is lost but app is usable |
| User leaves active workout screen | Timer continues; returning shows current state |
| PWA update available | Toast prompt appears; user can update or dismiss |
| Background tab | Timer stays accurate via drift correction even if ticks are throttled |

## Defaults

| Parameter | Default |
|---|---|
| Exercise duration | 15 seconds |
| Rest between exercises | 5 seconds |
| Rest between rounds | 60 seconds |
| Rounds | 2 |
| Timer tick interval | 100ms |
| Countdown warning threshold | 5 seconds |
