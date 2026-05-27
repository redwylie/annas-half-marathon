import type { WorkoutType } from './types'

interface WorkoutStyle {
  badgeBg: string
  badgeText: string
  dotColor: string
  badgeLabel: string
}

export function workoutStyle(type: WorkoutType): WorkoutStyle | null {
  switch (type) {
    case 'easy':
      return {
        badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
        badgeText: 'text-zinc-700 dark:text-zinc-300',
        dotColor: 'bg-zinc-400',
        badgeLabel: 'easy',
      }
    case 'pace':
      return {
        badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
        badgeText: 'text-blue-800 dark:text-blue-300',
        dotColor: 'bg-blue-500',
        badgeLabel: 'pace',
      }
    case 'long':
      return {
        badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
        badgeText: 'text-violet-800 dark:text-violet-300',
        dotColor: 'bg-violet-500',
        badgeLabel: 'long',
      }
    case 'cross':
      return {
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
        badgeText: 'text-amber-800 dark:text-amber-300',
        dotColor: 'bg-amber-500',
        badgeLabel: 'cross',
      }
    case 'race':
      return {
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        dotColor: 'bg-emerald-500',
        badgeLabel: 'race',
      }
    case 'race-day':
      return {
        badgeBg: 'bg-emerald-600 dark:bg-emerald-500',
        badgeText: 'text-white',
        dotColor: 'bg-emerald-600',
        badgeLabel: 'race day',
      }
    case 'tournament':
      return {
        badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
        badgeText: 'text-orange-800 dark:text-orange-300',
        dotColor: 'bg-orange-500',
        badgeLabel: 'Frisbee tournament',
      }
    case 'rest':
      return null
  }
}
