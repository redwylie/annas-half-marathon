export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export type WorkoutType =
  | 'rest'
  | 'easy'
  | 'pace'
  | 'long'
  | 'cross'
  | 'race'
  | 'race-day'
  | 'tournament'

export interface PlannedWorkout {
  id: string                 // e.g. "w1-tue"
  weekNumber: number         // 1..8
  day: DayOfWeek
  date: string               // ISO yyyy-mm-dd
  type: WorkoutType
  plannedMiles: number
  label: string
  note?: string
  rescheduledFrom?: DayOfWeek
  edited?: boolean           // true when overridden by the user
}

/** User-authored override of a planned workout's type/miles/label. */
export interface WorkoutOverride {
  type?: WorkoutType
  plannedMiles?: number
  label?: string
}

export interface LoggedWorkout {
  workoutId: string
  completedAt: string
  actualMiles?: number
  actualMinutes?: number
  perceivedEffort?: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface UnavailableRange {
  id: string
  startDate: string          // ISO inclusive
  endDate: string            // ISO inclusive
  label: string
  treatAs: 'rest' | 'tournament'
}

export interface GoalTime {
  hours: number
  minutes: number
  seconds: number
}

export interface UserSettings {
  name: string
  goalRaceTime: GoalTime | null
  raceDate: string           // ISO
  units: 'mi' | 'km'
  unavailableRanges: UnavailableRange[]
}

export interface PlanWeek {
  weekNumber: number
  label: string
  startDate: string          // ISO (Monday)
  endDate: string            // ISO (Sunday)
  workouts: PlannedWorkout[]
}
