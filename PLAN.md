# Anna's Half Marathon Training App — Build Plan

A React PWA that turns the existing HTML tracker into a polished, installable training companion for an 8-week Hal Higdon Novice 2 plan, race day **Sunday, August 2, 2026**.

---

## 1. Context

- Anna is training for a half marathon and currently has a single static HTML page with checkboxes (now at `reference/novice2_half_marathon_tracker.html`).
- The owner of this repo is a UI/UX developer — visual polish and interaction quality matter.
- Anna also plays ultimate frisbee — known tournament weekends collide with training Sundays (see §5).

## 2. Goals & non-goals

**Goals**
- Mobile-first, installable PWA that feels native from the home screen.
- Track planned workouts AND log actuals (distance, time, RPE, notes).
- Compute pace targets from a goal race time.
- Visualize weekly mileage + completion %.
- Handle real-life constraints: frisbee tournaments, unavailable days → plan reshuffles.
- Resilient persistence: localStorage + one-tap JSON export.
- Deployable to GitHub Pages with a single command.

**Non-goals**
- No accounts, cloud sync, auth.
- No Strava / Apple Health imports.
- No multi-user.

## 3. Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand (with persist middleware) |
| Persistence | localStorage + JSON export/import |
| Charts | Recharts |
| PWA | `vite-plugin-pwa` (Workbox) |
| Routing | React Router v6 (HashRouter for GH Pages) |
| Icons | Lucide |
| Date | `date-fns` |
| Deploy | `gh-pages` npm script |

## 4. Data model

```ts
type WorkoutType =
  | 'rest' | 'easy' | 'pace' | 'long'
  | 'cross' | 'race' | 'race-day' | 'tournament';

interface PlannedWorkout {
  id: string;          // "w1-tue"
  weekNumber: number;  // 1..8
  day: 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun';
  date: string;        // ISO yyyy-mm-dd
  type: WorkoutType;
  plannedMiles: number;
  label: string;
  note?: string;
  rescheduledFrom?: 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun';
}

interface LoggedWorkout {
  workoutId: string;
  completedAt: string;
  actualMiles?: number;
  actualMinutes?: number;
  perceivedEffort?: 1|2|3|4|5;
  notes?: string;
}

interface UnavailableRange {
  id: string;
  startDate: string;     // ISO
  endDate: string;       // ISO inclusive
  label: string;         // "Frisbee tournament"
  treatAs: 'rest' | 'tournament';
}

interface UserSettings {
  name?: string;
  goalRaceTime: { hours: number; minutes: number; seconds: number } | null;
  raceDate: string;            // default 2026-08-02
  units: 'mi' | 'km';
  unavailableRanges: UnavailableRange[];
}

interface AppState {
  settings: UserSettings;
  plan: PlannedWorkout[];      // generated from template + raceDate + unavailableRanges
  logs: Record<string, LoggedWorkout>;
}
```

## 5. Plan generation rules

**Base weekly pattern** (Sunday long-run version of Novice 2):

| Day | Type |
|---|---|
| Mon | Cross-train |
| Tue | Rest |
| Wed | Easy |
| Thu | Pace |
| Fri | Easy |
| Sat | Rest |
| Sun | Long run |

**Generator flow:**
1. Start from race date (Sun Aug 2, 2026), Week 8 ends there.
2. Walk back 7 weeks → Week 1 = Mon Jun 8 – Sun Jun 14.
3. Apply the per-week mileage template (existing Novice 2 progression: 7, 8, 9 mi long runs etc., taper in Week 8).
4. For each `UnavailableRange` that intersects a training day:
   - If the long run (Sun) is blocked, **move it to Thursday** of the same week, displacing the Thursday pace run (Thursday pace run → Wednesday, Wednesday easy → drop or merge).
   - If a non-long-run day is blocked, mark that day as `tournament`/`rest` (per `treatAs`) and don't reshuffle.
5. Recompute plan whenever `unavailableRanges` or `raceDate` changes.

**Known tournament weekends (2026):**

