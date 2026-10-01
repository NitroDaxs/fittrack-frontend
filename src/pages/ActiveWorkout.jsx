import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useWorkoutDraft } from '../context/WorkoutContext'
import { meApi } from '../api/resources'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'

const REST_SECONDS = 90

function Stepper({ label, value, step, onAdjust, onSet }) {
  const [pulse, setPulse] = useState(false)

  const adjust = (delta) => {
    onAdjust(delta)
    setPulse(true)
    setTimeout(() => setPulse(false), 150)
  }

  return (
    <div className="bg-surface-container-lowest p-md rounded-xl elev-card border border-surface-variant flex flex-col items-center">
      <span className="font-label-bold text-label-bold text-secondary mb-md uppercase tracking-widest">{label}</span>
      <div className="flex items-center justify-between w-full max-w-xs">
        <button
          type="button"
          onClick={() => adjust(-step)}
          aria-label={`Decrease ${label} by ${step}`}
          className="w-16 h-16 rounded-full bg-surface-container-low text-secondary flex items-center justify-center active:bg-surface-container-high active:scale-95 transition-all shadow-sm border border-surface-variant"
        >
          <Icon name="remove" size={32} />
        </button>

        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onSet(event.target.value)}
          aria-label={label}
          className={`font-display-stat text-display-stat bg-transparent w-32 text-center outline-none transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            pulse ? 'scale-110 text-primary-container' : 'scale-100 text-on-background'
          }`}
        />

        <button
          type="button"
          onClick={() => adjust(step)}
          aria-label={`Increase ${label} by ${step}`}
          className="w-16 h-16 rounded-full bg-surface-container-low text-secondary flex items-center justify-center active:bg-surface-container-high active:scale-95 transition-all shadow-sm border border-surface-variant"
        >
          <Icon name="add" size={32} />
        </button>
      </div>
    </div>
  )
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const { session, adjustCurrent, setCurrentValue, completeSet, goToExercise, endSession } = useWorkoutDraft()

  const [restRemaining, setRestRemaining] = useState(0)
  const [restRunning, setRestRunning] = useState(false)
  const intervalRef = useRef(null)

  // Rest countdown. Ticks only while running, and clears itself at zero.
  useEffect(() => {
    if (!restRunning) return undefined
    intervalRef.current = setInterval(() => {
      setRestRemaining((remaining) => {
        if (remaining <= 1) {
          setRestRunning(false)
          return 0
        }
        return remaining - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [restRunning])

  const startRest = useCallback((seconds = REST_SECONDS) => {
    setRestRemaining(seconds)
    setRestRunning(true)
  }, [])

  if (!session) return <Navigate to="/builder" replace />

  const current = session.exercises[session.exerciseIndex]
  const setNumber = current.logged.length + 1
  const totalSets = session.exercises.reduce((sum, e) => sum + e.targetSets, 0)
  const doneSets = session.exercises.reduce((sum, e) => sum + e.logged.length, 0)
  const progress = totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  const previousSet = current.logged[current.logged.length - 1]

  const handleComplete = () => {
    const outcome = completeSet()
    if (outcome.type === 'finished') {
      setRestRunning(false)
      setRestRemaining(0)
    } else {
      startRest()
    }
  }

  const finishWorkout = async () => {
    const payload = {
      name: session.name,
      minutes: Math.max(1, Math.round((Date.now() - session.startedAt) / 60000)),
      tags: ['Logged'],
      entries: session.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId, sets: exercise.logged })),
    }
    try {
      await meApi.logWorkout(payload)
    } catch {
      /* demo: a failed save should not trap the user in the logger */
    }
    endSession()
    navigate('/history')
  }

  const quit = () => {
    endSession()
    navigate('/builder')
  }

  const mmss = `${String(Math.floor(restRemaining / 60)).padStart(2, '0')}:${String(restRemaining % 60).padStart(2, '0')}`

  // --- summary --------------------------------------------------------------
  if (session.finished) {
    const volume = session.exercises.reduce(
      (sum, exercise) => sum + exercise.logged.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    )
    return (
      <div className="max-w-md mx-auto px-margin-mobile py-xl text-center">
        <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-lg">
          <Icon name="check_circle" size={40} filled />
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-sm">Workout complete</h1>
        <p className="font-body-md text-body-md text-secondary mb-xl">{session.name}</p>

        <div className="grid grid-cols-3 gap-md mb-xl">
          <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant elev-card">
            <span className="block font-headline-lg text-headline-lg text-on-surface">{doneSets}</span>
            <span className="font-label-sm text-label-sm text-secondary uppercase">Sets</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant elev-card">
            <span className="block font-headline-lg text-headline-lg text-on-surface">{session.exercises.length}</span>
            <span className="font-label-sm text-label-sm text-secondary uppercase">Exercises</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant elev-card">
            <span className="block font-headline-lg text-headline-lg text-on-surface">
              {volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume}
            </span>
            <span className="font-label-sm text-label-sm text-secondary uppercase">Volume</span>
          </div>
        </div>

        <ul className="text-left space-y-sm mb-xl">
          {session.exercises.map((exercise) => (
            <li
              key={exercise.uid}
              className="bg-surface-container-lowest rounded-lg p-md border border-surface-variant flex justify-between items-center"
            >
              <span className="font-label-bold text-label-bold text-on-surface">{exercise.name}</span>
              <span className="font-label-sm text-label-sm text-secondary">
                {exercise.logged.map((set) => `${set.weight}×${set.reps}`).join(' · ') || '—'}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={finishWorkout}
          className="w-full bg-primary-container text-on-primary font-label-bold text-label-bold py-md rounded-xl hover:bg-primary transition-colors active:scale-[0.98]"
        >
          Save to history
        </button>
      </div>
    )
  }

  // --- logger ---------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface sticky top-20 w-full z-30 shadow-sm">
        <div className="flex justify-between items-center px-gutter py-sm w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={quit}
            aria-label="Quit workout"
            className="text-secondary hover:bg-surface-container-high transition-colors p-sm rounded-full active:scale-95"
          >
            <Icon name="close" />
          </button>
          <span className="font-label-bold text-label-bold text-primary">
            Exercise {session.exerciseIndex + 1} of {session.exercises.length}
          </span>
          <span className="font-label-sm text-label-sm text-secondary">
            Set {Math.min(setNumber, current.targetSets)}/{current.targetSets}
          </span>
        </div>
        <div className="w-full bg-surface-container-high h-2">
          <div className="bg-primary h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="flex-grow px-margin-mobile pt-lg pb-56 max-w-md mx-auto w-full flex flex-col items-center">
        <div className="text-center w-full mb-xl">
          <div className="w-full h-48 bg-surface-container rounded-xl mb-md overflow-hidden elev-card border border-surface-variant">
            <Img src={current.image} alt={current.name} icon={current.icon} imgClassName="w-full h-full object-cover" />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-sm">{current.name}</h1>
          <div className="flex justify-center gap-sm flex-wrap">
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-container-high text-secondary px-md py-xs rounded-full font-label-sm text-label-sm border border-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full space-y-lg mb-lg">
          <Stepper
            label="Weight (lbs)"
            value={current.weight}
            step={5}
            onAdjust={(delta) => adjustCurrent('weight', delta)}
            onSet={(value) => setCurrentValue('weight', value)}
          />
          <Stepper
            label="Reps"
            value={current.reps}
            step={1}
            onAdjust={(delta) => adjustCurrent('reps', delta)}
            onSet={(value) => setCurrentValue('reps', value)}
          />
        </div>

        <div className="w-full bg-surface-container-low p-sm rounded-lg flex justify-between items-center mb-lg">
          <span className="font-label-sm text-label-sm text-secondary">Previous Set:</span>
          <span className="font-body-md text-body-md text-on-surface-variant font-medium">
            {previousSet ? `${previousSet.weight} lbs x ${previousSet.reps} reps` : 'First set of this exercise'}
          </span>
        </div>

        {/* Set checklist for the current exercise */}
        <div className="w-full flex gap-xs mb-lg">
          {Array.from({ length: current.targetSets }, (_, i) => (
            <span
              key={i}
              title={`Set ${i + 1}`}
              className={`flex-1 h-2 rounded-full ${
                i < current.logged.length ? 'bg-primary' : i === current.logged.length ? 'bg-primary-fixed-dim' : 'bg-surface-variant'
              }`}
            />
          ))}
        </div>

        <ul className="w-full space-y-xs">
          {session.exercises.map((exercise, index) => (
            <li key={exercise.uid}>
              <button
                type="button"
                onClick={() => goToExercise(index)}
                className={`w-full flex items-center gap-sm px-sm py-xs rounded-lg text-left transition-colors ${
                  index === session.exerciseIndex ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'text-secondary hover:bg-surface-container'
                }`}
              >
                <Icon
                  name={exercise.logged.length >= exercise.targetSets ? 'check_circle' : 'radio_button_unchecked'}
                  size={18}
                  filled={exercise.logged.length >= exercise.targetSets}
                />
                <span className="font-label-sm text-label-sm flex-1 truncate">{exercise.name}</span>
                <span className="font-label-sm text-label-sm">
                  {exercise.logged.length}/{exercise.targetSets}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Pinned action area */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full p-margin-mobile pb-lg bg-surface/95 backdrop-blur-md border-t border-surface-variant z-40 flex flex-col items-center gap-sm">
        <div className="flex items-center gap-sm">
          <div
            className={`px-lg py-sm rounded-full flex items-center gap-sm shadow-lg transition-colors ${
              restRunning ? 'bg-primary-container text-on-primary' : 'bg-inverse-surface text-inverse-on-surface'
            }`}
          >
            <Icon name="timer" size={20} className={restRunning ? '' : 'text-inverse-primary'} />
            <span className="font-label-bold text-label-bold tracking-widest tabular-nums">{mmss}</span>
          </div>

          {restRunning ? (
            <>
              <button
                type="button"
                onClick={() => setRestRunning(false)}
                className="font-label-bold text-label-bold text-secondary hover:text-on-surface px-sm py-xs rounded-full transition-colors"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestRunning(false)
                  setRestRemaining(0)
                }}
                className="font-label-bold text-label-bold text-primary hover:text-primary-container px-sm py-xs rounded-full transition-colors"
              >
                Skip
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => startRest(restRemaining || REST_SECONDS)}
              className="font-label-bold text-label-bold text-primary hover:text-primary-container px-sm py-xs rounded-full transition-colors"
            >
              {restRemaining ? 'Resume' : 'Start rest'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className="w-full max-w-md bg-primary-container text-on-primary font-headline-md text-headline-md py-md rounded-xl shadow-lg active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-sm hover:bg-primary"
        >
          <Icon name="check_circle" filled />
          Complete Set
        </button>
      </div>
    </div>
  )
}
