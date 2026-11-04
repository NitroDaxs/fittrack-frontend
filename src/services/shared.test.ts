import { describe, expect, it } from 'vitest'
import { paged } from '../test/fixtures'
import { capitalize, splitList, titleCase, toPage, toSlug, toSnake } from './shared'

describe('string helpers', () => {
  it('capitalize upper-cases the first letter only', () => {
    expect(capitalize('beginner')).toBe('Beginner')
    expect(capitalize('mIXED')).toBe('MIXED')
    expect(capitalize('')).toBe('')
  })

  it('titleCase turns snake_case into words', () => {
    expect(titleCase('training_theory')).toBe('Training Theory')
    expect(titleCase('strength')).toBe('Strength')
  })

  it('toSlug trims, lower-cases and hyphenates whitespace runs', () => {
    expect(toSlug('  Upper   Back ')).toBe('upper-back')
    expect(toSlug('Admin')).toBe('admin')
  })

  it('toSnake trims, lower-cases and underscores whitespace runs', () => {
    expect(toSnake(' Olympic  Weightlifting ')).toBe('olympic_weightlifting')
  })

  it('splitList splits on commas and drops blanks', () => {
    expect(splitList('Barbell, Bench ,, ')).toEqual(['Barbell', 'Bench'])
    expect(splitList('')).toEqual([])
  })
})

describe('toPage', () => {
  it('maps the rows and renames the paging fields', () => {
    const page = toPage(paged([1, 2], { current_page: 2, per_page: 10, total: 12, last_page: 2 }), (n) => n * 10)
    expect(page).toEqual({ data: [10, 20], meta: { total: 12, page: 2, perPage: 10, lastPage: 2 } })
  })
})
