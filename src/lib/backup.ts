import type { LoggedWorkout, UserSettings, WorkoutOverride } from './types'
import { format } from 'date-fns'

export interface BackupPayload {
  version: 1
  exportedAt: string
  app: 'annas-half-marathon'
  state: {
    settings: UserSettings
    logs: Record<string, LoggedWorkout>
    overrides: Record<string, WorkoutOverride>
    onboardingDone: boolean
  }
}

export function buildBackup(state: BackupPayload['state']): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'annas-half-marathon',
    state,
  }
}

export function downloadBackup(state: BackupPayload['state'], nameHint?: string) {
  const payload = buildBackup(state)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const tag = (nameHint ?? 'half-marathon').replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
  a.download = `${tag}-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Strict validation: rejects malformed backups, defaults missing-but-recoverable
 * fields. Anything that returns successfully here is safe to feed into
 * restoreFromBackup without crashing the app.
 */
export function parseBackup(raw: string): BackupPayload['state'] | { error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'File is not valid JSON.' }
  }
  if (!parsed || typeof parsed !== 'object') {
    return { error: 'Backup file is empty or malformed.' }
  }
  const obj = parsed as Partial<BackupPayload>
  if (obj.app !== 'annas-half-marathon') {
    return { error: 'This file does not look like a Run Anna Run backup.' }
  }
  if (obj.version !== 1) {
    return { error: `Unsupported backup version: ${obj.version}` }
  }
  if (!obj.state || typeof obj.state !== 'object') {
    return { error: 'Backup is missing a state payload.' }
  }
  const state = obj.state as Partial<BackupPayload['state']>

  if (!state.settings || typeof state.settings !== 'object') {
    return { error: 'Backup is missing settings.' }
  }
  const s = state.settings as Partial<UserSettings>

  // raceDate is required because the entire plan generator is keyed off it.
  if (typeof s.raceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.raceDate)) {
    return { error: 'Backup has a missing or invalid race date.' }
  }

  // logs must be a plain object; we don't deep-validate each entry because
  // the consumers tolerate missing optional fields. But the shape must be {}.
  if (!state.logs || typeof state.logs !== 'object' || Array.isArray(state.logs)) {
    return { error: 'Backup logs are missing or malformed.' }
  }
  // Reject any log entry that doesn't carry its own workoutId (cheap sanity).
  for (const [key, entry] of Object.entries(state.logs as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object') {
      return { error: `Backup log entry "${key}" is malformed.` }
    }
    const e = entry as Partial<LoggedWorkout>
    if (typeof e.workoutId !== 'string' || typeof e.completedAt !== 'string') {
      return { error: `Backup log entry "${key}" is missing workoutId or completedAt.` }
    }
  }

  // Overrides may be absent; default to {}. If present, must be an object.
  if (
    state.overrides !== undefined &&
    (typeof state.overrides !== 'object' ||
      state.overrides === null ||
      Array.isArray(state.overrides))
  ) {
    return { error: 'Backup overrides are malformed.' }
  }

  // unavailableRanges may be absent in older backups; default to [].
  const ranges = s.unavailableRanges
  if (ranges !== undefined && !Array.isArray(ranges)) {
    return { error: 'Backup unavailable date ranges are malformed.' }
  }

  return {
    settings: {
      name: typeof s.name === 'string' ? s.name : 'Anna',
      goalRaceTime: s.goalRaceTime ?? null,
      raceDate: s.raceDate,
      units: s.units === 'km' ? 'km' : 'mi',
      unavailableRanges: ranges ?? [],
    },
    logs: state.logs as Record<string, LoggedWorkout>,
    overrides: (state.overrides ?? {}) as Record<string, WorkoutOverride>,
    onboardingDone: !!state.onboardingDone,
  }
}
