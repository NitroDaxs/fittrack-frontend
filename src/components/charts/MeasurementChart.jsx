import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { tokens } from './StrengthChart'
import { useUnits } from '../../context/UnitContext'

// ComposedChart rather than AreaChart: AreaChart only accepts Area children, so
// the body-fat Line would be dropped silently.

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

// Callers pass weights already converted for display, so the tooltip only has
// to label them correctly -- it must never convert a second time.
function MeasurementTooltip({ active, payload, label, weightLabel }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-sm elev-overlay">
      <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-xs">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-label-bold text-label-bold text-on-surface flex items-center gap-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {entry.value}
          {entry.dataKey === 'bodyFat' ? '%' : ` ${weightLabel}`}
        </p>
      ))}
    </div>
  )
}

export default function MeasurementChart({ data, showBodyFat = false }) {
  const { weightLabel } = useUnits()
  const axisTick = { fontSize: 12, fontFamily: 'Inter' }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <ComposedChart data={data} margin={{ top: 8, right: showBodyFat ? 0 : 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tokens.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={tokens.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={tokens.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke={tokens.label}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tick={axisTick}
        />
        <YAxis
          yAxisId="weight"
          stroke={tokens.label}
          tickLine={false}
          axisLine={false}
          width={48}
          domain={['dataMin - 3', 'dataMax + 3']}
          tick={axisTick}
        />
        {showBodyFat ? (
          <YAxis
            yAxisId="bodyFat"
            orientation="right"
            stroke={tokens.label}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={['dataMin - 1', 'dataMax + 1']}
            tickFormatter={(value) => `${value}%`}
            tick={axisTick}
          />
        ) : null}
        <Tooltip
          content={<MeasurementTooltip weightLabel={weightLabel} />}
          cursor={{ stroke: tokens.grid, strokeWidth: 2 }}
        />
        <Area
          yAxisId="weight"
          type="monotone"
          dataKey="weight"
          name="Weight"
          stroke={tokens.accent}
          strokeWidth={3}
          fill="url(#weightFill)"
          dot={false}
          activeDot={{ r: 5, fill: tokens.primary, stroke: '#fff', strokeWidth: 2 }}
        />
        {showBodyFat ? (
          <Line
            yAxisId="bodyFat"
            type="monotone"
            dataKey="bodyFat"
            name="Body fat"
            stroke={tokens.label}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4, fill: tokens.label, stroke: '#fff', strokeWidth: 2 }}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
