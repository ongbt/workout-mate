# ExerciseDB Integration — Implementation Plan

## Context

Users currently type exercise names manually. We're integrating ExerciseDB from RapidAPI to let users search exercises by body part, select them, and see animated GIFs during workouts. Each user brings their own RapidAPI key (stored in the DB), and custom/manual exercises remain supported without a key.

---

## 1. Data Model Changes

### 1.1 `convex/schema.ts` — expanded exercise fields

The `exercises` array inside `workouts` and `defaultWorkouts` gains 4 new optional fields:

```typescript
v.object({
  id: v.string(), // unchanged — UUID v4
  name: v.string(), // unchanged
  durationSeconds: v.number(), // unchanged
  exerciseDbId: v.optional(v.string()), // NEW — ExerciseDB reference ID
  bodyPart: v.optional(v.string()), // NEW — e.g. "chest", "upper legs"
  targetMuscle: v.optional(v.string()), // NEW — e.g. "pectorals"
  imageUrl: v.optional(v.string()), // NEW — GIF URL from ExerciseDB
});
```

All four are `v.optional()` so existing workouts and custom exercises work without them.

### 1.2 `convex/schema.ts` — new `userSettings` table

```typescript
userSettings: defineTable({
  rapidApiKey: v.optional(v.string()),
  userId: v.id('users'),
}).index('by_user', ['userId']),
```

Stores each user's personal RapidAPI key. One row per user, created on first key save.

### 1.3 `convex/schema.ts` — new `exerciseLibrary` table

```typescript
exerciseLibrary: defineTable({
  exerciseDbId: v.string(),               // ExerciseDB ID
  name: v.string(),
  bodyPart: v.string(),
  targetMuscle: v.string(),
  equipment: v.optional(v.string()),
  imageUrl: v.string(),                   // GIF URL
  instructions: v.optional(v.array(v.string())),
  cachedAt: v.number(),                   // Date.now() on insert/refresh
}).index('by_exerciseDbId', ['exerciseDbId'])
  .index('by_bodyPart', ['bodyPart']),
```

Shared cache for ExerciseDB results. Populated synchronously before search results are returned to the client.

### 1.4 `convex/validators.ts` — extract shared validator

Move the `exerciseValidator` definition from `convex/workouts.ts:6-10` into `convex/validators.ts` so both the `workouts` and `exerciseLibrary` tables can reference it. `convex/workouts.ts` imports it back.

---

## 2. Backend Logic & API Changes

No backend changes can be avoided here — we need Convex actions (the project has none yet) to proxy RapidAPI calls server-side, and we need mutations/queries to manage per-user API keys.

### 2.1 `convex/userSettings.ts` (NEW)

| Export              | Type     | Args              | Behavior                                                                                                 |
| ------------------- | -------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `get`               | query    | none              | Returns the current user's settings doc (or null)                                                        |
| `setRapidApiKey`    | mutation | `key: v.string()` | Validates key is 20-200 chars and non-empty after trim. Upserts `userSettings` row for the current user. |
| `removeRapidApiKey` | mutation | none              | Sets `rapidApiKey` to `undefined` on the user's settings row                                             |

**Input validation** (per CLAUDE.md: "strings are sanitized and length-capped"):

- `setRapidApiKey` trims the key, rejects empty strings, caps at 200 chars
- Returns a user-facing error message if validation fails (client shows via ErrorContext)

The `get` query is used by actions to retrieve the key at call time. The client uses `setRapidApiKey`/`removeRapidApiKey` for the key input UI.

### 2.2 `convex/exerciseDb.ts` (NEW)

Public actions (called from client via `useAction`):

| Export           | Type   | Args                   | Returns                                               |
| ---------------- | ------ | ---------------------- | ----------------------------------------------------- |
| `listBodyParts`  | action | none                   | `string[]` — body part names from ExerciseDB          |
| `listByBodyPart` | action | `bodyPart: v.string()` | `ExerciseDbExercise[]` — exercises for that body part |
| `searchByName`   | action | `name: v.string()`     | `ExerciseDbExercise[]` — name-matched exercises       |

