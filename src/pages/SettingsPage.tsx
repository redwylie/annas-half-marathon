import { useRef, useState } from 'react'
import { Trash2, Plus, RotateCcw, Download, Upload } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useStore } from '../store'
import { paceTargets } from '../lib/pace-targets'
import { downloadBackup, parseBackup } from '../lib/backup'
import type { UnavailableRange } from '../lib/types'

export default function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const addUnavailable = useStore((s) => s.addUnavailable)
  const removeUnavailable = useStore((s) => s.removeUnavailable)
  const resetAll = useStore((s) => s.resetAll)

  const targets = paceTargets(settings.goalRaceTime)

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>

      <Section title="Profile">
        <Field label="Name">
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="Anna"
            className="w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
        </Field>
      </Section>

      <Section title="Race">
        <Field label="Race date">
          <input
            type="date"
            value={settings.raceDate}
            onChange={(e) => updateSettings({ raceDate: e.target.value })}
            className="w-full bg-transparent text-base text-zinc-900 outline-none dark:text-zinc-100 dark:[color-scheme:dark]"
          />
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {format(parseISO(settings.raceDate), 'EEEE, MMMM d, yyyy')}
          </div>
        </Field>

        <GoalTimeField />

        {targets && (
          <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Pace targets
            </div>
            <div className="mt-2 space-y-1.5 text-sm">
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
      </Section>

      <Section title="Unavailable dates">
        <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Tournament weekends and other days you can't train. Long runs auto-reschedule
          around them.
        </p>
        <div className="space-y-2">
          {settings.unavailableRanges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 px-3 py-3 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No conflicts. Add one if you need to.
            </div>
          ) : (
            settings.unavailableRanges.map((r) => (
              <UnavailableRow key={r.id} range={r} onRemove={() => removeUnavailable(r.id)} />
            ))
          )}
        </div>
        <AddUnavailable onAdd={addUnavailable} />
      </Section>

      <Section title="Data">
        <DataActions />
      </Section>

      <Section title="Danger zone">
        <ResetButton onReset={resetAll} />
      </Section>

      <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        v0.5.0 · Anna's Half Marathon Training
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block rounded-xl border border-zinc-200 bg-white px-3 py-2.5 focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function GoalTimeField() {
  const goal = useStore((s) => s.settings.goalRaceTime)
  const updateSettings = useStore((s) => s.updateSettings)

  const [h, setH] = useState(goal?.hours?.toString() ?? '')
  const [m, setM] = useState(goal?.minutes?.toString().padStart(2, '0') ?? '')
  const [s, setS] = useState(goal?.seconds?.toString().padStart(2, '0') ?? '')

  const commit = (next: { h?: string; m?: string; s?: string }) => {
    const hh = parseInt(next.h ?? h, 10) || 0
    const mm = parseInt(next.m ?? m, 10) || 0
    const ss = parseInt(next.s ?? s, 10) || 0
    const total = hh * 3600 + mm * 60 + ss
    updateSettings({
      goalRaceTime: total > 0 ? { hours: hh, minutes: mm, seconds: ss } : null,
    })
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Goal half-marathon time
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        <DigitInput value={h} onChange={(v) => { setH(v); commit({ h: v }) }} max={6} suffix="h" />
        <span className="text-zinc-300 dark:text-zinc-700">:</span>
        <DigitInput value={m} onChange={(v) => { setM(v); commit({ m: v }) }} max={59} suffix="m" pad />
        <span className="text-zinc-300 dark:text-zinc-700">:</span>
        <DigitInput value={s} onChange={(v) => { setS(v); commit({ s: v }) }} max={59} suffix="s" pad />
      </div>
    </div>
  )
}

function DigitInput({
  value,
  onChange,
  max,
  suffix,
  pad,
}: {
  value: string
  onChange: (v: string) => void
  max: number
  suffix: string
  pad?: boolean
}) {
  return (
    <label className="flex items-baseline">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        maxLength={2}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          if (raw === '') return onChange('')
          onChange(Math.min(parseInt(raw, 10), max).toString())
        }}
        onBlur={() => {
          if (pad && value.length === 1) onChange(value.padStart(2, '0'))
        }}
        className="w-[2ch] bg-transparent text-right outline-none placeholder:text-zinc-300 focus:text-emerald-600 dark:placeholder:text-zinc-700 dark:focus:text-emerald-400"
      />
      <span className="ml-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {suffix}
      </span>
    </label>
  )
}

function PaceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="text-xs text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  )
}

function UnavailableRow({
  range,
  onRemove,
}: {
  range: UnavailableRange
  onRemove: () => void
}) {
  const start = parseISO(range.startDate)
  const end = parseISO(range.endDate)
  const sameDay = range.startDate === range.endDate
  const sameMonth = start.getMonth() === end.getMonth()
  const formatted = sameDay
    ? format(start, 'MMM d, yyyy')
    : sameMonth
      ? `${format(start, 'MMM d')}–${format(end, 'd, yyyy')}`
      : `${format(start, 'MMM d')}–${format(end, 'MMM d, yyyy')}`

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {range.label}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{formatted}</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${range.label}`}
        className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function AddUnavailable({
  onAdd,
}: {
  onAdd: (range: Omit<UnavailableRange, 'id'>) => void
}) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const valid = label.trim() && start && end && end >= start

  const submit = () => {
    if (!valid) return
    onAdd({
      label: label.trim(),
      startDate: start,
      endDate: end,
      treatAs: 'tournament',
    })
    setLabel('')
    setStart('')
    setEnd('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
      >
        <Plus className="h-3.5 w-3.5" />
        Add unavailable dates
      </button>
    )
  }

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <Field label="Label">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Frisbee tournament"
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Start">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100 dark:[color-scheme:dark]"
          />
        </Field>
        <Field label="End">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100 dark:[color-scheme:dark]"
          />
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={submit}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:disabled:hover:bg-emerald-500"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function DataActions() {
  const settings = useStore((s) => s.settings)
  const logs = useStore((s) => s.logs)
  const overrides = useStore((s) => s.overrides)
  const onboardingDone = useStore((s) => s.onboardingDone)
  const restoreFromBackup = useStore((s) => s.restoreFromBackup)
  const fileInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [confirming, setConfirming] = useState<null | {
    nextState: Parameters<typeof restoreFromBackup>[0]
  }>(null)

  const handleDownload = () => {
    downloadBackup(
      { settings, logs, overrides, onboardingDone },
      settings.name || 'half-marathon',
    )
    setStatus({ kind: 'ok', text: 'Backup downloaded.' })
  }

  const handlePick = () => fileInput.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await file.text()
    const parsed = parseBackup(text)
    if ('error' in parsed) {
      setStatus({ kind: 'err', text: parsed.error })
      return
    }
    setConfirming({ nextState: parsed })
  }

  const confirmRestore = () => {
    if (!confirming) return
    restoreFromBackup(confirming.nextState)
    const logCount = Object.keys(confirming.nextState.logs).length
    setConfirming(null)
    setStatus({
      kind: 'ok',
      text: `Restored ${logCount} log${logCount === 1 ? '' : 's'} from backup.`,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Download className="h-3.5 w-3.5" />
          Download backup
        </button>
        <button
          type="button"
          onClick={handlePick}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Upload className="h-3.5 w-3.5" />
          Restore backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Backups save everything (logs, settings, overrides) as a JSON file. Restoring will
        replace what's currently in the app.
      </p>
      {status && (
        <div
          className={`rounded-lg px-3 py-2 text-xs ${
            status.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {status.text}
        </div>
      )}
      {confirming && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="text-xs font-medium text-amber-900 dark:text-amber-200">
            Replace current progress with this backup?
          </div>
          <div className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
            {Object.keys(confirming.nextState.logs).length} logs ·{' '}
            {Object.keys(confirming.nextState.overrides).length} edits ·{' '}
            {confirming.nextState.settings.unavailableRanges.length} unavailable date ranges
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-zinc-900 dark:text-amber-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRestore}
              className="flex-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/30"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset all progress and settings
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="text-xs font-medium text-red-900 dark:text-red-200">
        Wipe everything — logs, overrides, settings — and start over?
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-900 dark:text-red-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onReset()
            setConfirming(false)
          }}
          className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Yes, wipe it
        </button>
      </div>
    </div>
  )
}
