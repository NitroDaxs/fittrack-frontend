import { useMemo, useState } from 'react'

// Intensity ramp uses the primary scale, matching the legend in the design.
const intensities = ['bg-surface-variant', 'bg-primary-fixed-dim', 'bg-primary-container', 'bg-primary']

const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function ConsistencyHeatmap({ days }) {
  const [hovered, setHovered] = useState(null)

  // Bucket the flat day list into columns of seven, aligned so each column is a
  // calendar week starting on Sunday.
  const { columns, monthMarkers } = useMemo(() => {
    if (!days?.length) return { columns: [], monthMarkers: [] }

    const padded = []
    const firstDay = new Date(days[0].date).getDay()
    for (let i = 0; i < firstDay; i++) padded.push(null)
    padded.push(...days)

    const cols = []
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7))

    const markers = []
    let lastMonth = null
    cols.forEach((week, index) => {
      const firstReal = week.find(Boolean)
      if (!firstReal) return
      const month = new Date(firstReal.date).getMonth()
      if (month !== lastMonth) {
        markers.push({ index, label: new Date(firstReal.date).toLocaleDateString(undefined, { month: 'short' }) })
        lastMonth = month
      }
    })

    return { columns: cols, monthMarkers: markers }
  }, [days])

  const total = days?.reduce((sum, day) => sum + day.count, 0) ?? 0
  const activeDays = days?.filter((day) => day.count > 0).length ?? 0

  return (
    <div>
      <div className="flex items-start gap-sm overflow-x-auto pb-sm custom-scrollbar">
        <div className="flex flex-col gap-xs pt-[18px] shrink-0">
          {weekdayLabels.map((label, i) => (
            <span key={i} className="h-4 font-label-sm text-[10px] text-secondary leading-4 w-8">
              {label}
            </span>
          ))}
        </div>

        <div className="relative">
          <div className="flex gap-xs h-[18px] mb-0">
            {columns.map((_, index) => {
              const marker = monthMarkers.find((m) => m.index === index)
              return (
                <span key={index} className="w-4 font-label-sm text-[10px] text-secondary whitespace-nowrap">
                  {marker?.label ?? ''}
                </span>
              )
            })}
          </div>

          <div className="flex gap-xs">
            {columns.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-xs">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = week[dayIndex]
                  if (!day) return <span key={dayIndex} className="w-4 h-4" />
                  const level = Math.min(day.count, 3)
                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(day)}
                      onBlur={() => setHovered(null)}
                      aria-label={`${day.date}: ${day.count} ${day.count === 1 ? 'session' : 'sessions'}`}
                      className={`w-4 h-4 rounded-sm ${intensities[level]} hover:ring-2 hover:ring-primary/40 focus:ring-2 focus:ring-primary outline-none transition-shadow`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-sm mt-md">
        <p className="font-label-sm text-label-sm text-secondary" aria-live="polite">
          {hovered
            ? `${new Date(hovered.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} — ${hovered.count} ${hovered.count === 1 ? 'session' : 'sessions'}`
            : `${total} sessions across ${activeDays} active days`}
        </p>
        <div className="flex items-center gap-xs text-secondary font-label-sm text-label-sm">
          <span>Less</span>
          {intensities.map((tone) => (
            <span key={tone} className={`w-3 h-3 rounded-sm ${tone}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
