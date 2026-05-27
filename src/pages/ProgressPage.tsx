import { useMemo } from 'react'
import { Flame, Trophy, Footprints, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store'
import { generatePlan, currentWeekNumber } from '../lib/generator'
import { computeStats } from '../lib/progress'
import MileageChart from '../components/MileageChart'

export default function ProgressPage() {
  const settings = useStore((s) => s.settings)
  const logs = useStore((s) => s.logs)
  const overrides = useStore((s) => s.overrides)

  const weeks = useMemo(
    () => generatePlan(settings.raceDate, settings.unavailableRanges, overrides),
    [settings.raceDate, settings.unavailableRanges, overrides],
  )
  const stats = useMemo(() => computeStats(weeks, logs), [weeks, logs])
  const currentWk = useMemo(() => currentWeekNumber(weeks), [weeks])

  const completionPct =
    stats.totalWorkouts > 0
      ? Math.round((stats.totalCompleted / stats.totalWorkouts) * 100)
      : 0

  const hasAnyLogs = Object.keys(logs).length > 0

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Progress</h1>

      {!hasAnyLogs ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Footprints className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            No workouts logged yet
          </div>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Once you start checking off workouts and logging details, you'll see weekly
            mileage, streaks, and your longest run here.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={`${stats.totalCompleted}`}
          sub={`of ${stats.totalWorkouts} · ${completionPct}%`}
        />
        <StatCard
          icon={<Footprints className="h-4 w-4" />}
          label="Miles logged"
          value={stats.totalActualMiles.toFixed(1)}
          sub={`of ~${stats.totalPlannedMiles} mi`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Longest run"
          value={stats.longestRunMiles > 0 ? `${stats.longestRunMiles}` : '—'}
          sub={stats.longestRunLabel ?? 'log a run to start'}
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Streak"
          value={`${stats.currentStreak}`}
          sub={stats.bestStreak > stats.currentStreak ? `best: ${stats.bestStreak}` : 'keep going'}
        />
      </div>

      <ProgressBar
        completed={stats.totalCompleted}
        total={stats.totalWorkouts}
        pct={completionPct}
      />

      <MileageChart weeks={stats.weeks} currentWeek={currentWk} />

      <WeeklyDigest weeks={stats.weeks} currentWeek={currentWk} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{sub}</div>
      )}
    </div>
  )
}

function ProgressBar({
  completed,
  total,
  pct,
}: {
  completed: number
  total: number
  pct: number
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Overall
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {completed}
          </span>
          /{total} workouts
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function WeeklyDigest({
  weeks,
  currentWeek,
}: {
  weeks: ReturnType<typeof computeStats>['weeks']
  currentWeek: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Weekly digest
        </div>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {weeks.map((w) => {
          const isCurrent = w.weekNumber === currentWeek
          const pct =
            w.workoutsTotal > 0 ? Math.round((w.workoutsDone / w.workoutsTotal) * 100) : 0
          return (
            <div
              key={w.weekNumber}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                isCurrent ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
              }`}
            >
              <div
                className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                  isCurrent
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {w.weekNumber}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                  {w.label}
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0 text-right text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {w.actualMiles.toFixed(1)}
                  <span className="text-zinc-400 dark:text-zinc-500">/{w.plannedMiles}mi</span>
                </div>
                <div>{w.workoutsDone}/{w.workoutsTotal} done</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
