import { useMemo } from 'react'
import { useStore } from '../store'
import { generatePlan, currentWeekNumber } from '../lib/generator'
import WeekCard from '../components/WeekCard'

export default function PlanPage() {
  const settings = useStore((s) => s.settings)
  const logs = useStore((s) => s.logs)
  const toggleComplete = useStore((s) => s.toggleComplete)

  const weeks = useMemo(
    () => generatePlan(settings.raceDate, settings.unavailableRanges),
    [settings.raceDate, settings.unavailableRanges],
  )
  const currentWk = useMemo(() => currentWeekNumber(weeks), [weeks])
  const completedIds = useMemo(() => new Set(Object.keys(logs)), [logs])

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
            onToggle={toggleComplete}
          />
        ))}
      </div>
    </div>
  )
}
