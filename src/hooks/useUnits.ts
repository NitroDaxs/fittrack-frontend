import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUnitStore } from '../store/unit.store'
import type { Units } from '../types/shared'
import { unitFormat } from '../utils/units'
import { useUpdateProfile } from './useMe'

/** Labels and conversions for the current unit. Components that only need `unit` can select it from useUnitStore. */
export function useUnitFormat() {
  const unit = useUnitStore((state) => state.unit)
  return useMemo(() => unitFormat(unit), [unit])
}

/**
 * Changes the unit, and saves it to the account when signed in. The UI does not
 * wait on the save: the choice has already changed locally, and a failed write
 * just means this device keeps it.
 */
export function useSetUnit() {
  const { isAuthenticated } = useAuth()
  const { mutate: updateProfile } = useUpdateProfile()
  const setUnit = useUnitStore((state) => state.setUnit)

  return useCallback(
    (unit: Units) => {
      setUnit(unit)
      if (isAuthenticated) updateProfile({ units: unit })
    },
    [isAuthenticated, updateProfile, setUnit],
  )
}
