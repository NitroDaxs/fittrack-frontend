import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import i18n from '../i18n'
import { useUnitStore } from '../store/unit.store'
import { useWorkoutStore } from '../store/workout.store'

// Every test runs in English so assertions can use i18n.t() or literal copy alike.
beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  // The stores live for the whole test file, so start every test from clean ones.
  useWorkoutStore.getState().reset()
  useUnitStore.setState({ unit: 'imperial' })
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// jsdom does not implement scrolling; Pagination and the chat panel call it.
window.scrollTo = (() => {}) as typeof window.scrollTo
Element.prototype.scrollTo = (() => {}) as typeof Element.prototype.scrollTo
