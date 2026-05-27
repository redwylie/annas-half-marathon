import { NavLink } from 'react-router-dom'
import { Home, ListChecks, TrendingUp, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/plan', label: 'Plan', icon: ListChecks, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export default function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200/70 bg-white/90 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/90">
      <ul className="mx-auto flex w-full max-w-2xl items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className={isActive ? 'font-medium' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
