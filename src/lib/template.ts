import type { DayOfWeek, WorkoutType } from './types'

export interface TemplateWorkout {
  day: DayOfWeek
  type: WorkoutType
  miles: number
  label: string
}

export interface TemplateWeek {
  weekNumber: number
  label: string
  workouts: TemplateWorkout[]
}

/**
 * Hal Higdon Novice 2 (half marathon), 8-week condensed, rotated so the long run
 * lands on Sunday. Race day is the final Sunday.
 *
 * Weekly pattern (non-race weeks):
 *   Mon cross-train · Tue rest · Wed easy · Thu pace · Fri easy · Sat rest · Sun long
 *
 * Mileage progression mirrors weeks 5-12 of Hal's original program.
 */
export const TEMPLATE: TemplateWeek[] = [
  {
    weekNumber: 1,
    label: 'Week 1',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'pace', miles: 4, label: '4 mi pace run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'long', miles: 7, label: '7 mi long run' },
    ],
  },
  {
    weekNumber: 2,
    label: 'Week 2',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'easy', miles: 4, label: '4 mi easy run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'long', miles: 8, label: '8 mi long run' },
    ],
  },
  {
    weekNumber: 3,
    label: 'Week 3',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'pace', miles: 4, label: '4 mi pace run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'race', miles: 3.1, label: '5-K race (optional)' },
    ],
  },
  {
    weekNumber: 4,
    label: 'Week 4',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'easy', miles: 5, label: '5 mi easy run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'long', miles: 9, label: '9 mi long run' },
    ],
  },
  {
    weekNumber: 5,
    label: 'Week 5',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'pace', miles: 5, label: '5 mi pace run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'long', miles: 10, label: '10 mi long run' },
    ],
  },
  {
    weekNumber: 6,
    label: 'Week 6',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'easy', miles: 5, label: '5 mi easy run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'race', miles: 6.2, label: '10-K race (optional)' },
    ],
  },
  {
    weekNumber: 7,
    label: 'Week 7 — Peak',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '60 min cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'pace', miles: 5, label: '5 mi pace run' },
      { day: 'Fri', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'long', miles: 12, label: '12 mi long run' },
    ],
  },
  {
    weekNumber: 8,
    label: 'Week 8 — Race week',
    workouts: [
      { day: 'Mon', type: 'cross', miles: 0, label: '30 min easy cross-train' },
      { day: 'Tue', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Wed', type: 'easy', miles: 3, label: '3 mi easy run' },
      { day: 'Thu', type: 'pace', miles: 2, label: '2 mi pace run' },
      { day: 'Fri', type: 'easy', miles: 2, label: '2 mi easy run' },
      { day: 'Sat', type: 'rest', miles: 0, label: 'Rest' },
      { day: 'Sun', type: 'race-day', miles: 13.1, label: 'Race day! 13.1 mi' },
    ],
  },
]