Internal helpers (not exposed to client):

| Export           | Type             | Purpose                                                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `cacheExercises` | internalMutation | Upserts each exercise into `exerciseLibrary` by `exerciseDbId`, refreshing `cachedAt` |

**Auth + key retrieval pattern** (shared by all three actions):

```
1. userId = await getAuthUserId(ctx)
   if (!userId) throw "Not authenticated"

2. settings = await ctx.db.query('userSettings')
     .withIndex('by_user', q => q.eq('userId', userId)).first()

3. if (!settings?.rapidApiKey) throw "No RapidAPI key configured"

4. response = await fetch(`https://exercisedb.p.rapidapi.com/...`, {
     headers: {
       'X-RapidAPI-Key': settings.rapidApiKey,
       'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
     },
   })

5. await ctx.runMutation(internal.exerciseDb.cacheExercises, { exercises: data })
   // ^ synchronous — guarantees records are in exerciseLibrary before returning

6. return data
```

**Input validation** (per global CLAUDE.md — "Every mutation validates args server-side. Strings are sanitized and length-capped"):

- `listByBodyPart`: `bodyPart` arg is trimmed and capped at 100 chars
- `searchByName`: `name` arg is trimmed, capped at 200 chars, and rejects empty strings
- `cacheExercises`: each exercise's `name` is capped at 200 chars, `bodyPart`/`targetMuscle` at 100 chars
- `setRapidApiKey`: key is trimmed, validated as 20-200 chars (RapidAPI keys are typically ~50 chars)

**Rate limiting** (per tasks.md — "Add rate limiting on public Convex write endpoints"):

- Each exerciseDb action is rate-limited per-user using a simple pattern: store last request timestamp + count in `userSettings`, reject if more than 30 requests in a 60-second window
- The client handles 429-like rejections with a "Too many requests, please wait" message in the modal

**Why actions and not direct client-side fetch**: user keys must stay server-side. If we called RapidAPI from the browser, the key would be visible in the Network tab and JS bundle.

### 2.3 `convex/workouts.ts` — remove local validator

Change line 6-10: delete the local `exerciseValidator` definition and import it from `./validators` instead. No mutation/query signature changes needed — the `v.optional()` fields are accepted automatically.

---

## 3. Frontend Dependencies

**No new npm packages.** The project already has everything needed:

| Dependency                | Usage                                                        |
| ------------------------- | ------------------------------------------------------------ |
| `@base-ui/react` `^1.4.1` | Dialog component for the search modal                        |
| `lucide-react` `^1.14.0`  | Search, X, ChevronUp/Down icons                              |
| `uuid`                    | Generate `id` for new exercises                              |
| `framer-motion`           | Existing — used in WorkoutActiveScreen for phase transitions |
| React 19 `useAction`      | Convex hook for calling actions                              |

---

## 4. Frontend Component Hierarchy & Layout Positions

### 4.1 Current React tree (authenticated routes)

```
App
└── HashRouter
    └── Routes
        ├── "/" → HomeScreen
        │         └── WorkoutSetCard[]           ← no changes needed
        │
        ├── "/workout/new" | "/workout/:workoutId" → WorkoutEditScreen
        │   ├── <header>                          ← back button, title
        │   ├── <form fields>                     ← name, rounds, rest inputs
        │   ├── <exercise list header>            ← "Exercises" label + buttons row
        │   │   ├── [import template button]      ← existing, unchanged
        │   │   ├── [+ Add] button                ← EXISTING, kept for custom exercises
        │   │   └── [Browse Library] button       ← NEW — opens ExerciseSearchModal
        │   ├── ExerciseFormRow[]                 ← MODIFIED — shows thumbnail + body part
        │   ├── <save/delete buttons>
        │   ├── ExerciseSearchModal (Dialog)      ← NEW — body part filter + search + results
        │   │   └── RapidApiKeyInput              ← NEW — shown when user has no key
        │   ├── DeleteConfirmDialog               ← existing, unchanged
        │   └── ImportTemplateDialog              ← existing, unchanged
        │
        └── "/active/:workoutId" → WorkoutActiveScreen
            └── WorkoutActiveContent
                ├── <header>                      ← unchanged
                ├── PhaseIndicator                ← unchanged
                ├── TimerDisplay                  ← unchanged
                ├── Exercise name                 ← unchanged
                ├── Exercise GIF <img>            ← NEW — between name and next hint
                ├── Next exercise hint            ← unchanged
                ├── ProgressBar                   ← unchanged
                ├── Exercise round grid           ← MODIFIED — adds small thumbnail
                └── ControlButtons                ← unchanged
