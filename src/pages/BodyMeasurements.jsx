import { useState } from 'react'
import { meApi } from '../api/resources'
import { useResource } from '../api/hooks'
import MeasurementChart from '../components/charts/MeasurementChart'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useUnits } from '../context/UnitContext'

// `kind` drives both the label suffix and which converter runs on submit;
// body fat is a percentage and so belongs to neither unit system.
const fields = [
  { name: 'weight', label: 'Weight', kind: 'weight', step: '0.1', icon: 'monitor_weight' },
  { name: 'bodyFat', label: 'Body Fat %', kind: 'percent', step: '0.1', icon: 'percent' },
  { name: 'waist', label: 'Waist', kind: 'length', step: '0.1', icon: 'straighten' },
  { name: 'chest', label: 'Chest', kind: 'length', step: '0.1', icon: 'straighten' },
  { name: 'arms', label: 'Arms', kind: 'length', step: '0.1', icon: 'straighten' },
]

const emptyForm = { weight: '', bodyFat: '', waist: '', chest: '', arms: '' }

function Delta({ current, previous, suffix = '' }) {
  if (previous == null || current == null) {
    return (
      <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
        <Icon name="horizontal_rule" size={16} />—
      </span>
    )
  }
  const diff = Number((current - previous).toFixed(1))
  const icon = diff === 0 ? 'horizontal_rule' : diff > 0 ? 'arrow_upward' : 'arrow_downward'
  return (
    <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
      <Icon name={icon} size={16} className={diff === 0 ? '' : 'text-primary'} />
      {diff > 0 ? '+' : ''}
      {diff}
      {suffix}
    </span>
  )
}

export default function BodyMeasurements() {
  const { unit, setUnit, weightLabel, lengthLabel, showWeight, showLength, toStoredWeight, toStoredLength } = useUnits()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const { data: measurements, loading, error, refetch } = useResource(() => meApi.measurements(), [])

  const setField = (name) => (event) => {
    setForm((f) => ({ ...f, [name]: event.target.value }))
    setSaved(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = {}
    if (!form.weight) found.weight = 'Weight is required.'
    else if (Number(form.weight) <= 0) found.weight = 'Enter a positive number.'
    if (form.bodyFat && (Number(form.bodyFat) < 0 || Number(form.bodyFat) > 70))
      found.bodyFat = 'Body fat should be between 0 and 70%.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // The API always stores lbs/inches -- convert on the way out so a metric
    // user's "84 kg" isn't written to the database as 84 lbs.
    await meApi.logMeasurement({
      weight: toStoredWeight(form.weight),
      bodyFat: form.bodyFat ? Number(form.bodyFat) : null,
      waist: toStoredLength(form.waist),
      chest: toStoredLength(form.chest),
      arms: toStoredLength(form.arms),
    })
    setForm(emptyForm)
    setSaved(true)
    refetch()
  }

  if (loading) return <Spinner label="Loading measurements" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const chartData = [...(measurements ?? [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((m) => ({ date: m.date, weight: showWeight(m.weight), bodyFat: m.bodyFat }))

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex flex-wrap items-center justify-between gap-md mb-lg">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Body Measurements
        </h1>
        <UnitToggle unit={unit} onChange={setUnit} imperialLabel="lbs / in" metricLabel="kg / cm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Log form */}
        <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Log Measurements</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-md">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="font-label-bold text-label-bold text-on-surface-variant mb-xs flex items-center gap-xs"
                >
                  <Icon name={field.icon} size={16} />
                  {field.label}
                  {field.kind === 'weight' ? ` (${weightLabel})` : null}
                  {field.kind === 'length' ? ` (${lengthLabel})` : null}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step={field.step}
                  min="0"
                  value={form[field.name]}
                  onChange={setField(field.name)}
                  placeholder="—"
                  className={`w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset outline-none transition-all font-body-md text-on-surface focus:ring-2 focus:bg-surface-container-lowest ${
                    errors[field.name] ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'
                  }`}
                />
                {errors[field.name] ? (
                  <p className="font-label-sm text-label-sm text-error mt-xs">{errors[field.name]}</p>
                ) : null}
              </div>
            ))}

            <div className="border border-dashed border-outline-variant rounded-lg p-md flex flex-col items-center text-center">
              <Icon name="add_a_photo" size={28} className="text-secondary mb-xs" />
              <span className="font-label-sm text-label-sm text-secondary">
                Progress Photo — upload lands with the API
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary font-label-bold text-label-bold py-sm rounded-lg hover:bg-primary transition-colors active:scale-[0.98]"
            >
              Save entry
            </button>

            {saved ? (
              <p className="font-label-sm text-label-sm text-primary flex items-center gap-xs justify-center">
                <Icon name="check_circle" size={16} filled />
                Entry added to your history.
              </p>
            ) : null}
          </form>
        </section>

        {/* Trend + history */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface">Weight &amp; Body Fat Trend</h2>
              <div className="flex items-center gap-md font-label-sm text-label-sm text-secondary">
                <span className="flex items-center gap-xs">
                  <span className="w-3 h-1 rounded-full bg-primary-container" /> Weight
                </span>
                <span className="flex items-center gap-xs">
                  <span className="w-3 h-1 rounded-full bg-secondary" /> Body fat
                </span>
              </div>
            </div>
            <div className="flex-grow min-h-[240px]">
              <MeasurementChart data={chartData} showBodyFat />
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
            <h2 className="font-headline-md text-headline-md text-on-surface p-lg pb-md">Recent History</h2>
            <ul className="divide-y divide-surface-variant">
              {(measurements ?? []).slice(0, 8).map((entry, index, list) => {
                const previous = list[index + 1]
                return (
                  <li key={entry.id} className="p-md flex flex-wrap items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex flex-col items-center justify-center shrink-0">
                        <span className="font-label-sm text-[10px] text-secondary uppercase leading-none">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className="font-label-bold text-label-bold text-on-surface leading-none">
                          {new Date(entry.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <span className="block font-label-bold text-label-bold text-on-surface">
                          {showWeight(entry.weight)} {weightLabel}
                        </span>
                        <span className="block font-label-sm text-label-sm text-secondary">
                          {entry.bodyFat != null ? `${entry.bodyFat}% BF` : 'Body fat not logged'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-lg">
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          Weight
                        </span>
                        <Delta current={showWeight(entry.weight)} previous={showWeight(previous?.weight)} />
                      </div>
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          Chest
                        </span>
                        <Delta current={showLength(entry.chest)} previous={showLength(previous?.chest)} />
                      </div>
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          Waist
                        </span>
                        <Delta current={showLength(entry.waist)} previous={showLength(previous?.waist)} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
