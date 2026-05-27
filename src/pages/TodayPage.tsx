export default function TodayPage() {
  return (
    <div className="py-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Today
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Your training starts soon
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Once we wire up the plan generator, this card will show today's workout — distance,
          pace target, and a quick log button.
        </p>
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Milestone 3 will turn this into the daily focus card.
        </div>
      </div>
    </div>
  )
}
