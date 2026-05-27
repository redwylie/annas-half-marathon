import { addDays, format, parseISO, startOfWeek, isWithinInterval } from 'date-fns'
import type {
  DayOfWeek,
  PlanWeek,
  PlannedWorkout,
  UnavailableRange,
  WorkoutOverride,
} from './types'
import { TEMPLATE } from './template'

const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

/** Returns the Monday that begins the week containing `date`. */
function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

/** True if the ISO date falls within any of the provided ranges (inclusive). */
function isBlocked(dateISO: string, ranges: UnavailableRange[]): UnavailableRange | undefined {
  const d = parseISO(dateISO)
  return ranges.find((r) =>
    isWithinInterval(d, { start: parseISO(r.startDate), end: parseISO(r.endDate) }),
  )
}

/**
 * The workout label for a blocked day. Tournament-type blocks become
 * 'Cross-training' (the badge already carries the 'Frisbee tournament'
 * flavor). Plain rest blocks just say 'Rest'.
 */
function labelForBlock(range: UnavailableRange): string {
  return range.treatAs === 'tournament' ? 'Cross-training' : 'Rest'
}

/**
 * Build the 8-week plan given a race date and a list of unavailable ranges.
 *
 * - The race date is the final Sunday (Week 8 Sun).
 * - Week 1 Monday = raceDate - 7 weeks + (Sun→Mon delta), i.e. 7 weeks before the
 *   Monday of race week.
 * - For each week, dates are assigned Mon..Sun from the template.
 * - Reshuffle pass: any workout whose date lands in an unavailable range gets
 *   replaced with the range's `treatAs` type. If the long run is displaced,
 *   it's rescheduled to the latest available weekday in the same week
 *   (preferring later days closer to the original Sunday slot).
 */
