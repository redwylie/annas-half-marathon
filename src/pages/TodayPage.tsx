import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ListChecks, PartyPopper, Pencil, Sparkles } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useStore } from '../store'
import { generatePlan } from '../lib/generator'
import { getToday } from '../lib/today'
import { workoutStyle } from '../lib/workout-style'
import type { PlannedWorkout, LoggedWorkout } from '../lib/types'
import WorkoutRow from '../components/WorkoutRow'
import LogSheet from '../components/LogSheet'

export default function TodayPage() {
  const settings = useStore((s) => s.settings)
  const logs = useStore((s) => s.logs)
  const overrides = useStore((s) => s.overrides)
  const toggleComplete = useStore((s) => s.toggleComplete)
  const logWorkout = useStore((s) => s.logWorkout)
  const setOverride = useStore((s) => s.setOverride)
  const clearOverride = useStore((s) => s.clearOverride)

  const weeks = useMemo(
    () => generatePlan(settings.raceDate, settings.unavailableRanges, overrides),
    [settings.raceDate, settings.unavailableRanges, overrides],
  )
  const today = useMemo(() => getToday(weeks), [weeks])
  const completedIds = useMemo(() => new Set(Object.keys(logs)), [logs])

  const [logging, setLogging] = useState<PlannedWorkout | null>(null)

  return (
    <div className="space-y-4 py-6">
      <HeroCard
        info={today}
        completed={today.workout ? completedIds.has(today.workout.id) : false}
        log={today.workout ? logs[today.workout.id] : undefined}
        onToggle={() => today.workout && toggleComplete(today.workout.id)}
        onLog={today.workout ? () => setLogging(today.workout) : undefined}
      />

      <WeekSummary
        weekWorkouts={today.week.workouts}
        completedIds={completedIds}
        logs={logs}
        onToggle={toggleComplete}
        onLog={setLogging}
        currentDate={format(new Date(), 'yyyy-MM-dd')}
      />

      <LogSheet
        workout={logging}
        initialLog={logging ? logs[logging.id] : undefined}
        hasOverride={logging ? !!overrides[logging.id] : false}
        open={!!logging}
        onClose={() => setLogging(null)}
        onSave={logWorkout}
        onOverride={setOverride}
        onClearOverride={clearOverride}
      />
    </div>
  )
}

function HeroCard({
  info,
  completed,
  log,
  onToggle,
  onLog,
}: {
  info: ReturnType<typeof getToday>
  completed: boolean
  log?: LoggedWorkout
  onToggle: () => void
  onLog?: () => void
}) {
  if (info.phase === 'pre') return <PreCard daysToStart={info.daysToStart} />
  if (info.phase === 'post') return <PostCard />
  if (info.phase === 'race-day')
    return <RaceDayCard workout={info.workout} completed={completed} onToggle={onToggle} />

  // 'during' phase
  if (!info.workout) return <FallbackCard />
  return (
    <WorkoutCard
      workout={info.workout}
      completed={completed}
      log={log}
      onToggle={onToggle}
      onLog={onLog}
    />
  )
}

function PreCard({ daysToStart }: { daysToStart: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-sm dark:border-zinc-800 dark:from-emerald-600 dark:to-emerald-700">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-emerald-50">
        <Sparkles className="h-3.5 w-3.5" />
        Training begins soon
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-semibold tabular-nums">{daysToStart}</span>
        <span className="text-base text-emerald-50">
          {daysToStart === 1 ? 'day' : 'days'} until Week 1
        </span>
      </div>
      <p className="mt-3 text-sm text-emerald-50">
        Your 8-week training kicks off Monday, June 8. Until then, keep moving and stay loose.
      </p>
      <Link
        to="/plan"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        <ListChecks className="h-4 w-4" />
        Preview the plan
      </Link>
    </div>
  )
}

function PostCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-violet-500 to-emerald-500 p-6 text-white shadow-sm dark:border-zinc-800">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider">
        <PartyPopper className="h-3.5 w-3.5" />
        You did it
      </div>
      <h1 className="mt-2 text-2xl font-semibold">13.1 miles, in the books.</h1>
      <p className="mt-2 text-sm text-white/90">
        Rest. Eat. Brag a little. We're proud of you.
      </p>
    </div>
  )
}

