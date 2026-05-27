import { generatePlan } from '../src/lib/generator.ts'

const ranges = [
  { id: '1', startDate: '2026-06-12', endDate: '2026-06-14', label: 'Frisbee', treatAs: 'tournament' },
  { id: '2', startDate: '2026-07-11', endDate: '2026-07-12', label: 'Frisbee', treatAs: 'tournament' },
  { id: '3', startDate: '2026-07-16', endDate: '2026-07-19', label: 'Frisbee', treatAs: 'tournament' },
]
const weeks = generatePlan('2026-08-02', ranges)
for (const w of weeks) {
  console.log(`\nWeek ${w.weekNumber} ${w.startDate}..${w.endDate}`)
  for (const wo of w.workouts) {
    const mark = wo.rescheduledFrom ? ` (← ${wo.rescheduledFrom})` : ''
    console.log(`  ${wo.date} ${wo.day.padEnd(3)} ${wo.type.padEnd(12)} ${wo.plannedMiles}mi  ${wo.label}${mark}`)
  }
}
