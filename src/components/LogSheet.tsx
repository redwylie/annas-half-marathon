import { useEffect, useState } from 'react'
import type { PlannedWorkout, LoggedWorkout } from '../lib/types'
import { computePace, parseTimeToSeconds, formatSeconds } from '../lib/pace'
import Sheet from './Sheet'

interface Props {
  workout: PlannedWorkout | null
  initialLog?: LoggedWorkout
  open: boolean
  onClose: () => void
  onSave: (log: LoggedWorkout) => void
}

const RPE_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Comfortable',
  3: 'Steady',
  4: 'Hard',
  5: 'All out',
}

export default function LogSheet({ workout, initialLog, open, onClose, onSave }: Props) {
  const [miles, setMiles] = useState('')
  const [time, setTime] = useState('')
  const [rpe, setRpe] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  // Re-seed form when the target workout changes or sheet (re)opens.
  useEffect(() => {
    if (!open || !workout) return
    setMiles(initialLog?.actualMiles?.toString() ?? workout.plannedMiles.toString())
    setTime(
      initialLog?.actualMinutes
        ? formatSeconds(initialLog.actualMinutes * 60)
        : '',
    )
    setRpe(initialLog?.perceivedEffort ?? null)
    setNotes(initialLog?.notes ?? '')
  }, [open, workout, initialLog])

  if (!workout) return null

  const milesNum = parseFloat(miles) || 0
  const seconds = parseTimeToSeconds(time) ?? 0
  const pace = computePace(milesNum, seconds)

  const handleSave = () => {
    const log: LoggedWorkout = {
      workoutId: workout.id,
      completedAt: initialLog?.completedAt ?? new Date().toISOString(),
      actualMiles: milesNum > 0 ? milesNum : undefined,
      actualMinutes: seconds > 0 ? seconds / 60 : undefined,
      perceivedEffort: (rpe ?? undefined) as LoggedWorkout['perceivedEffort'],
      notes: notes.trim() || undefined,
    }
    onSave(log)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={`Log: ${workout.label}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance" suffix="mi">
            <input
              inputMode="decimal"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold tabular-nums text-zinc-900 outline-none dark:text-zinc-100"
              placeholder="0"
            />
          </Field>
          <Field label="Time" suffix="hh:mm:ss">
            <input
              inputMode="numeric"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-transparent text-xl font-semibold tabular-nums text-zinc-900 outline-none dark:text-zinc-100"
              placeholder="0:00"
            />
          </Field>
        </div>

        {pace && (
          <div className="-mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Pace: <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">{pace}</span> /mi
          </div>
        )}

        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            How did it feel?
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = rpe === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRpe(active ? null : n)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div>{n}</div>
                  <div className="mt-0.5 text-[9px] font-normal opacity-80">{RPE_LABELS[n]}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Notes
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How was the route? Weather? Anything to remember…"
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Save
          </button>
        </div>
      </div>
    </Sheet>
  )
}

function Field({
  label,
  suffix,
  children,
}: {
  label: string
  suffix?: string
  children: React.ReactNode
}) {
  return (
    <label className="block rounded-xl border border-zinc-200 bg-white px-3 py-2.5 focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </div>
        {suffix && <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{suffix}</div>}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  )
}
