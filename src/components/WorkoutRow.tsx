import { Check } from 'lucide-react'
import type { PlannedWorkout } from '../lib/types'
import { workoutStyle } from '../lib/workout-style'

interface Props {
  workout: PlannedWorkout
  completed: boolean
  onToggle: () => void
}

export default function WorkoutRow({ workout, completed, onToggle }: Props) {
  const style = workoutStyle(workout.type)
  const isRest = workout.type === 'rest'
  const isInteractive = !isRest

  return (
    <div className="flex items-start gap-3 py-2.5">
      <button
        type="button"
        onClick={isInteractive ? onToggle : undefined}
        disabled={!isInteractive}
        aria-label={
          isInteractive
            ? `Mark ${workout.label} ${completed ? 'incomplete' : 'complete'}`
            : 'Rest day'
        }
        className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors ${
          isInteractive
            ? completed
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-zinc-300 hover:border-emerald-500 dark:border-zinc-700 dark:hover:border-emerald-500'
            : 'border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900'
        }`}
      >
        {completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span>{workout.day}</span>
          {workout.rescheduledFrom && (
            <span className="rounded-sm bg-orange-100 px-1.5 py-px text-[10px] tracking-normal text-orange-900 dark:bg-orange-950/60 dark:text-orange-300">
              moved from {workout.rescheduledFrom}
            </span>
          )}
        </div>
        <div
          className={`mt-0.5 flex flex-wrap items-center gap-2 text-sm ${
            completed
              ? 'text-zinc-400 line-through dark:text-zinc-500'
              : isRest
                ? 'text-zinc-400 dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          <span>{workout.label}</span>
          {style && (
            <span
              className={`rounded-md px-1.5 py-px text-[10px] font-medium ${style.badgeBg} ${style.badgeText}`}
            >
              {style.badgeLabel}
            </span>
          )}
        </div>
        {workout.note && (
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {workout.note}
          </div>
        )}
      </div>
    </div>
  )
}
