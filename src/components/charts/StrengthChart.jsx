import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useUnits } from '../../context/UnitContext'

const tokens = {
  primary: '#ab3600',
  accent: '#ff5f1f',
  grid: '#e0e3e5',
  label: '#565e74',
  surface: '#ffffff',
}

function ChartTooltip({ active, payload, label, unit = 'lbs' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-sm elev-overlay">
      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-xs">{label}</p>
      <p className="font-headline-md text-headline-md text-on-surface">
        {payload[0].value}
        <span className="font-label-sm text-label-sm text-secondary ml-xs">{unit}</span>
      </p>
    </div>
  )
}

export default function StrengthChart({ data }) {
  // Lifted weights arrive in lbs from the API; convert here so every caller
  // doesn't have to remember to.
  const { weightLabel, showWeight } = useUnits()
  const series = (data ?? []).map((point) => ({ ...point, value: showWeight(point.value) }))

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="strengthStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={tokens.primary} />
            <stop offset="100%" stopColor={tokens.accent} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={tokens.grid} vertical={false} />
        <XAxis
          dataKey="month"
          stroke={tokens.label}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fontFamily: 'Inter' }}
        />
        <YAxis
          stroke={tokens.label}
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 12, fontFamily: 'Inter' }}
          domain={['dataMin - 20', 'dataMax + 20']}
        />
        <Tooltip content={<ChartTooltip unit={weightLabel} />} cursor={{ stroke: tokens.grid, strokeWidth: 2 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#strengthStroke)"
          strokeWidth={4}
          strokeLinecap="round"
          dot={{ r: 4, fill: tokens.accent, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: tokens.primary, stroke: tokens.surface, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export { ChartTooltip, tokens }
