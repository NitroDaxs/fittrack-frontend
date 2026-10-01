import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cmToIn, inToCm, kgToLbs, lbsToKg } from '../utils/units'
import { meApi } from '../api/resources'
import { useAuth } from './AuthContext'

/**
 * App-wide imperial/metric preference.
 *
 * Measurement data itself is always imperial -- the API stores weights in lbs
 * and tape measurements in inches, and nothing here changes that. The
 * preference is purely a display layer: values go through `showWeight` /
 * `showLength` on the way to the screen, and anything typed by the user goes
 * back through `toStoredWeight` / `toStoredLength` before being submitted.
 *
 * Keeping the conversion at the edges (render and submit) rather than in state
 * means a unit switch never has to migrate data that is already in memory.
 *
 * Where the preference lives: `users.units` once signed in, mirrored into
 * localStorage. The mirror is what paints the first frame (no flash of the
 * wrong unit while /me is in flight) and what guests use, but the account
 * value wins on login so the choice follows you between devices.
 */

const UnitContext = createContext(null)

const STORAGE_KEY = 'units'

function readStoredUnit() {
  if (typeof window === 'undefined') return 'imperial'
  return window.localStorage.getItem(STORAGE_KEY) === 'metric' ? 'metric' : 'imperial'
}

/** Trims the noise off converted values: 83.91452 -> 83.9, 84.0 -> 84. */
function round1(value) {
  if (value == null || Number.isNaN(Number(value))) return value
  return Number(Number(value).toFixed(1))
}

export function UnitProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [unit, setUnitState] = useState(readStoredUnit)

  const isMetric = unit === 'metric'

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, unit)
  }, [unit])

  // Adopt the account's saved preference on sign-in. A guest who picked metric
  // and then logs into an imperial account gets the account's answer.
  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    meApi
      .profile()
      .then((profile) => {
        if (!cancelled && (profile?.units === 'metric' || profile?.units === 'imperial')) {
          setUnitState(profile.units)
        }
      })
      .catch(() => {
        // Offline or an old token -- the localStorage mirror stays in charge.
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const setUnit = useCallback(
    (next) => {
      const value = next === 'metric' ? 'metric' : 'imperial'
      setUnitState(value)

      // Persist to the account, but don't make the UI wait on it -- the toggle
      // has already flipped locally and a failed write just means this device
      // keeps the choice.
      if (isAuthenticated) {
        meApi.updateProfile({ units: value }).catch(() => {})
      }
    },
    [isAuthenticated]
  )

  const value = useMemo(() => {
    // Stored (lbs / in) -> displayed
    const showWeight = (lbs) => (lbs == null || lbs === '' ? null : round1(isMetric ? lbsToKg(Number(lbs)) : Number(lbs)))
    const showLength = (inches) =>
      inches == null || inches === '' ? null : round1(isMetric ? inToCm(Number(inches)) : Number(inches))

    // Displayed -> stored (lbs / in)
    const toStoredWeight = (shown) =>
      shown == null || shown === '' ? null : round1(isMetric ? kgToLbs(Number(shown)) : Number(shown))
    const toStoredLength = (shown) =>
      shown == null || shown === '' ? null : round1(isMetric ? cmToIn(Number(shown)) : Number(shown))

    const weightLabel = isMetric ? 'kg' : 'lbs'
    const lengthLabel = isMetric ? 'cm' : 'in'

    return {
      unit,
      setUnit,
      isMetric,
      weightLabel,
      lengthLabel,
      showWeight,
      showLength,
      toStoredWeight,
      toStoredLength,
      /** "83.9 kg" -- em dash when the value is missing, so callers don't each invent a placeholder. */
      formatWeight: (lbs) => {
        const shown = showWeight(lbs)
        return shown == null ? '—' : `${shown} ${weightLabel}`
      },
      formatLength: (inches) => {
        const shown = showLength(inches)
        return shown == null ? '—' : `${shown} ${lengthLabel}`
      },
    }
  }, [unit, setUnit, isMetric])

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

export function useUnits() {
  const context = useContext(UnitContext)
  if (!context) {
    throw new Error('useUnits must be used within a UnitProvider')
  }
  return context
}
