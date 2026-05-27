/**
 * Parse user-entered time into total seconds.
 *
 * Accepts:
 *   "55"        -> 55 seconds
 *   "55:30"     -> 55 min 30 sec
 *   "1:55:30"   -> 1 hr 55 min 30 sec
 *   "1.55"      -> 1 minute, 33 seconds (decimal minutes)
 *
 * Returns null for unparseable input.
 */
export function parseTimeToSeconds(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Decimal-minute form: 9.5 -> 9 min 30 sec
  if (/^\d+\.\d+$/.test(trimmed)) {
    const mins = parseFloat(trimmed)
    if (Number.isNaN(mins)) return null
    return Math.round(mins * 60)
  }

  const parts = trimmed.split(':')
  if (parts.some((p) => !/^\d+$/.test(p))) return null
  const nums = parts.map((p) => parseInt(p, 10))
  if (nums.length === 1) return nums[0]
  if (nums.length === 2) return nums[0] * 60 + nums[1]
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2]
  return null
}

export function formatSeconds(totalSec: number): string {
  if (totalSec < 0 || !Number.isFinite(totalSec)) return '–'
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = Math.floor(totalSec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Pace per mile, formatted as M:SS. Returns null if inputs are invalid. */
export function computePace(miles: number, seconds: number): string | null {
  if (!miles || miles <= 0 || !seconds || seconds <= 0) return null
  const paceSec = seconds / miles
  if (!Number.isFinite(paceSec)) return null
  const m = Math.floor(paceSec / 60)
  const s = Math.round(paceSec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
