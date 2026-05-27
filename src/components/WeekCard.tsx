import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { PlanWeek } from '../lib/types'
import WorkoutRow from './WorkoutRow'

interface Props {
  week: PlanWeek
  defaultOpen?: boolean
  isCurrent?: boolean
  isPast?: boolean
  completedIds: Set<string>
  onToggle: (workoutId: string) => void
}

function formatRange(startISO: string, endISO: string): string {
  const start = parseISO(startISO)
  const end = parseISO(endISO)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${format(start, 'MMM d')}–${format(end, 'd')}`
  }
  return `${format(start, 'MMM d')}–${format(end, 'MMM d')}`
}

export default function WeekCard({
  week,
  defaultOpen,
  isCurrent,
  isPast,
  completedIds,
  onToggle,
}: Props) {
  const [open, setOpen] = useState(defaultOpen ?? isCurrent ?? false)

  const trackable = week.workouts.filter((w) => w.type !== 'rest')
  const completedCount = trackable.filter((w) => completedIds.has(w.id)).length
  const total = trackable.length
  const allDone = total > 0 && completedCount === total

  const borderClass = isCurrent
    ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 dark:border-emerald-400/60 dark:ring-emerald-400/30'
    : 'border-zinc-200 dark:border-zinc-800'

  const indicator = allDone ? (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
      <Check className="h-4 w-4" strokeWidth={3} />
    </div>
  ) : isCurrent ? (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-xs font-semibold text-white dark:bg-emerald-500">
      {week.weekNumber}
    </div>
  ) : (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      {week.weekNumber}
    </div>
  )

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors dark:bg-zinc-900 ${borderClass} ${
        isPast && !allDone ? 'opacity-70' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
      >
        <div className="flex min-w-0 items-center gap-3">
          {indicator}
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {week.label}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {formatRange(week.startDate, week.endDate)} · {completedCount}/{total} done
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="divide-y divide-zinc-100 border-t border-zinc-100 px-4 dark:divide-zinc-800 dark:border-zinc-800">
          {week.workouts.map((w) => (
            <WorkoutRow
              key={w.id}
              workout={w}
              completed={completedIds.has(w.id)}
              onToggle={() => onToggle(w.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