export function generatePlan(
  raceDateISO: string,
  unavailableRanges: UnavailableRange[],
  overrides: Record<string, WorkoutOverride> = {},
): PlanWeek[] {
  const raceDate = parseISO(raceDateISO)
  const week8Monday = mondayOf(raceDate)
  const weeks: PlanWeek[] = []

  for (const tmpl of TEMPLATE) {
    const weekOffset = tmpl.weekNumber - 8
    const weekStart = addDays(week8Monday, weekOffset * 7)
    const weekEnd = addDays(weekStart, 6)

    // First pass: assign dates from template, no reshuffles yet.
    let workouts: PlannedWorkout[] = tmpl.workouts.map((w) => {
      const dayIndex = DAYS_OF_WEEK.indexOf(w.day)
      const date = isoDate(addDays(weekStart, dayIndex))
      return {
        id: `w${tmpl.weekNumber}-${w.day.toLowerCase()}`,
        weekNumber: tmpl.weekNumber,
        day: w.day,
        date,
        type: w.type,
        plannedMiles: w.miles,
        label: w.label,
      }
    })

    // Second pass: handle blocked days.
    const longRun = workouts.find((w) => w.type === 'long' || w.type === 'race-day')
    const longRunBlocked = longRun && isBlocked(longRun.date, unavailableRanges)

    if (longRun && longRunBlocked && longRun.type === 'long') {
      // Find the latest non-blocked weekday in the same week to relocate the long
      // run. Walk back from Sat → Mon (skip Sun, that's the original slot).
      const candidates = workouts.filter((w) => w.day !== 'Sun')
      const reverse = [...candidates].reverse()
      const target = reverse.find((w) => !isBlocked(w.date, unavailableRanges))

      if (target) {
        const originalSundayId = longRun.id
        const targetId = target.id

        workouts = workouts.map((w) => {
          if (w.id === originalSundayId) {
            return {
              ...w,
              type: longRunBlocked.treatAs,
              plannedMiles: 0,
              label: labelForBlock(longRunBlocked),
            }
          }
          if (w.id === targetId) {
            return {
              ...w,
              type: 'long',
              plannedMiles: longRun.plannedMiles,
              label: longRun.label,
              rescheduledFrom: 'Sun',
            }
          }
          return w
        })
      } else {
        // Pathological case: every weekday in the week is blocked, so the
        // long run has nowhere to go. Surface a note on the Sunday slot so
        // it shows up in the UI; pass 3 will still mark the day, but the
        // note will remain visible.
        const originalSundayId = longRun.id
        workouts = workouts.map((w) =>
          w.id === originalSundayId
            ? {
                ...w,
                note: `${longRun.plannedMiles} mi long run skipped — every day this week is blocked`,
              }
            : w,
        )
      }
    }

    // Pass 2.5: in a tournament week, the tournament IS the week's
    // cross-training, so the Monday cross-train slot can be repurposed.
    //
    // Rules:
    //   - Capture template running workouts that pass 3 will overwrite as
    //     tournament. These are the "displaced" runs.
    //   - If at least one running workout was displaced, pick the highest-value
    //     one (pace > easy > long, though long is already handled by pass 2)
    //     and move it to the Monday cross slot. The Mon slot's id stays the
    //     same so log entries and overrides keyed to it are preserved.
    //   - If nothing was displaced (e.g. tournament only overlaps weekend rest
    //     + the Sunday long that already moved), convert Mon cross-train to
    //     rest — otherwise the week would have three cross-training days.
    //   - Only fire if the Monday slot is still its original cross-train and
    //     untouched by an override (we leave the override pass at the end to
    //     reapply Anna's intent on a slot that wasn't reshuffled).
    const monday = workouts.find((w) => w.day === 'Mon')
    const weekHasTournament = workouts.some(
      (w) =>
        w.day !== 'Mon' &&
        isBlocked(w.date, unavailableRanges) &&
        !w.rescheduledFrom,
    )
    if (monday && monday.type === 'cross' && weekHasTournament) {
      // Pick the displaced running workout with the highest training value.
      // A workout is "displaced" if EITHER:
      //   - its day is blocked by the tournament, OR
      //   - its day is now occupied by the rescheduled long run.
      // Pass 3 hasn't run yet, but we know which days will be overwritten:
      // any non-Mon day whose date is blocked, plus the day the long run
      // just moved to (if any).
      const reshuffleTargetDay = workouts.find((w) => w.rescheduledFrom)?.day
      const displacedRuns = tmpl.workouts.filter((tw) => {
        if (tw.day === 'Mon') return false
        if (tw.type !== 'pace' && tw.type !== 'easy') return false
        const date = isoDate(addDays(weekStart, DAYS_OF_WEEK.indexOf(tw.day)))
        const blockedByTournament = !!isBlocked(date, unavailableRanges)
        const overwrittenByLongRun = tw.day === reshuffleTargetDay
        return blockedByTournament || overwrittenByLongRun
      })
      const ranked = displacedRuns.sort((a, b) => {
        const rank: Record<string, number> = { pace: 0, easy: 1 }
        return (rank[a.type] ?? 9) - (rank[b.type] ?? 9)
      })
      const bestPick = ranked[0]

      workouts = workouts.map((w) => {
        if (w.id !== monday.id) return w
        if (bestPick) {
          return {
            ...w,
            type: bestPick.type,
            plannedMiles: bestPick.miles,
            label: bestPick.label,
          }
        }
        // No displaced run available — make Monday a rest day rather than
        // stacking three cross-training days in one week.
        return {
          ...w,
          type: 'rest',
          plannedMiles: 0,
          label: 'Rest',
        }
      })
    }

    // Third pass: any remaining workouts whose date is blocked → replace with
    // the range's treatAs type (handles non-long-run conflicts and tournament
    // days that are NOT the relocated long-run slot).
    workouts = workouts.map((w) => {
      // Don't overwrite the just-relocated long run; it's intentionally on a
      // day inside the range only if no other option existed (degenerate case).
      if (w.rescheduledFrom) return w
      // Race day is sacred. Even if someone adds an unavailable range that
      // covers it, leave the race-day workout untouched.
      if (w.type === 'race-day') return w
      const blocking = isBlocked(w.date, unavailableRanges)
      if (!blocking) return w
      // If we already replaced this slot above (the original Sun slot), keep it.
      if (w.type === blocking.treatAs && w.label === labelForBlock(blocking)) return w
      return {
        ...w,
        type: blocking.treatAs,
        plannedMiles: 0,
        label: labelForBlock(blocking),
      }
    })

    // Fourth pass: apply user overrides on top of everything.
    // Skip days that have been auto-rescheduled (the long run moved here) or
    // that are now occupied by a tournament — re-applying her stale edit on
    // top of those would silently lose the reshuffled long run or contradict
    // the real-life conflict.
    workouts = workouts.map((w) => {
      const ovr = overrides[w.id]
      if (!ovr) return w
      if (w.rescheduledFrom) return w
      if (w.type === 'tournament') return w
      const next: PlannedWorkout = { ...w, edited: true }
      if (ovr.type !== undefined) next.type = ovr.type
      if (ovr.plannedMiles !== undefined) next.plannedMiles = ovr.plannedMiles
      if (ovr.label !== undefined) next.label = ovr.label
      return next
    })

    weeks.push({
      weekNumber: tmpl.weekNumber,
      label: tmpl.label,
      startDate: isoDate(weekStart),
      endDate: isoDate(weekEnd),
      workouts,
    })
  }

  return weeks
}

/** Total planned miles across all weeks (used for "X of Y miles" UI). */
export function totalPlannedMiles(weeks: PlanWeek[]): number {
  return weeks.reduce(
    (sum, w) => sum + w.workouts.reduce((s, x) => s + x.plannedMiles, 0),
    0,
  )
}

/** Total non-rest workouts (used for "X of Y workouts" UI). */
export function totalWorkouts(weeks: PlanWeek[]): number {
  return weeks.reduce(
    (sum, w) => sum + w.workouts.filter((x) => x.type !== 'rest').length,
    0,
  )
}

/**
 * The 1-based week number containing today, 1 before the plan starts,
 * or null once the plan has ended (so consumers can stop highlighting).
 */
export function currentWeekNumber(
  weeks: PlanWeek[],
  today = new Date(),
): number | null {
  const todayISO = isoDate(today)
  const last = weeks[weeks.length - 1]
  if (last && todayISO > last.endDate) return null
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (todayISO >= weeks[i].startDate) return weeks[i].weekNumber
  }
  return 1
}
