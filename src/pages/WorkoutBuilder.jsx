import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exercisesApi } from '../api/resources'
import { useDebounced, useResource } from '../api/hooks'
import { useWorkoutDraft } from '../context/WorkoutContext'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'
import { EmptyState } from '../components/ui/States'

function NumberField({ label, value, onChange, width = 'w-16', accent = false }) {
  return (
    <div className="flex flex-col items-center">
      <label className="font-label-sm text-label-sm text-secondary mb-1">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`${width} h-12 bg-surface-container-low text-center font-label-bold text-label-bold rounded-lg border border-transparent focus:border-primary-container outline-none transition-colors ${
          accent ? 'text-primary-container' : 'text-on-surface'
        }`}
      />
    </div>
  )
}

export default function WorkoutBuilder() {
  const navigate = useNavigate()
  const { draft, setDraftName, addExercise, removeItem, updateItem, moveItem, resetDraft, startSession } =
    useWorkoutDraft()

  const [search, setSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const debouncedSearch = useDebounced(search)

  const { data, loading } = useResource(
    () => exercisesApi.list({ search: debouncedSearch, perPage: 6 }),
    [debouncedSearch],
    { skip: !pickerOpen }
  )
  const results = data?.data ?? []

  // Drag-to-reorder. dragIndex is the row being dragged; overIndex drives the
  // drop indicator. Touch users get the up/down buttons instead.
  const dragIndex = useRef(null)
  const [overIndex, setOverIndex] = useState(null)

  const handleDrop = (target) => {
    if (dragIndex.current !== null) moveItem(dragIndex.current, target)
    dragIndex.current = null
    setOverIndex(null)
  }

  const handleStart = () => {
    if (startSession()) navigate('/workout/active')
  }

  const pick = (exercise) => {
    addExercise(exercise)
    setSearch('')
  }

  return (
    <div className="max-w-[800px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-40">
      <header className="mb-xl">
        <input
          type="text"
          value={draft.name}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="Name your workout"
          aria-label="Workout name"
          className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-primary-container p-0 pb-2 text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface placeholder-secondary-fixed-dim outline-none transition-colors"
        />
        <p className="font-body-md text-body-md text-secondary mt-2">
          Build your routine. Drag the handle to reorder exercises.
        </p>
      </header>

      {/* Exercise picker */}
      <div className="relative mb-xl group">
        <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-secondary group-focus-within:text-primary-container transition-colors">
          <Icon name="search" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setPickerOpen(true)}
          placeholder="Search library to add exercise..."
          aria-label="Search library to add exercise"
          className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl pl-12 pr-4 py-4 border-2 border-transparent focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all shadow-sm"
        />

        {pickerOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} aria-hidden="true" />
            <div className="absolute z-20 left-0 right-0 mt-sm bg-surface-container-lowest border border-surface-variant rounded-xl elev-overlay overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <p className="p-md font-body-md text-body-md text-secondary">Searching library…</p>
              ) : results.length === 0 ? (
                <p className="p-md font-body-md text-body-md text-secondary">
                  No exercises match “{search}”.
                </p>
              ) : (
                <ul>
                  {results.map((exercise) => (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => pick(exercise)}
                        className="w-full flex items-center gap-md p-sm hover:bg-surface-container transition-colors text-left"
                      >
                        <span className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                          <Img
                            src={exercise.imageWide ?? exercise.image}
                            alt=""
                            icon={exercise.icon}
                            imgClassName="w-full h-full object-cover"
                          />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-label-bold text-label-bold text-on-surface truncate">
                            {exercise.name}
                          </span>
                          <span className="block font-label-sm text-label-sm text-secondary">
                            {exercise.muscleGroups.join(', ')} • {exercise.equipment}
                          </span>
                        </span>
                        <Icon name="add_circle" size={22} className="text-primary shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Draft list */}
      {draft.items.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
          <EmptyState
            icon="playlist_add"
            title="No exercises yet"
            body="Search the library above and pick a few movements. You can set targets and reorder them afterwards."
          />
        </div>
      ) : (
        <ul className="space-y-md">
          {draft.items.map((item, index) => (
            <li
              key={item.uid}
              draggable
              onDragStart={(event) => {
                dragIndex.current = index
                event.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setOverIndex(index)
              }}
              onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(index)
              }}
              onDragEnd={() => {
                dragIndex.current = null
                setOverIndex(null)
              }}
              className={`bg-surface-container-lowest elev-card rounded-xl p-md flex flex-col md:flex-row gap-md items-start md:items-center border transition-colors ${
                overIndex === index ? 'border-primary-container ring-2 ring-primary-container/30' : 'border-transparent hover:border-surface-variant'
              }`}
            >
              <div className="flex items-center gap-sm w-full md:w-auto md:flex-1 min-w-0">
                <span
                  className="text-secondary cursor-grab active:cursor-grabbing p-1 touch-none shrink-0"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  <Icon name="drag_indicator" />
                </span>

                {/* Keyboard/touch fallback for reordering */}
                <span className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${item.name} up`}
                    className="text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary transition-colors leading-none"
                  >
                    <Icon name="keyboard_arrow_up" size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, index + 1)}
                    disabled={index === draft.items.length - 1}
                    aria-label={`Move ${item.name} down`}
                    className="text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary transition-colors leading-none"
                  >
                    <Icon name="keyboard_arrow_down" size={18} />
                  </button>
                </span>

                <span className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                  <Img
                    src={item.imageWide ?? item.image}
                    alt=""
                    icon={item.icon}
                    imgClassName="w-full h-full object-cover"
                  />
                </span>

                <div className="flex-1 min-w-0">
                  <h3 className="font-headline-md text-headline-md text-on-surface truncate">{item.name}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container-low text-secondary font-label-sm text-label-sm px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.uid)}
                  aria-label={`Remove ${item.name}`}
                  className="md:hidden text-outline hover:text-error transition-colors p-2 shrink-0"
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="flex items-center gap-sm w-full md:w-auto justify-between md:justify-end border-t border-surface-variant md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                <NumberField label="Sets" value={item.sets} onChange={(v) => updateItem(item.uid, { sets: v })} />
                <span className="text-secondary font-label-bold mt-5">×</span>
                <NumberField label="Reps" value={item.reps} onChange={(v) => updateItem(item.uid, { reps: v })} />
                <span className="text-secondary font-label-bold mt-5">@</span>
                <NumberField
                  label="Lbs"
                  value={item.weight}
                  onChange={(v) => updateItem(item.uid, { weight: v })}
                  width="w-20"
                  accent
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.uid)}
                  aria-label={`Remove ${item.name}`}
                  className="hidden md:flex text-outline hover:text-error transition-colors p-2 ml-2"
                >
                  <Icon name="close" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft.items.length > 0 ? (
        <p className="font-label-sm text-label-sm text-secondary mt-lg text-center">
          {draft.items.length} exercises •{' '}
          {draft.items.reduce((sum, item) => sum + (Number(item.sets) || 0), 0)} total sets
        </p>
      ) : null}

      {/* Sticky action bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-variant shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] z-40 p-margin-mobile md:py-lg">
        <div className="max-w-[800px] mx-auto flex gap-md">
          <button
            type="button"
            onClick={resetDraft}
            disabled={draft.items.length === 0}
            className="px-lg py-md rounded-xl border border-outline text-on-surface font-label-bold text-label-bold hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={draft.items.length === 0}
            className="flex-1 bg-primary-container text-on-primary py-md rounded-xl font-label-bold text-label-bold active:scale-[0.98] transition-transform shadow-md hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
          >
            <Icon name="play_arrow" size={20} filled />
            Start workout
          </button>
        </div>
      </div>
    </div>
  )
}