```

### 4.2 ExerciseSearchModal — spatial position

The modal is a **full-height Dialog** overlay centered on screen. It uses the existing `Dialog`/`DialogContent` components from `src/components/ui/dialog.tsx` (@base-ui/react primitives). It renders inside `WorkoutEditScreen`, triggered by a "Browse Library" button in the exercise list header.

```
┌────────────────────────────────────────────────────┐
│  WorkoutEditScreen (dimmed behind overlay)          │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  ExerciseSearchModal (DialogContent)          │   │
│  │  max-h-[85vh], w-full, flex flex-col          │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │  DialogHeader                             │ │   │
│  │  │  "Add Exercise" title + description       │ │   │
│  │  │  ┌────────────────────────────────────┐  │ │   │
│  │  │  │ RapidApiKeyInput (conditional)      │  │ │   │
│  │  │  │ "Enter your RapidAPI key to browse" │  │ │   │
│  │  │  │ [________key_input________] [Save]  │  │ │   │
│  │  │  └────────────────────────────────────┘  │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │  Body Part Chips (horizontal scroll)      │ │   │
│  │  │  [All] [back] [chest] [upper arms] ...    │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │  Search Bar                               │ │   │
│  │  │  [🔍 Search exercises...                ] │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │  Results List (scrollable, flex-1)        │ │   │
│  │  │                                            │ │   │
│  │  │  ┌────┬───────────────────┬────────┐     │ │   │
│  │  │  │GIF │ Push-ups          │  + Add │     │ │   │
│  │  │  │64px│ Chest · pectorals │        │     │ │   │
│  │  │  └────┴───────────────────┴────────┘     │ │   │
│  │  │  ┌────┬───────────────────┬────────┐     │ │   │
│  │  │  │GIF │ Squats            │  + Add │     │ │   │
│  │  │  │64px│ Upper legs · quads│        │     │ │   │
│  │  │  └────┴───────────────────┴────────┘     │ │   │
│  │  │  ...                                     │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  │                                                │   │
│  │  ┌──────────────────────────────────────────┐ │   │
│  │  │  DialogFooter                             │ │   │
│  │  │  [Done]  (closes modal)                   │ │   │
│  │  └──────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 4.3 ExerciseFormRow — spatial changes

Current row layout:

```
[▲] [▼] [____name_input____] [dur] [✕]
```

Modified row layout (when exercise has image/bodyPart):

```
[▲] [▼] [🖼28px] [name_input          ] [dur] [✕]
              bodyPart · targetMuscle
```

Changes are: a 28×28 rounded thumbnail (if `exercise.imageUrl`), and a muted badge row below the name showing body part and target muscle (if present). Name input remains editable for all exercises.

### 4.4 WorkoutActiveScreen — GIF position

During `phase === 'exercise'` (lines 172-196), a GIF is inserted **between the exercise name `<h3>` and the "Next:" hint**:

```
┌──────────────────────────────┐
│         TimerDisplay         │  ← SVG donut (existing)
│         (countdown)          │
│                              │
│       Push-ups               │  ← exercise name (existing)
│                              │
│   ┌──────────────────────┐   │
│   │                      │   │  ← NEW: exercise GIF
│   │    Animated GIF      │   │    h-48 w-48 rounded-2xl
│   │    (exercise demo)   │   │    object-cover, mx-auto
│   │                      │   │
│   └──────────────────────┘   │
│                              │
│    Next: Squats              │  ← next hint (existing)
└──────────────────────────────┘
```

