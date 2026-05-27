import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { generatePlan, currentWeekNumber } from '../lib/generator'
import WeekCard from '../components/WeekCard'
import LogSheet from '../components/LogSheet'
import type { PlannedWorkout } from '../lib/types'

export default function PlanPage() {
  const settings = useStore((s) => s.settings)
  const logs = useStore((s) => s.logs)
  const toggleComplete = useStore((s) => s.toggleComplete)
  const logWorkout = useStore((s) => s.logWorkout)

  const weeks = useMemo(
    () => generatePlan(settings.raceDate, settings.unavailableRanges),
    [settings.raceDate, settings.unavailableRanges],
  )
  const currentWk = useMemo(() => currentWeekNumber(weeks), [weeks])
  const completedIds = useMemo(() => new Set(Object.keys(logs)), [logs])

  const [logging, setLogging] = useState<PlannedWorkout | null>(null)

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        8-week plan
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Hal Higdon Novice 2, adapted for a Sunday race day and frisbee tournament weekends.
      </p>

      <div className="mt-4 space-y-3">
        {weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            isCurrent={week.weekNumber === currentWk}
            isPast={week.weekNumber < currentWk}
            completedIds={completedIds}
            logs={logs}
            onToggle={toggleComplete}
            onLog={setLogging}
          />
        ))}
      </div>

      <LogSheet
        workout={logging}
        initialLog={logging ? logs[logging.id] : undefined}
        open={!!logging}
        onClose={() => setLogging(null)}
        onSave={logWorkout}
      />
    </div>
  )
}
