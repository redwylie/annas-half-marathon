import { differenceInCalendarDays } from 'date-fns'

const RACE_DATE = new Date('2026-08-02T00:00:00')

export default function Header() {
  const daysToRace = Math.max(0, differenceInCalendarDays(RACE_DATE, new Date()))
  const label =
    daysToRace === 0 ? 'Race day!' : `${daysToRace} ${daysToRace === 1 ? 'day' : 'days'} to go`

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
              Anna's Half
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Aug 2, 2026 · Sunday
            </div>
          </div>
        </div>
        <div className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-sm dark:bg-emerald-500">
          {label}
        </div>
      </div>
    </header>
  )
}
