import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../store'
import { paceTargets } from '../lib/pace-targets'

export default function Onboarding() {
  const updateSettings = useStore((s) => s.updateSettings)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const settings = useStore((s) => s.settings)

  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState(settings.name || '')
  const [h, setH] = useState(settings.goalRaceTime?.hours.toString() ?? '2')
  const [m, setM] = useState(
    settings.goalRaceTime?.minutes.toString().padStart(2, '0') ?? '15',
  )
  const [s, setS] = useState(
    settings.goalRaceTime?.seconds.toString().padStart(2, '0') ?? '00',
  )

  const goal = {
    hours: parseInt(h, 10) || 0,
    minutes: parseInt(m, 10) || 0,
    seconds: parseInt(s, 10) || 0,
  }
  const targets = paceTargets(goal)

  const handleStep1Next = () => {
    if (name.trim()) updateSettings({ name: name.trim() })
    setStep(2)
  }

  const handleFinish = () => {
    const totalSec = goal.hours * 3600 + goal.minutes * 60 + goal.seconds
    updateSettings({ goalRaceTime: totalSec > 0 ? goal : null })
    completeOnboarding()
  }

  const handleSkip = () => {
    if (name.trim()) updateSettings({ name: name.trim() })
    completeOnboarding()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="pt-safe flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-xl px-5 py-10">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Welcome
                </div>
                <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Let's get you to race day.
                </h1>
                <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
                  8 weeks of training, built around your tournaments and your Sunday race
                  on August 2.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <label className="block">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    What should we call you?
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anna"
                    autoFocus
                    className="mt-1 w-full border-0 bg-transparent p-0 text-2xl font-semibold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-700"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleStep1Next}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="block w-full text-center text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                Skip setup
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Step 2 of 2
                </div>
                <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Got a goal time?
                </h1>
                <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
                  We'll use it to suggest pace ranges for your easy and long runs. You can
                  change it anytime in Settings.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Goal half marathon time
                </div>
                <div className="mt-2 flex items-center gap-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  <TimeInput value={h} onChange={setH} max={6} label="h" />
                  <span className="text-zinc-300 dark:text-zinc-700">:</span>
                  <TimeInput value={m} onChange={setM} max={59} label="m" pad />
                  <span className="text-zinc-300 dark:text-zinc-700">:</span>
                  <TimeInput value={s} onChange={setS} max={59} label="s" pad />
                </div>
              </div>

              {targets && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Your pace targets
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <PaceLine label="Race pace" value={`${targets.race} /mi`} />
                    <PaceLine
                      label="Easy run"
                      value={`${targets.easyMin}–${targets.easyMax} /mi`}
                    />
                    <PaceLine
                      label="Long run"
                      value={`${targets.longMin}–${targets.longMax} /mi`}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Let's go
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setH('0')
                  setM('0')
                  setS('0')
                  handleFinish()
                }}
                className="block w-full text-center text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                Skip — I'll set this later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TimeInput({
  value,
  onChange,
  max,
  label,
  pad,
}: {
  value: string
  onChange: (v: string) => void
  max: number
  label: string
  pad?: boolean
}) {
  return (
    <label className="flex flex-col items-center">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        maxLength={2}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          const n = raw === '' ? '' : Math.min(parseInt(raw, 10), max).toString()
          onChange(n)
        }}
        onBlur={() => {
          if (pad && value.length === 1) onChange(value.padStart(2, '0'))
        }}
        className="w-[2.5ch] bg-transparent text-center outline-none focus:text-emerald-600 dark:focus:text-emerald-400"
      />
      <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </div>
    </label>
  )
}

function PaceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{value}</div>
    </div>
  )
}
