import { describe, expect, it } from 'vitest'
import { CM_PER_IN, KG_PER_LB, cmToIn, inToCm, kgToLbs, lbsToKg, unitFormat } from './units'

describe('unit conversions', () => {
  it('converts pounds and kilograms', () => {
    expect(lbsToKg(1)).toBe(KG_PER_LB)
    expect(lbsToKg(100)).toBeCloseTo(45.3592)
    expect(kgToLbs(KG_PER_LB)).toBe(1)
    expect(kgToLbs(100)).toBeCloseTo(220.462, 3)
  })

  it('converts inches and centimetres', () => {
    expect(inToCm(1)).toBe(CM_PER_IN)
    expect(inToCm(10)).toBeCloseTo(25.4)
    expect(cmToIn(254)).toBeCloseTo(100)
  })

  it.each([0, 1, 72.5, 999])('round-trips %d', (value) => {
    expect(kgToLbs(lbsToKg(value))).toBeCloseTo(value, 10)
    expect(cmToIn(inToCm(value))).toBeCloseTo(value, 10)
  })
})

describe('unitFormat', () => {
  it('imperial shows stored values as they are (rounded to 0.1)', () => {
    const f = unitFormat('imperial')
    expect(f).toMatchObject({ unit: 'imperial', isMetric: false, weightLabel: 'lbs', lengthLabel: 'in' })
    expect(f.showWeight(180.04)).toBe(180)
    expect(f.showLength('32.56')).toBe(32.6)
    expect(f.toStoredWeight('200')).toBe(200)
    expect(f.toStoredLength(30)).toBe(30)
    expect(f.formatWeight(180)).toBe('180 lbs')
    expect(f.formatLength(32)).toBe('32 in')
  })

  it('metric converts on the way in and out', () => {
    const f = unitFormat('metric')
    expect(f).toMatchObject({ unit: 'metric', isMetric: true, weightLabel: 'kg', lengthLabel: 'cm' })
    expect(f.showWeight(185)).toBe(83.9)
    expect(f.showLength(10)).toBe(25.4)
    expect(f.toStoredWeight(100)).toBe(220.5)
    expect(f.toStoredLength(254)).toBe(100)
    expect(f.formatWeight(185)).toBe('83.9 kg')
    expect(f.formatLength(10)).toBe('25.4 cm')
  })

  it.each([null, undefined, ''])('treats %j as missing', (value) => {
    const f = unitFormat('metric')
    expect(f.showWeight(value)).toBeNull()
    expect(f.showLength(value)).toBeNull()
    expect(f.toStoredWeight(value)).toBeNull()
    expect(f.toStoredLength(value)).toBeNull()
    expect(f.formatWeight(value)).toBe('—')
    expect(f.formatLength(value)).toBe('—')
  })

  it('keeps zero as a real value', () => {
    expect(unitFormat('imperial').formatWeight(0)).toBe('0 lbs')
  })
})
