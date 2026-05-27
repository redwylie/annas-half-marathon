import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  LoggedWorkout,
  UnavailableRange,
  UserSettings,
  WorkoutOverride,
} from '../lib/types'

const RACE_DATE_DEFAULT = '2026-08-02'

function newId(): string {
  // crypto.randomUUID exists in all modern browsers + Node 19+ but we keep a
  // fallback so even on older Safari we don't collide on rapid taps.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const DEFAULT_TOURNAMENTS: UnavailableRange[] = [
  {
    id: 'tournament-jun-12',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    label: 'Frisbee tournament',
    treatAs: 'tournament',
  },
  {
    id: 'tournament-jul-11',
    startDate: '2026-07-11',
    endDate: '2026-07-12',
    label: 'Frisbee tournament',
    treatAs: 'tournament',
  },
  {
    id: 'tournament-jul-16',
    startDate: '2026-07-16',
    endDate: '2026-07-19',
    label: 'Frisbee tournament',
    treatAs: 'tournament',
  },
]

interface AppState {
  settings: UserSettings
  logs: Record<string, LoggedWorkout>
  overrides: Record<string, WorkoutOverride>
  onboardingDone: boolean
  toggleComplete: (workoutId: string) => void
  logWorkout: (log: LoggedWorkout) => void
  setOverride: (workoutId: string, override: WorkoutOverride) => void
  clearOverride: (workoutId: string) => void
  updateSettings: (patch: Partial<UserSettings>) => void
  addUnavailable: (range: Omit<UnavailableRange, 'id'>) => void
  removeUnavailable: (id: string) => void
  completeOnboarding: () => void
  resetAll: () => void
  restoreFromBackup: (next: {
    settings: UserSettings
    logs: Record<string, LoggedWorkout>
    overrides: Record<string, WorkoutOverride>
    onboardingDone: boolean
  }) => void
}

const initialSettings: UserSettings = {
  name: 'Anna',
  goalRaceTime: null,
  raceDate: RACE_DATE_DEFAULT,
  units: 'mi',
  unavailableRanges: DEFAULT_TOURNAMENTS,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      settings: initialSettings,
      logs: {},
      overrides: {},
      onboardingDone: false,
      toggleComplete: (workoutId) =>
        set((s) => {
          const existing = s.logs[workoutId]
          if (existing) {
            const { [workoutId]: _removed, ...rest } = s.logs
            void _removed
            return { logs: rest }
          }
          return {
            logs: {
              ...s.logs,
              [workoutId]: { workoutId, completedAt: new Date().toISOString() },
            },
          }
        }),
      logWorkout: (log) =>
        set((s) => ({ logs: { ...s.logs, [log.workoutId]: log } })),
      setOverride: (workoutId, override) =>
        set((s) => ({
          overrides: { ...s.overrides, [workoutId]: override },
        })),
      clearOverride: (workoutId) =>
        set((s) => {
          const { [workoutId]: _removed, ...rest } = s.overrides
          void _removed
          return { overrides: rest }
        }),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      addUnavailable: (range) =>
        set((s) => ({
          settings: {
            ...s.settings,
            unavailableRanges: [
              ...s.settings.unavailableRanges,
              { ...range, id: `range-${newId()}` },
            ],
          },
        })),
      removeUnavailable: (id) =>
        set((s) => ({
          settings: {
            ...s.settings,
            unavailableRanges: s.settings.unavailableRanges.filter((r) => r.id !== id),
          },
        })),
      completeOnboarding: () => set({ onboardingDone: true }),
      resetAll: () =>
        set({ settings: initialSettings, logs: {}, overrides: {}, onboardingDone: false }),
      restoreFromBackup: (next) =>
        set({
          settings: next.settings,
          logs: next.logs,
          overrides: next.overrides,
          onboardingDone: next.onboardingDone,
        }),
    }),
    {
      name: 'ahmt-v1',
      version: 1,
      // Future schema bumps land here. Each case must return a state
      // object compatible with the CURRENT app — never throw, never
      // wipe logs. If you can't migrate a field, default it.
      migrate: (persistedState: unknown, fromVersion: number) => {
        const state = (persistedState as Partial<AppState>) ?? {}
        // No real migrations yet; we're at v1. This switch exists so
        // future versions don't fall through zustand's default
        // "version mismatch -> return initial" behavior.
        if (fromVersion < 1) {
          return state
        }
        return state
      },
      // Defensive merge: shallow-merge persisted state onto the live
      // initial state, so any newly-added top-level field (e.g. when
      // we added `overrides` and `onboardingDone` mid-flight) gets a
      // safe default instead of being undefined.
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AppState>) ?? {}
        return {
          ...currentState,
          ...persisted,
          settings: {
            ...currentState.settings,
            ...(persisted.settings ?? {}),
            // unavailableRanges must be an array, even if a corrupted
            // persisted state has `undefined`.
            unavailableRanges: Array.isArray(persisted.settings?.unavailableRanges)
              ? persisted.settings!.unavailableRanges
              : currentState.settings.unavailableRanges,
          },
          logs: typeof persisted.logs === 'object' && persisted.logs ? persisted.logs : {},
          overrides:
            typeof persisted.overrides === 'object' && persisted.overrides
              ? persisted.overrides
              : {},
          onboardingDone: !!persisted.onboardingDone,
        }
      },
    },
  ),
)
