import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoggedWorkout, UnavailableRange, UserSettings } from '../lib/types'

const RACE_DATE_DEFAULT = '2026-08-02'

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
  toggleComplete: (workoutId: string) => void
  logWorkout: (log: LoggedWorkout) => void
  updateSettings: (patch: Partial<UserSettings>) => void
  addUnavailable: (range: Omit<UnavailableRange, 'id'>) => void
  removeUnavailable: (id: string) => void
  resetAll: () => void
}

const initialSettings: UserSettings = {
  name: '',
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
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      addUnavailable: (range) =>
        set((s) => ({
          settings: {
            ...s.settings,
            unavailableRanges: [
              ...s.settings.unavailableRanges,
              { ...range, id: `range-${Date.now()}` },
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
      resetAll: () => set({ settings: initialSettings, logs: {} }),
    }),
    {
      name: 'ahmt-v1',
      version: 1,
    },
  ),
)
