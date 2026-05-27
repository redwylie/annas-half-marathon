import type { WeekStats } from '../lib/progress'

interface Props {
  weeks: WeekStats[]
  currentWeek: number
}

const HEIGHT = 200
const BAR_GAP = 4
const GROUP_GAP_RATIO = 0.5  // gap between weeks as a ratio of bar width

export default function MileageChart({ weeks, currentWeek }: Props) {
  const maxMiles = Math.max(13.1, ...weeks.map((w) => Math.max(w.plannedMiles, w.actualMiles)))
  const niceMax = Math.ceil(maxMiles / 2) * 2  // round up to nearest 2

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Weekly mileage
          </div>
          <div className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Planned vs actual
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
          <Legend color="bg-zinc-200 dark:bg-zinc-700" label="planned" />
          <Legend color="bg-emerald-500 dark:bg-emerald-400" label="actual" />
        </div>
      </div>

      <div
        className="relative mt-5"
        style={{ height: HEIGHT }}
        role="img"
        aria-label={`Weekly mileage chart: ${weeks.length} weeks of planned vs actual miles`}
      >
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <div
            key={p}
            className="absolute left-0 right-0 border-t border-dashed border-zinc-100 dark:border-zinc-800"
            style={{ bottom: `${p * 100}%` }}
          >
            <div className="-translate-y-1/2 text-[9px] text-zinc-400 dark:text-zinc-600">
              {Math.round(p * niceMax)}
            </div>
          </div>
        ))}

        {/* bars */}
        <div className="absolute inset-x-6 inset-y-0 flex items-end">
          {weeks.map((w) => {
            const isCurrent = w.weekNumber === currentWeek
            const plannedH = (w.plannedMiles / niceMax) * 100
            const actualH = (w.actualMiles / niceMax) * 100
            return (
              <div
                key={w.weekNumber}
                className="group relative flex h-full flex-1 items-end"
                style={{ marginRight: GROUP_GAP_RATIO * 12 }}
              >
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className={`relative w-full rounded-t-sm transition-colors ${
                      isCurrent
                        ? 'bg-zinc-300 dark:bg-zinc-600'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                    style={{ height: `${plannedH}%`, marginRight: BAR_GAP / 2 }}
                    title={`Planned: ${w.plannedMiles} mi`}
                  />
                  <div
                    className={`relative w-full rounded-t-sm transition-colors ${
                      isCurrent
                        ? 'bg-emerald-600 dark:bg-emerald-400'
                        : 'bg-emerald-500/80 dark:bg-emerald-500/60'
                    }`}
                    style={{ height: `${actualH}%`, marginLeft: BAR_GAP / 2 }}
                    title={`Actual: ${w.actualMiles.toFixed(1)} mi`}
                  />
                </div>
                {/* hover tooltip */}
                <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-zinc-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                  <div className="whitespace-nowrap font-medium">Week {w.weekNumber}</div>
                  <div className="whitespace-nowrap tabular-nums">
                    {w.actualMiles.toFixed(1)} / {w.plannedMiles} mi
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex pl-6 pr-0">
        {weeks.map((w) => {
          const isCurrent = w.weekNumber === currentWeek
          return (
            <div
              key={w.weekNumber}
              className={`flex-1 text-center text-[10px] ${
                isCurrent
                  ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
              style={{ marginRight: GROUP_GAP_RATIO * 12 }}
            >
              W{w.weekNumber}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`h-2 w-2 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}