During `phase === 'idle'` (exercise list preview, line 244-255), each exercise row gains a small 24×24 thumbnail before the name if `imageUrl` exists.

During the exercise round grid (lines 302-363), each row gains a 20×20 thumbnail.

---

## 5. User Interactions

### 5.1 Adding a custom exercise (no API key needed)

```
[+ Add] button click
  → dispatches ADD_EXERCISE
  → new Exercise { id: uuid(), name: '', durationSeconds: 15 }
  → row appears, user types name
  → optional fields (exerciseDbId, bodyPart, etc.) remain undefined
```

### 5.2 Browsing ExerciseDB (requires API key)

```
[Browse Library] button click
  → if user has no key → modal opens showing RapidApiKeyInput
  → if user has key → modal opens with body part chips and results

Within modal — body part filter:
  [All] chip (selected by default) → shows first 50 exercises from API
  Tap [chest] chip → calls listByBodyPart action → results update
  Chips use horizontal scroll when content overflows

Within modal — search:
  Type "push" in search bar → debounce 300ms
  → if body part filter is active: filter results client-side
  → if "All" is selected: call searchByName action
  → results update with matching exercises

Within modal — empty state:
  No results found → "No exercises match your search" message

Within modal — error state:
  API call fails → "Unable to load exercises. Try again." with retry button
  Rate limited → specific message about limits

Within modal — key not configured:
  RapidApiKeyInput displayed at top
  Text: "Enter your RapidAPI key from rapidapi.com to browse exercises"
  Input (type=password) + [Save] button
  On save → calls setRapidApiKey mutation → modal transitions to browsing state

Within modal — add exercise:
  Tap [+ Add] on a result row
  → dispatches ADD_EXERCISE_FROM_LIBRARY with all metadata
  → Exercise { id: uuid(), exerciseDbId, name, durationSeconds: 15,
               bodyPart, targetMuscle, imageUrl }
  → row appears in form below
  → modal stays open (user can add more)
  → confirmation feedback: brief "Added" state on the button

Within modal — done:
  Tap [Done] in footer → closes modal
  Tap overlay backdrop → closes modal (existing Dialog behavior)
  Tap X close button → closes modal (existing Dialog behavior)
```

### 5.3 RapidApiKeyInput component

A self-contained form for entering/updating the RapidAPI key:

```
┌─────────────────────────────────────────────┐
│  Enter your RapidAPI key to browse exercises │
│  Get one at rapidapi.com                     │
│                                              │
│  [________________________________] [Save]  │
│  (type=password input)                       │
│                                              │
│  [Remove key] (link, only shown if key exists)
└─────────────────────────────────────────────┘
```

States: idle, saving (loading spinner on Save button), saved (brief checkmark feedback), error (invalid key message).

### 5.4 Viewing exercise GIF during workout

Completely passive — no user interaction with the GIF. It displays automatically when `phase === 'exercise'` and `currentExercise.imageUrl` exists. If the image fails to load (broken URL, network issue), the `<img>` collapses gracefully (no broken image icon visible — use `object-cover` with a fallback approach or just let it be empty since `imageUrl` is optional).

### 5.5 Five-state coverage for ExerciseSearchModal

Per global CLAUDE.md: "Every data-fetching component must handle loading (skeleton, not spinner), empty (with CTA), error (with retry), success, and disabled (with explanation why)."

| State        | Visual                                                                                                                                                                         | Behavior                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**  | Skeleton placeholders: 5 rows of gray pulsing bars matching result row shape (64px circle + two text lines)                                                                    | Shown while `useAction` is in-flight. Replaces previous results (no stale content).                                                           |
| **Empty**    | "No exercises found" illustration + "Try a different body part or search term" CTA                                                                                             | Shown when API returns empty array or client-side filter yields nothing.                                                                      |
| **Error**    | "Unable to load exercises" message + "Try Again" button                                                                                                                        | Shown when action throws. Retry button re-invokes the last action. `ErrorContext` is NOT used here — the modal handles its own errors inline. |
| **Success**  | Scrollable list of result rows (thumbnail + name + badges + Add button)                                                                                                        | Normal state. Results are interactive.                                                                                                        |
| **Disabled** | Body part chips and search bar are disabled. Existing results remain visible but "Add" buttons are replaced with a muted lock icon. Shown when user has no API key configured. | Shown when `hasRapidApiKey === false`. A prompt to enter key is displayed above.                                                              |

