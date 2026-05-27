import { differenceInCalendarDays, parseISO, format } from 'date-fns'
import { useStore } from '../store'

export default function Header() {
  const name = useStore((s) => s.settings.name)
  const raceDate = useStore((s) => s.settings.raceDate)
  const race = parseISO(raceDate)
  const title = name ? `Run ${name} Run` : 'Half Marathon'
  const daysToRace = Math.max(0, differenceInCalendarDays(race, new Date()))
  const label =
    daysToRace === 0 ? 'Race day!' : `${daysToRace} ${daysToRace === 1 ? 'day' : 'days'} to go`
  const subtitle = `${format(race, 'MMM d, yyyy')} · ${format(race, 'EEEE')}`

  // Race-day-soon: highlight when within a week.
  const urgent = daysToRace > 0 && daysToRace <= 7
  const today = daysToRace === 0

  const chipClass = today
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30'
    : urgent
      ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-400 dark:text-amber-950'
      : 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'

  return (
    <header className="pt-safe sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}rabbit.svg`}
            alt=""
            className="h-7 w-7 dark:invert"
          />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${chipClass}`}
        >
          {urgent && (
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          )}
          {label}
        </div>
      </div>
    </header>
  )
}
