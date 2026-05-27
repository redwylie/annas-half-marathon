import { useStore } from '../store'

/**
 * Wraps store.toggleComplete with a confirmation guard so unchecking a workout
 * that has rich log data (miles, time, RPE, or notes) doesn't silently wipe it.
 */
export function useSafeToggleComplete() {
  const toggleComplete = useStore((s) => s.toggleComplete)
  const logs = useStore((s) => s.logs)

  return (workoutId: string) => {
    const existing = logs[workoutId]
    if (existing) {
      const hasRichData =
        existing.actualMiles != null ||
        existing.actualMinutes != null ||
        existing.perceivedEffort != null ||
        (existing.notes && existing.notes.length > 0)
      if (hasRichData) {
        const ok = window.confirm(
          'Unchecking this workout will also delete the distance, time, and notes you logged for it. Are you sure?',
        )
        if (!ok) return
      }
    }
    toggleComplete(workoutId)
  }
}