| Dates | Training week affected | Adjustment |
|---|---|---|
| Jun 6–7 | Pre-training | None |
| Jun 12–14 | Week 1 (Jun 8–14) | Long run shifts to **Thu Jun 11** |
| Jul 11–12 | Week 5 (Jul 6–12) | Long run shifts to **Thu Jul 9** |
| Jul 16–19 | Week 6 (Jul 13–19) | Long run shifts to **Thu Jul 16**, but Thu is also tournament — need to shift to **Wed Jul 15** instead. See note below. |

> **Note on Jul 16–19**: tournament runs Thu–Sun (4 days), so even Thursday is unavailable. Generator must walk back further to find the first available weekday (Wed Jul 15) and reshuffle accordingly. This is a real edge case the algorithm needs to handle, not just "shift to Thursday."

**Pace derivation** from `goalRaceTime`:
- Race pace = `goalRaceTime / 13.1` (min/mi)
- Easy pace = race pace + 60–90s
- Long-run pace = race pace + 45–90s
- Show as a range per workout.

## 6. Screens / IA

1. **Today** (`/`) — today's workout hero, "Mark complete" + "Log details", days-to-race chip, this-week mini-stats.
2. **Plan** (`/plan`) — all 8 weeks expandable; active week pre-open; tournament days visually distinct; rescheduled days show "moved from Sun".
3. **Progress** (`/progress`) — weekly mileage chart (planned vs actual), completion %, streak, longest run.
4. **Settings** (`/settings`) — name, goal time → pace table, race date, **unavailable date ranges (add/edit/remove)**, units, JSON export/import, reset.

Bottom tab bar (mobile).

## 7. Visual direction

Clean & sporty: Inter, off-white bg, near-black text, green accent (`#1D9E75`), workout-type tints (easy=neutral, pace=blue, long=purple, tournament=amber, race=green), big numbers, 12px radius cards, subtle motion.

## 8. Milestones

| # | Milestone |
|---|---|
| 1 | Scaffold + GH Pages deploy pipeline working |
| 2 | Plan generator (template + unavailableRanges → PlannedWorkout[]) + Plan screen |
| 3 | Today screen + check-off persistence |
| 4 | Workout logging sheet (actuals + RPE + notes) |
| 5 | Onboarding + Settings (name, goal time, pace calc, race date, unavailable ranges) |
| 6 | Progress screen (charts, streak, totals) |
| 7 | PWA polish (manifest, icons, service worker, install) + JSON backup/restore |
| 8 | Visual polish, animations, empty states, share-recap (stretch) |

## 9. GH Pages deploy

- Repo: `redwylie/annas-half-marathon`, public.
- URL: `https://redwylie.github.io/annas-half-marathon/`.
- `vite.config.ts` → `base: '/annas-half-marathon/'`.
- HashRouter for refresh resilience.
- `npm run deploy` → `vite build && gh-pages -d dist`.

## 10. Persistence & backup

- Zustand persisted to localStorage under `mhmt_v1` with `version: 1` for migrations.
- Settings: Download Backup (timestamped .json), Restore from Backup (file picker), Reset.
- Toast after each Sunday long-run log: "Tip: download a backup" (throttled).

## 11. Risks & gotchas

- iOS storage eviction → backup feature mitigates.
- SW caching during dev → keep PWA dev-mode off until Milestone 7.
- Plan generator complexity: multi-day tournaments that block the long-run reshuffle target (e.g. Jul 16–19) need a "walk back to next available day" algorithm, not a hardcoded "move to Thursday."
- **Lost work risk** (already hit once): scaffold tools with `--overwrite` flags wipe directories. Always commit before destructive operations.

## 12. Locked decisions

- Race date: **Sunday, August 2, 2026**.
- App name: **Anna's Half Marathon Training App**.
- Repo: `redwylie/annas-half-marathon` (public).
- Weekly pattern: Mon cross · Tue rest · Wed easy · Thu pace · Fri easy · Sat rest · **Sun long**.
- Long-run reschedule default: **Thursday** (per-week override possible later).
- Tournament days: first-class workout type.
- Unavailable ranges: editable in Settings.
- First launch: onboarding (name + goal time), skippable.
