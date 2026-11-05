import { describe, expect, it, vi } from 'vitest'
import { UNIT_STORAGE_KEY, useUnitStore } from './unit.store'

// A fresh copy of the module builds a new store from localStorage, like a page load.
const load = async () => {
  vi.resetModules()
  return (await import('./unit.store')).useUnitStore.getState().unit
}

describe('unit store', () => {
  it('defaults to imperial', async () => {
    expect(await load()).toBe('imperial')
  })

  it('saves the choice and restores it on the next load', async () => {
    useUnitStore.getState().setUnit('metric')
    expect(JSON.parse(localStorage.getItem(UNIT_STORAGE_KEY)!)).toEqual({ state: { unit: 'metric' }, version: 1 })
    expect(await load()).toBe('metric')
  })

  it('picks up a choice saved under the old key', async () => {
    localStorage.setItem('units', 'metric')
    expect(await load()).toBe('metric')
  })

  it('prefers the current key over the old one', async () => {
    localStorage.setItem('units', 'metric')
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify({ state: { unit: 'imperial' }, version: 1 }))
    expect(await load()).toBe('imperial')
  })

  it('ignores junk in storage', async () => {
    localStorage.setItem('units', 'furlongs')
    expect(await load()).toBe('imperial')
    localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify({ state: { unit: 'furlongs' }, version: 1 }))
    expect(await load()).toBe('imperial')
  })
})
