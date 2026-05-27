import type { GoalTime } from './types'
import { formatSeconds } from './pace'

export interface PaceTargets {
  /** Goal half-marathon pace, min/mi (formatted M:SS) */
  race: string
  /** Suggested easy-run pace range */
  easyMin: string
  easyMax: string
  /** Suggested long-run pace range */
  longMin: string
  longMax: string
  /** Goal time formatted as H:MM:SS */
  totalLabel: string
}

const HALF_MILES = 13.1

export function paceTargets(goal: GoalTime | null): PaceTargets | null {
  if (!goal) return null
  const totalSec = goal.hours * 3600 + goal.minutes * 60 + goal.seconds
  if (totalSec <= 0) return null
  const racePaceSec = totalSec / HALF_MILES

  // Hal Higdon: easy is 60–90s slower per mile than race pace; long is 45–90s slower.
  const fmt = (secPerMile: number) => {
    const m = Math.floor(secPerMile / 60)
    const s = Math.round(secPerMile % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return {
    race: fmt(racePaceSec),
    easyMin: fmt(racePaceSec + 60),
    easyMax: fmt(racePaceSec + 90),
    longMin: fmt(racePaceSec + 45),
    longMax: fmt(racePaceSec + 90),
    totalLabel: formatSeconds(totalSec),
  }
}
