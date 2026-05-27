import type { LoggedWorkout, PlanWeek, PlannedWorkout } from './types'

export interface WeekStats {
  weekNumber: number
  label: string
  plannedMiles: number
  actualMiles: number
  workoutsTotal: number
  workoutsDone: number
}

export interface PlanStats {
  weeks: WeekStats[]
  totalPlannedMiles: number
  totalActualMiles: number
  totalWorkouts: number
  totalCompleted: number
  longestRunMiles: number
  longestRunLabel: string | null
  currentStreak: number
  bestStreak: number
}

export function computeStats(
  weeks: PlanWeek[],
  logs: Record<string, LoggedWorkout>,
): PlanStats {
  // Round to 1 decimal to avoid float-summation noise (3.1 + 6.2 + 13.1 -> 22.4...0001)
  const round1 = (n: number) => Math.round(n * 10) / 10

  const weekStats: WeekStats[] = weeks.map((w) => {
    const trackable = w.workouts.filter((x) => x.type !== 'rest')
    const planned = trackable.reduce((s, x) => s + x.plannedMiles, 0)
    const done = trackable.filter((x) => logs[x.id]).length
    const actual = trackable
      .filter((x) => logs[x.id])
      .reduce((s, x) => s + (logs[x.id]?.actualMiles ?? x.plannedMiles), 0)
    return {
      weekNumber: w.weekNumber,
      label: w.label,
      plannedMiles: round1(planned),
      actualMiles: round1(actual),
      workoutsTotal: trackable.length,
      workoutsDone: done,
    }
  })

  // Longest run actually logged (else fall back to the largest single planned long-run if completed).
  let longest = 0
  let longestLabel: string | null = null
  for (const w of weeks) {
    for (const wo of w.workouts) {
      const log = logs[wo.id]
      if (!log) continue
      const miles = log.actualMiles ?? wo.plannedMiles
      if (miles > longest) {
        longest = miles
        longestLabel = wo.label
      }
    }
  }

  // Streak: consecutive in-order workouts completed.
  // We walk the workouts in date order; rest days count if completed, skip if not.
  const ordered: PlannedWorkout[] = weeks
    .flatMap((w) => w.workouts)
    .filter((w) => w.type !== 'rest')

  let current = 0
  let best = 0
  let running = 0
  for (const w of ordered) {
    if (logs[w.id]) {
      running++
      if (running > best) best = running
    } else {
      running = 0
    }
  }
  current = running // streak going forward from the most recent break

  return {
    weeks: weekStats,
    totalPlannedMiles: round1(weekStats.reduce((s, w) => s + w.plannedMiles, 0)),
    totalActualMiles: round1(weekStats.reduce((s, w) => s + w.actualMiles, 0)),
    totalWorkouts: weekStats.reduce((s, w) => s + w.workoutsTotal, 0),
    totalCompleted: weekStats.reduce((s, w) => s + w.workoutsDone, 0),
    longestRunMiles: longest,
    longestRunLabel: longestLabel,
    currentStreak: current,
    bestStreak: best,
  }
}
