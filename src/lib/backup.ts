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

/** Best-effort validation: returns the state if the payload looks sane. */
export function parseBackup(raw: string): BackupPayload['state'] | { error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { error: 'File is not valid JSON.' }
  }
  if (!parsed || typeof parsed !== 'object') return { error: 'Backup file is empty or malformed.' }
  const obj = parsed as Partial<BackupPayload>
  if (obj.app !== 'annas-half-marathon') {
    return { error: 'This file does not look like an Anna’s Half backup.' }
  }
  if (obj.version !== 1) {
    return { error: `Unsupported backup version: ${obj.version}` }
  }
  if (!obj.state || typeof obj.state !== 'object') {
    return { error: 'Backup is missing a state payload.' }
  }
  const state = obj.state
  // Minimal shape check: must have settings + logs.
  if (!state.settings || typeof state.settings !== 'object') {
    return { error: 'Backup is missing settings.' }
  }
  if (!state.logs || typeof state.logs !== 'object') {
    return { error: 'Backup is missing logs.' }
  }
  return {
    settings: state.settings,
    logs: state.logs,
    overrides: state.overrides ?? {},
    onboardingDone: !!state.onboardingDone,
  }
}