---

## 6. TypeScript Types

### 6.1 `src/types/workout.ts` — expand Exercise

```typescript
export interface Exercise {
  id: string;
  exerciseDbId?: string; // NEW
  name: string;
  durationSeconds: number;
  bodyPart?: string; // NEW
  targetMuscle?: string; // NEW
  imageUrl?: string; // NEW
}
```

### 6.2 `src/types/exerciseDb.ts` (NEW)

```typescript
// Shape returned by ExerciseDB API
export interface ExerciseDbExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

// What the search modal displays in results
export interface ExerciseSearchResult {
  exerciseDbId: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  imageUrl: string;
  equipment: string;
}

// What gets passed back to WorkoutEditScreen on selection
export interface ExerciseSearchSelection {
  exerciseDbId: string;
  name: string;
  bodyPart: string;
  targetMuscle: string;
  imageUrl: string;
}
```

---

## 7. File Changes — Complete List

### New files (11)

| #   | File                                          | Purpose                                          |
| --- | --------------------------------------------- | ------------------------------------------------ |
| 1   | `convex/userSettings.ts`                      | get/set/remove RapidAPI key per user             |
| 2   | `convex/exerciseDb.ts`                        | actions (API proxy) + internal mutation (cache)  |
| 3   | `src/types/exerciseDb.ts`                     | ExerciseDbExercise, ExerciseSearchResult types   |
| 4   | `src/lib/exerciseDb.ts`                       | API host/URL constants                           |
| 5   | `src/hooks/useExerciseSearch.ts`              | action calls, debounce, body part state, results |
| 6   | `src/hooks/useUserSettings.ts`                | wraps api.userSettings queries/mutations         |
| 7   | `src/components/ExerciseSearchModal.tsx`      | modal with body part chips, search, results      |
| 8   | `src/components/RapidApiKeyInput.tsx`         | key entry form (used inside modal)               |
| 9   | `src/hooks/useExerciseSearch.test.ts`         | unit tests for search hook                       |
| 10  | `src/hooks/useUserSettings.test.ts`           | unit tests for settings hook                     |
| 11  | `src/components/ExerciseSearchModal.test.tsx` | integration tests for modal                      |

### Modified files (13)

| #   | File                                     | Changes                                                                                                                                             |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | `convex/schema.ts`                       | Add 4 optional fields to exercise objects in `workouts` + `defaultWorkouts`; add `userSettings` table; add `exerciseLibrary` table                  |
| 13  | `convex/validators.ts`                   | Add shared `exerciseValidator` export with expanded fields                                                                                          |
| 14  | `convex/workouts.ts`                     | Remove local `exerciseValidator`, import from `./validators`                                                                                        |
| 15  | `src/types/workout.ts`                   | Add 4 optional fields to `Exercise` interface                                                                                                       |
| 16  | `src/components/ExerciseFormRow.tsx`     | Add thumbnail `<img>` (28×28) if `imageUrl`; add bodyPart/targetMuscle badges below name input                                                      |
| 17  | `src/screens/WorkoutEditScreen.tsx`      | Add `ADD_EXERCISE_FROM_LIBRARY` reducer action; add "Browse Library" button next to "+ Add"; add modal open/close state; render ExerciseSearchModal |
| 18  | `src/screens/WorkoutActiveScreen.tsx`    | Add GIF `<img>` in exercise phase (between name and next hint); add thumbnail in idle list; add thumbnail in round grid                             |
| 19  | `src/components/Layout.tsx`              | Add CDN domain to `img-src` in `CSP_POLICY`                                                                                                         |
| 20  | `public/_headers`                        | Add CDN domain to `img-src` in CSP                                                                                                                  |
| 21  | `src/i18n/index.ts`                      | Add translation keys for modal, key input, body parts, search states                                                                                |
| 22  | `src/screens/WorkoutEditScreen.test.tsx` | Add tests for Browse Library button, library exercise selection                                                                                     |
| 23  | `e2e/exercise-library.spec.ts`           | E2E test for full browse-add-play flow                                                                                                              |

