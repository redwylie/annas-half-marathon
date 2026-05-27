import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { PlannedWorkout, LoggedWorkout, WorkoutType, WorkoutOverride } from '../lib/types'
import { computePace, parseTimeToSeconds, formatSeconds } from '../lib/pace'
import Sheet from './Sheet'

interface Props {
  workout: PlannedWorkout | null
  initialLog?: LoggedWorkout
  hasOverride?: boolean
  open: boolean
  onClose: () => void
  onSave: (log: LoggedWorkout) => void
  onOverride?: (workoutId: string, override: WorkoutOverride) => void
  onClearOverride?: (workoutId: string) => void
}

const RPE_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Comfortable',
  3: 'Steady',
  4: 'Hard',
  5: 'All out',
}

const EDITABLE_TYPES: { value: WorkoutType; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'pace', label: 'Pace' },
  { value: 'long', label: 'Long' },
  { value: 'cross', label: 'Cross' },
  { value: 'rest', label: 'Rest' },
  { value: 'tournament', label: 'Tournament' },
]

export default function LogSheet({
  workout,
  initialLog,
  hasOverride,
  open,
  onClose,
  onSave,
  onOverride,
  onClearOverride,
}: Props) {
  // Log fields
  const [miles, setMiles] = useState('')
  const [time, setTime] = useState('')
  const [rpe, setRpe] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  // Edit-plan fields
  const [editOpen, setEditOpen] = useState(false)
  const [plannedType, setPlannedType] = useState<WorkoutType>('easy')
  const [plannedMiles, setPlannedMiles] = useState('')
  const [plannedLabel, setPlannedLabel] = useState('')

  // Snapshot of the values the sheet was opened with, used to detect
  // unsaved changes if she tries to close via cancel/backdrop.
  const initialRef = useRef<{
    miles: string
    time: string
    rpe: number | null
    notes: string
  }>({ miles: '', time: '', rpe: null, notes: '' })

  useEffect(() => {
    if (!open || !workout) return
    const isRest = workout.type === 'rest'
    const seedMiles =
      initialLog?.actualMiles?.toString() ?? (isRest ? '' : workout.plannedMiles.toString())
    const seedTime = initialLog?.actualMinutes
      ? formatSeconds(initialLog.actualMinutes * 60)
      : ''
    const seedRpe = initialLog?.perceivedEffort ?? null
    const seedNotes = initialLog?.notes ?? ''
    setMiles(seedMiles)
    setTime(seedTime)
    setRpe(seedRpe)
    setNotes(seedNotes)
    setPlannedType(workout.type === 'race' || workout.type === 'race-day' ? 'easy' : workout.type)
    setPlannedMiles(workout.plannedMiles ? workout.plannedMiles.toString() : '')
    setPlannedLabel(workout.label)
    setEditOpen(hasOverride ?? false)
    initialRef.current = {
      miles: seedMiles,
      time: seedTime,
      rpe: seedRpe,
      notes: seedNotes,
    }
  }, [open, workout, initialLog, hasOverride])

  const isDirty =
    miles !== initialRef.current.miles ||
    time !== initialRef.current.time ||
    rpe !== initialRef.current.rpe ||
    notes !== initialRef.current.notes

  const handleClose = () => {
    if (isDirty) {
      const ok = window.confirm(
        "You haven't saved your changes. Close anyway and lose what you typed?",
      )
      if (!ok) return
    }
    onClose()
  }

  if (!workout) return null

  const milesNum = parseFloat(miles) || 0
  const seconds = parseTimeToSeconds(time) ?? 0
  const pace = computePace(milesNum, seconds)
  const isRest = workout.type === 'rest'

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

    // If edit section is open, also save plan overrides.
    if (editOpen && onOverride) {
      const ovr: WorkoutOverride = {}
      const newType = plannedType
      const newMiles = parseFloat(plannedMiles) || 0
      const newLabel = plannedLabel.trim()
      if (newType !== workout.type) ovr.type = newType
      if (newMiles !== workout.plannedMiles) ovr.plannedMiles = newMiles
      if (newLabel && newLabel !== workout.label) ovr.label = newLabel
      if (Object.keys(ovr).length > 0) onOverride(workout.id, ovr)
    }

    onClose()
  }

  const handleResetPlan = () => {
    if (onClearOverride) onClearOverride(workout.id)
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title={workout.label}>
      <div className="space-y-5">
        {/* LOG SECTION */}
        {!isRest && (
          <>
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
                Pace:{' '}
                <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                  {pace}
                </span>{' '}
                /mi
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
                      <div className="mt-0.5 text-[9px] font-normal opacity-80">
                        {RPE_LABELS[n]}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {isRest ? 'How did the rest feel?' : 'Notes'}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              isRest
                ? 'Recovery, mood, anything to remember…'
                : 'Route, weather, anything to remember…'
            }
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* EDIT-PLAN SECTION */}
        {onOverride && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Adjust the plan for this day
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {editOpen ? 'Close' : hasOverride ? 'Edited' : 'Open'}
              </div>
            </button>
            {editOpen && (
              <div className="space-y-3 border-t border-zinc-100 px-3 py-3 dark:border-zinc-800">
                <div>
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Type
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EDITABLE_TYPES.map((t) => {
                      const active = plannedType === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setPlannedType(t.value)}
                          className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {plannedType !== 'rest' && plannedType !== 'tournament' && (
                  <Field label="Planned miles" suffix="mi">
                    <input
                      inputMode="decimal"
                      value={plannedMiles}
                      onChange={(e) => setPlannedMiles(e.target.value)}
                      className="w-full bg-transparent text-base font-semibold tabular-nums text-zinc-900 outline-none dark:text-zinc-100"
                      placeholder="0"
                    />
                  </Field>
                )}

                <Field label="Label">
                  <input
                    value={plannedLabel}
                    onChange={(e) => setPlannedLabel(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100"
                    placeholder="e.g. 4 mi easy run"
                  />
                </Field>

                {hasOverride && onClearOverride && (
                  <button
                    type="button"
                    onClick={handleResetPlan}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to original plan
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
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
