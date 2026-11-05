// src/store/unit.store.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import type {Units} from '../types/shared'

/**
 * The app-wide imperial/metric preference. Only the choice lives here: the
 * conversions are plain functions of it (`unitFormat` in utils/units), and
 * hooks/useUnits adds saving the choice to the account.
 *
 * Where the preference lives: `users.units` once signed in, mirrored into
 * localStorage. The mirror is what paints the first frame (no flash of the
 * wrong unit while /me is in flight) and what guests use, but the account
 * value wins on login (see AuthProvider) so the choice follows you between devices.
 */

interface UnitState {
    unit: Units
    /** Changes the preference on this device only; see useSetUnit for the account. */
    setUnit: (unit: Units) => void
}

export const UNIT_STORAGE_KEY = 'fittrack.units'
// Before this store, the choice was saved as a bare string under this key.
const LEGACY_UNIT_KEY = 'units'

const toUnit = (value: unknown): Units => (value === 'metric' ? 'metric' : 'imperial')

function readLegacyUnit(): Units {
    try {
        return toUnit(window.localStorage.getItem(LEGACY_UNIT_KEY))
    } catch {
        return 'imperial'
    }
}

export const useUnitStore = create<UnitState>()(
    persist(
        (set) => ({
            // Used only when nothing is saved under UNIT_STORAGE_KEY yet.
            unit: readLegacyUnit(),
            setUnit: (unit) => set({unit}),
        }),
        {
            name: UNIT_STORAGE_KEY,
            version: 1,
            partialize: (state) => ({unit: state.unit}),
            // Anything but 'metric' in storage means imperial, as before. Called with
            // nothing when nothing is saved yet: then the legacy value above stands.
            merge: (persisted, current) =>
                persisted ? {...current, unit: toUnit((persisted as Partial<UnitState>).unit)} : current,
        },
    ),
)