---

## 8. Implementation Order

### Phase 1 — Schema + validators (no breaking changes)

1. Update `convex/schema.ts` (file 12)
2. Update `convex/validators.ts` (file 13)
3. Update `convex/workouts.ts` (file 14)
4. Run `npx convex dev` to regenerate types → verify no errors

### Phase 2 — Backend actions + user settings

5. Create `convex/userSettings.ts` (file 1)
6. Create `convex/exerciseDb.ts` (file 2)
7. Run `npx convex dev` → verify actions register

### Phase 3 — Types, lib, hooks

8. Create `src/types/exerciseDb.ts` (file 3)
9. Update `src/types/workout.ts` (file 15)
10. Create `src/lib/exerciseDb.ts` (file 4)
11. Create `src/hooks/useUserSettings.ts` (file 6)
12. Create `src/hooks/useExerciseSearch.ts` (file 5)

### Phase 4 — UI components

13. Create `src/components/RapidApiKeyInput.tsx` (file 8)
14. Create `src/components/ExerciseSearchModal.tsx` (file 7)
15. Update `src/components/ExerciseFormRow.tsx` (file 16)
16. Update `src/screens/WorkoutEditScreen.tsx` (file 17)
17. Update `src/screens/WorkoutActiveScreen.tsx` (file 18)

### Phase 5 — Security + i18n

18. Update `src/components/Layout.tsx` CSP (file 19)
19. Update `public/_headers` (file 20)
20. Update `src/i18n/index.ts` (file 21)

### Phase 6 — Tests

21. Create `src/hooks/useUserSettings.test.ts` (file 10)
22. Create `src/hooks/useExerciseSearch.test.ts` (file 9)
23. Create `src/components/ExerciseSearchModal.test.tsx` (file 11)
24. Update `src/screens/WorkoutEditScreen.test.tsx` (file 22)
25. Create `e2e/exercise-library.spec.ts` (file 23)
26. Run `pnpm test` → all tests pass
27. Run `pnpm lint && pnpm format:check` → no errors

---

## 9. Testing Strategy

Per global CLAUDE.md: "Unit 80-90%, integration 60-80%, E2E for critical flows. Focus on auth, permissions, state transitions, and core business logic. Co-locate test files with source in `src/`."

### 9.1 Unit tests — `src/hooks/useExerciseSearch.test.ts` (NEW)

| Test                                             | What it verifies                                         |
| ------------------------------------------------ | -------------------------------------------------------- |
| Returns `needsApiKey: true` when user has no key | `useUserSettings` returns `hasKey: false`                |
| Returns body parts list on mount (with key)      | Calls `listBodyParts` action, returns sorted list        |
| Changes selected body part and refetches         | `setSelectedBodyPart('chest')` triggers `listByBodyPart` |
| Debounces search by 300ms                        | Rapid typing doesn't fire multiple action calls          |
| Sets error state on action failure               | Action rejects → `error` is set, `results` is empty      |
| Sets loading state during fetch                  | `isLoading` is true while action is in-flight            |

### 9.2 Unit tests — `src/hooks/useUserSettings.test.ts` (NEW)

| Test                                             | What it verifies                                 |
| ------------------------------------------------ | ------------------------------------------------ |
| `hasRapidApiKey` returns false for new user      | Query returns null                               |
| `hasRapidApiKey` returns true after key is set   | Query returns settings with key                  |
| `setRapidApiKey` calls mutation with trimmed key | Input " abc123 " → mutation called with "abc123" |
| `setRapidApiKey` rejects empty key               | Input "" → validation error, mutation not called |

### 9.3 Integration tests — `src/components/ExerciseSearchModal.test.tsx` (NEW)

