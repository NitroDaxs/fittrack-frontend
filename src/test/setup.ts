import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import i18n from '../i18n'
import { useWorkoutStore } from '../store/workout.store'

// Every test runs in English so assertions can use i18n.t() or literal copy alike.
beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  // The workout store lives for the whole test file, so start every test from a clean one.
  useWorkoutStore.getState().reset()
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// jsdom does not implement scrolling; Pagination and the chat panel call it.
window.scrollTo = (() => {}) as typeof window.scrollTo
Element.prototype.scrollTo = (() => {}) as typeof Element.prototype.scrollTo