function RaceDayCard({
  workout,
  completed,
  onToggle,
}: {
  workout: PlannedWorkout | null
  completed: boolean
  onToggle: () => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white shadow-lg ring-2 ring-emerald-500/30">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-emerald-50">
        <PartyPopper className="h-3.5 w-3.5" />
        Race day
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-6xl font-semibold tabular-nums">13.1</span>
        <span className="text-base text-emerald-50">miles</span>
      </div>
      <p className="mt-3 text-sm text-emerald-50">
        This is what 8 weeks of work have prepared you for. Go run your race.
      </p>
      {workout && (
        <button
          type="button"
          onClick={onToggle}
          className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            completed
              ? 'bg-white text-emerald-700 hover:bg-emerald-50'
              : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
          }`}
        >
          {completed && <Check className="h-4 w-4" strokeWidth={3} />}
          {completed ? 'Race complete' : 'Mark race complete'}
        </button>
      )}
    </div>
  )
}

function FallbackCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 px-6 py-5 dark:from-zinc-900 dark:to-zinc-950">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Today
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Off the clock
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing scheduled today. Stretch, hydrate, scroll through Plan if you want
          a peek at tomorrow.
        </p>
      </div>
    </div>
  )
}

function WorkoutCard({
  workout,
  completed,
  log,
  onToggle,
  onLog,
}: {
  workout: PlannedWorkout
  completed: boolean
  log?: LoggedWorkout
  onToggle: () => void
  onLog?: () => void
}) {
  const style = workoutStyle(workout.type)
  const isRest = workout.type === 'rest'
  const isTournament = workout.type === 'tournament'
  const today = new Date()

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {format(today, 'EEEE, MMM d')}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {workout.label}
              </h1>
            </div>
            {style && (
              <div
                className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${style.badgeBg} ${style.badgeText}`}
              >
                {style.badgeLabel}
              </div>
            )}
          </div>

          {!isRest && workout.plannedMiles > 0 && (
            <div className="text-right">
              <div className="text-4xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {workout.plannedMiles}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                miles
              </div>
            </div>
          )}
        </div>

        {workout.rescheduledFrom && (
          <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
            Moved from Sunday — {workout.note ?? 'rescheduled around a conflict.'}
          </div>
        )}

        <>
          {isRest && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Today is a rest day. Recovery is part of training — soak it in.
            </p>
          )}
          {isTournament && (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Frisbee tournament. Crush it out there.
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onToggle}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                completed
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
              }`}
            >
              {completed ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Done — tap to undo
                </>
              ) : isRest ? (
                'Mark rested'
              ) : isTournament ? (
                'Mark tournament done'
              ) : (
                'Mark complete'
              )}
            </button>
            {onLog && (
              <button
                type="button"
                onClick={onLog}
                aria-label={isRest ? 'Log rest day notes' : 'Log workout details'}
                className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
          {log && (log.actualMiles || log.actualMinutes || log.notes) && (
            <LoggedSummary log={log} />
          )}
        </>
      </div>
    </div>
  )
}

function LoggedSummary({ log }: { log: LoggedWorkout }) {
  const parts: string[] = []
  if (log.actualMiles != null) parts.push(`${log.actualMiles} mi`)
  if (log.actualMinutes != null) {
    const totalSec = log.actualMinutes * 60
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = Math.floor(totalSec % 60)
    parts.push(
      h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${m}:${String(s).padStart(2, '0')}`,
    )
  }
  if (log.perceivedEffort) parts.push(`RPE ${log.perceivedEffort}/5`)
  if (log.notes) parts.push(`"${log.notes}"`)
  return (
    <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
      Logged: {parts.join(' · ')}
    </div>
  )
}

function WeekSummary({
  weekWorkouts,
  completedIds,
  logs,
  onToggle,
  onLog,
  currentDate,
}: {
  weekWorkouts: PlannedWorkout[]
  completedIds: Set<string>
  logs: Record<string, LoggedWorkout>
  onToggle: (id: string) => void
  onLog: (workout: PlannedWorkout) => void
  currentDate: string
}) {
  const upcoming = weekWorkouts.filter((w) => w.date > currentDate)
  if (upcoming.length === 0) return null

  const weekStart = parseISO(weekWorkouts[0].date)
  const weekEnd = parseISO(weekWorkouts[weekWorkouts.length - 1].date)
  const rangeLabel = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'd')}`

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Rest of this week
        </div>
        <div className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {rangeLabel}
        </div>
      </div>
      <div className="divide-y divide-zinc-100 px-4 dark:divide-zinc-800">
        {upcoming.map((w) => (
          <WorkoutRow
            key={w.id}
            workout={w}
            completed={completedIds.has(w.id)}
            log={logs[w.id]}
            onToggle={() => onToggle(w.id)}
            onLog={() => onLog(w)}
          />
        ))}
      </div>
    </div>
  )
}
