import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import type { PlannedWorkout, PlanWeek } from './types'

export interface TodayInfo {
  /** Phase relative to the training plan. */
  phase: 'pre' | 'during' | 'race-day' | 'post'
  /** Today's planned workout, if any. */
  workout: PlannedWorkout | null
  /** The week today falls in (or week 1 if pre). */
  week: PlanWeek
  /** Calendar days until race day (>= 0). */
  daysToRace: number
  /** Calendar days until the first workout (only meaningful in 'pre'). */
  daysToStart: number
  /** Plan's first ISO date (Week 1 Monday). */
  planStart: string
  /** Plan's last ISO date (Race Sunday). */
  planEnd: string
}

export function getToday(weeks: PlanWeek[], now = new Date()): TodayInfo {
  const todayISO = format(now, 'yyyy-MM-dd')
  const planStart = weeks[0].startDate
  const planEnd = weeks[weeks.length - 1].endDate
  const daysToRace = Math.max(0, differenceInCalendarDays(parseISO(planEnd), now))
  const daysToStart = Math.max(0, differenceInCalendarDays(parseISO(planStart), now))

  let phase: TodayInfo['phase']
  if (todayISO < planStart) phase = 'pre'
  else if (todayISO > planEnd) phase = 'post'
  else if (todayISO === planEnd) phase = 'race-day'
  else phase = 'during'

  // Locate the week today falls in (default to week 1 for 'pre', last week for 'post').
  let week = weeks[0]
  if (phase === 'post') week = weeks[weeks.length - 1]
  else {
    for (const w of weeks) {
      if (todayISO >= w.startDate && todayISO <= w.endDate) {
        week = w
        break
      }
    }
  }

  const workout = week.workouts.find((w) => w.date === todayISO) ?? null

  return { phase, workout, week, daysToRace, daysToStart, planStart, planEnd }
}
