import { describe, expect, it } from 'vitest'
import { BODY_REGIONS } from '../components/library/bodyMapRegions'
import i18n from '../i18n'
import { calculators } from './calculators'

describe('calculators list', () => {
  it('has unique slugs', () => {
    const slugs = calculators.map((calculator) => calculator.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('uses translation keys that exist', () => {
    for (const { name, description } of calculators) {
      expect(i18n.exists(name), name).toBe(true)
      expect(i18n.exists(description), description).toBe(true)
    }
  })
})

describe('body map regions', () => {
  it('has a front and a back, each with a path per region', () => {
    for (const side of ['front', 'back'] as const) {
      expect(BODY_REGIONS[side].length).toBeGreaterThan(0)
      for (const region of BODY_REGIONS[side]) expect(region.d).toMatch(/^M/)
    }
  })

  it('names muscles by slug', () => {
    const muscles = [...BODY_REGIONS.front, ...BODY_REGIONS.back].flatMap((region) => (region.muscle ? [region.muscle] : []))
    for (const muscle of muscles) expect(muscle).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })
})