| Test                                       | What it verifies                                  |
| ------------------------------------------ | ------------------------------------------------- |
| Renders key input when user has no key     | `hasRapidApiKey=false` → RapidApiKeyInput visible |
| Renders body part chips after key is saved | Key saved → chips appear                          |
| Renders skeleton during loading            | `isLoading=true` → skeleton rows visible          |
| Renders empty state when no results        | Empty array → "No exercises found" message        |
| Renders error state with retry button      | Action fails → error message + retry button       |
| Calls `onSelect` when Add button clicked   | Click Add → `onSelect` called with correct data   |
| "Added" feedback on button after selection | Button text changes briefly to "Added"            |

### 9.4 Integration tests — `src/screens/WorkoutEditScreen.test.tsx` (MODIFY existing)

| Test                                                         | What it verifies                                          |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| "+ Add" button creates blank exercise row                    | Existing behavior, ensure it still works                  |
| "Browse Library" button opens modal                          | Click → ExerciseSearchModal rendered                      |
| Exercise from library appears in form after selection        | `onSelect` → new row with pre-filled name + metadata      |
| Saving workout with library exercises calls correct mutation | `handleSave` → `api.workouts.create` with expanded fields |

### 9.5 E2E tests — `e2e/exercise-library.spec.ts` (NEW)

| Test                                       | What it verifies                                            |
| ------------------------------------------ | ----------------------------------------------------------- |
| Custom exercise flow works without API key | +Add → type name → save → start → no broken images          |
| Set API key and browse library             | Open modal → enter key → save → body parts appear           |
| Add exercise from library to workout       | Select body part → search → add → appears in form           |
| Complete workout with library exercise     | Save → start → GIF visible → complete → session recorded    |
| Edit existing workout with mixed exercises | Open edit → library + custom exercises both shown correctly |

---

## 10. Verification

### 10.1 Backend verification

- [ ] `npx convex dev` starts without schema or compilation errors
- [ ] `api.userSettings.get` returns null for new user
- [ ] `api.userSettings.setRapidApiKey` upserts and key is retrievable
- [ ] `api.exerciseDb.listBodyParts` returns body part list (with valid key)
- [ ] `api.exerciseDb.listByBodyPart` returns exercises for "chest"
- [ ] `api.exerciseDb.searchByName` returns matching exercises for "push"
- [ ] `api.exerciseDb.*` throws clear error when user has no key configured

### 10.2 Frontend — no-key flow

- [ ] Fresh user (no key): "+ Add" creates blank exercise row
- [ ] "Browse Library" button visible
- [ ] Click "Browse Library" → modal shows RapidApiKeyInput
- [ ] Enter key → Save → modal transitions to browsing state
- [ ] Key persists across page reloads

### 10.3 Frontend — key configured flow

- [ ] Click "Browse Library" → body part chips load
- [ ] Select "chest" chip → exercises load with thumbnails
- [ ] Search "push" → filtered results
- [ ] Tap "+ Add" → exercise appears in workout form with name, thumbnail, body part badge
- [ ] Modal stays open → can add more exercises
- [ ] Tap "Done" → modal closes

### 10.4 Frontend — mixed workout

- [ ] Create workout with 2 library exercises + 1 custom exercise
- [ ] Save → persists to Convex
- [ ] Re-open edit → all exercises present with correct metadata

### 10.5 Frontend — timer screen

- [ ] Start workout with ExerciseDB exercises → GIF displays during exercise phase
- [ ] GIF is centered below exercise name, above "Next:" hint
- [ ] Custom exercise (no imageUrl) → no broken image, just the name
- [ ] Idle phase → thumbnails show in exercise list
- [ ] Active exercise grid → small thumbnails next to exercise names

### 10.6 Security

- [ ] No RapidAPI key visible in browser DevTools (Network, Sources, LocalStorage)
- [ ] CSP allows loading images from ExerciseDB CDN (no console CSP errors)
- [ ] GIFs actually render (not blocked by CSP)

### 10.7 Regression

- [ ] Existing workouts (pre-ExerciseDB) load and play without errors
- [ ] Default workout templates import correctly
- [ ] Session recording still works
- [ ] Auth flows unchanged
