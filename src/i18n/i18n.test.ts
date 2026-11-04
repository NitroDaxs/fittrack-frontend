import { afterEach, describe, expect, it } from 'vitest'
import i18n, { LANGUAGES, tLabel } from './index'
import bg from './locales/bg.json'
import en from './locales/en.json'

const flatKeys = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === 'object' ? flatKeys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  )

afterEach(async () => {
  await i18n.changeLanguage('en')
})

describe('locales', () => {
  it('Bulgarian translates every English key', () => {
    const bgKeys = new Set(flatKeys(bg))
    expect(flatKeys(en).filter((key) => !bgKeys.has(key))).toEqual([])
  })

  it('every supported language has a resource bundle', () => {
    for (const { code } of LANGUAGES) expect(i18n.hasResourceBundle(code, 'translation')).toBe(true)
  })
})

describe('language sync', () => {
  it('sets <html lang> when the language changes', async () => {
    await i18n.changeLanguage('bg')
    expect(document.documentElement.lang).toBe('bg')
    await i18n.changeLanguage('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('remembers the choice in localStorage', async () => {
    await i18n.changeLanguage('bg')
    expect(localStorage.getItem('fittrack.language')).toBe('bg')
  })
})

describe('tLabel', () => {
  it('shows API values as they are in English when there is no label translation', () => {
    expect(tLabel('Chest')).toBe('Chest')
    expect(tLabel('Chest, Back')).toBe('Chest, Back')
  })

  it('translates each item of a comma-separated list', async () => {
    await i18n.changeLanguage('bg')
    expect(tLabel('Chest')).toBe(i18n.t('labels.Chest'))
    expect(tLabel('Chest, Back')).toBe(`${i18n.t('labels.Chest')}, ${i18n.t('labels.Back')}`)
    expect(tLabel('Chest')).not.toBe('Chest')
  })

  it('falls back to the value for unknown labels', async () => {
    await i18n.changeLanguage('bg')
    expect(tLabel('Brand New Muscle')).toBe('Brand New Muscle')
  })
})
