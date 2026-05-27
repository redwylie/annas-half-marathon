import { Check, Pencil } from 'lucide-react'
import type { PlannedWorkout, LoggedWorkout } from '../lib/types'
import { workoutStyle } from '../lib/workout-style'
import { formatSeconds, computePace } from '../lib/pace'

interface Props {
  workout: PlannedWorkout
  completed: boolean
  onToggle: () => void
  onLog?: () => void
  log?: LoggedWorkout
}

export default function WorkoutRow({ workout, completed, onToggle, onLog, log }: Props) {
  const style = workoutStyle(workout.type)
  const isRest = workout.type === 'rest'

  return (
    <div className="flex items-start gap-3 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Mark ${workout.label} ${completed ? 'incomplete' : 'complete'}`}
        className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-all duration-150 active:scale-90 ${
          completed
            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
            : 'border-zinc-300 hover:border-emerald-500 dark:border-zinc-700 dark:hover:border-emerald-500'
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
            isRest ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
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
        {log && (log.actualMiles || log.actualMinutes) && (
          <LogSummary log={log} />
        )}
      </div>

      {onLog && (
        <button
          type="button"
          onClick={onLog}
          aria-label={log ? 'Edit log' : 'Log workout details'}
          className="mt-0.5 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function LogSummary({ log }: { log: LoggedWorkout }) {
  const seconds = log.actualMinutes ? log.actualMinutes * 60 : 0
  const pace = log.actualMiles ? computePace(log.actualMiles, seconds) : null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
      {log.actualMiles != null && (
        <span className="tabular-nums">{log.actualMiles} mi</span>
      )}
      {seconds > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{formatSeconds(seconds)}</span>
        </>
      )}
      {pace && (
        <>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{pace}/mi</span>
        </>
      )}
      {log.perceivedEffort && (
        <>
          <span aria-hidden>·</span>
          <span>RPE {log.perceivedEffort}/5</span>
        </>
      )}
    </div>
  )
}
