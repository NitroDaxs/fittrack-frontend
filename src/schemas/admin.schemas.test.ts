import { describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { errorsOf, parse } from '../test/zod'
import type { ProgrammeDay, ProgrammeExercise } from '../types/routines'
import { ARTICLE_TITLE_MAX, adminArticleSchema } from './admin-article.schema'
import { adminExerciseSchema } from './admin-exercise.schema'
import { DAY_NAME_MAX, MAX_REPS_LENGTH, MAX_REST_SECONDS, MAX_SETS, adminRoutineSchema } from './admin-routine.schema'
import { adminUserSchema } from './admin-user.schema'

const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

describe('adminArticleSchema', () => {
  const base = { title: 'Title', body: 'Body', category: 'nutrition', status: 'Draft', imageUrl: '' }

  it('accepts a complete article', () => {
    expect(errorsOf(adminArticleSchema(true), base)).toBeNull()
  })

  it('requires a body for a new article only', () => {
    expect(errorsOf(adminArticleSchema(true), { ...base, body: '  ' })).toEqual({ body: t('admin.articles.writeTheArticleBody') })
    expect(parse(adminArticleSchema(false), { ...base, body: '  ' }).body).toBe('')
  })

  it('validates title, category, status and image URL', () => {
    expect(
      errorsOf(adminArticleSchema(true), {
        ...base,
        title: 'a'.repeat(ARTICLE_TITLE_MAX + 1),
        category: '',
        status: 'Archived',
        imageUrl: 'ftp://x',
      }),
    ).toMatchObject({
      title: t('validation.maxLength', { max: ARTICLE_TITLE_MAX }),
      category: t('validation.required'),
      imageUrl: t('validation.imageUrl'),
      status: expect.any(String),
    })
  })
})

describe('adminExerciseSchema', () => {
  const base = {
    name: 'Squat',
    description: 'Sit down, stand up',
    instructions: '',
    muscleGroups: ['Quads'],
    equipmentList: [],
    difficulty: 'Beginner',
    category: 'Strength',
    primaryMuscles: '',
    videoUrl: '',
    thumbnailUrl: '',
  }

  it('accepts a minimal exercise', () => {
    expect(errorsOf(adminExerciseSchema, base)).toBeNull()
  })

  it('reports each missing required field', () => {
    expect(
      errorsOf(adminExerciseSchema, { ...base, name: '', description: ' ', muscleGroups: [], difficulty: '', category: '' }),
    ).toEqual({
      name: t('common.nameIsRequired'),
      description: t('admin.exercises.giveItAOneLineDescription'),
      muscleGroups: t('admin.exercises.pickAtLeastOneMuscleGroup'),
      difficulty: t('validation.required'),
      category: t('validation.required'),
    })
  })

  it('validates the video and thumbnail URLs', () => {
    expect(errorsOf(adminExerciseSchema, { ...base, videoUrl: 'youtube', thumbnailUrl: 'img' })).toEqual({
      videoUrl: t('validation.imageUrl'),
      thumbnailUrl: t('validation.imageUrl'),
    })
  })
})

describe('adminUserSchema', () => {
  const base = { name: 'Ada', email: 'ada@example.com', role: 'Member', status: 'Active' }

  it('accepts a valid user', () => {
    expect(errorsOf(adminUserSchema, base)).toBeNull()
  })

  it('validates every field', () => {
    const errors = errorsOf(adminUserSchema, { name: '', email: 'x', role: 'Owner', status: 'Gone' })
    expect(errors).toMatchObject({
      name: t('common.nameIsRequired'),
      email: t('admin.users.enterAValidEmailAddress'),
    })
    expect(errors).toHaveProperty('role')
    expect(errors).toHaveProperty('status')
  })

  it('uses the admin-specific required-email message', () => {
    expect(errorsOf(adminUserSchema, { ...base, email: '' })).toEqual({ email: t('admin.users.enterAValidEmailAddress') })
  })
})

describe('adminRoutineSchema', () => {
  const entry = (overrides: Partial<ProgrammeExercise> = {}): ProgrammeExercise => ({
    exercise_id: 1,
    name: 'Squat',
    target_sets: 3,
    target_reps: '8-12',
    rest_seconds: 90,
    notes: '',
    ...overrides,
  })
  const day = (overrides: Partial<ProgrammeDay> = {}): ProgrammeDay => ({ name: 'Legs', exercises: [entry()], ...overrides })
  const base = {
    title: 'PPL',
    description: 'A split',
    goal: 'strength',
    level: 'beginner',
    daysPerWeek: '3',
    isPublic: true,
    imageUrl: '',
    days: [day()],
  }

  it('accepts a valid routine and converts daysPerWeek to a number', () => {
    expect(parse(adminRoutineSchema, base).daysPerWeek).toBe(3)
  })

  it('accepts an empty programme (metadata-only edit)', () => {
    expect(errorsOf(adminRoutineSchema, { ...base, days: [] })).toBeNull()
  })

  it('validates the metadata fields', () => {
    expect(
      errorsOf(adminRoutineSchema, { ...base, title: '', description: '', goal: '', level: '', daysPerWeek: '8' }),
    ).toEqual({
      title: t('common.titleIsRequired'),
      description: t('admin.routines.describeTheProgrammeInASentence'),
      goal: t('validation.required'),
      level: t('validation.required'),
      daysPerWeek: t('validation.wholeBetween', { min: 1, max: 7 }),
    })
  })

  it('reports a day with no exercises by name', () => {
    expect(errorsOf(adminRoutineSchema, { ...base, days: [day({ exercises: [] })] })).toEqual({
      days: t('admin.routines.hasNoExercises', { name: 'Legs' }),
    })
  })

  it('falls back to "Day N" for an unnamed day', () => {
    expect(errorsOf(adminRoutineSchema, { ...base, days: [day(), day({ name: '', exercises: [] })] })).toEqual({
      days: t('admin.routines.hasNoExercises', { name: t('common.day', { n: 2 }) }),
    })
  })

  it('reports an over-long day name, truncated to 30 characters', () => {
    const name = 'x'.repeat(DAY_NAME_MAX + 1)
    expect(errorsOf(adminRoutineSchema, { ...base, days: [day({ name })] })).toEqual({
      days: t('validation.dayNameTooLong', { name: name.slice(0, 30), max: DAY_NAME_MAX }),
    })
  })

  it.each([
    ['too many sets', { target_sets: MAX_SETS + 1 }],
    ['zero sets', { target_sets: 0 }],
    ['fractional sets', { target_sets: 2.5 }],
    ['long reps text', { target_reps: 'x'.repeat(MAX_REPS_LENGTH + 1) }],
    ['negative rest', { rest_seconds: -1 }],
    ['too much rest', { rest_seconds: MAX_REST_SECONDS + 1 }],
  ])('rejects an exercise with %s', (_label, overrides) => {
    expect(errorsOf(adminRoutineSchema, { ...base, days: [day({ exercises: [entry(overrides)] })] })).toEqual({
      days: t('validation.dayExercisesInvalid', { name: 'Legs' }),
    })
  })

  it('accepts null sets and rest (not specified)', () => {
    expect(
      errorsOf(adminRoutineSchema, { ...base, days: [day({ exercises: [entry({ target_sets: null, rest_seconds: null })] })] }),
    ).toBeNull()
  })

  it('accepts the boundary values', () => {
    expect(
      errorsOf(adminRoutineSchema, {
        ...base,
        days: [day({ exercises: [entry({ target_sets: MAX_SETS, rest_seconds: MAX_REST_SECONDS, target_reps: 'x'.repeat(MAX_REPS_LENGTH) })] })],
      }),
    ).toBeNull()
  })
})
