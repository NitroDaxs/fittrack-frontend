import { describe, expect, it } from 'vitest'
import { CM_PER_IN, KG_PER_LB, cmToIn, inToCm, kgToLbs, lbsToKg } from './units'

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
