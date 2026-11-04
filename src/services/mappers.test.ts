import { describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { articleDto, exerciseDto, routineDto, userDto, workoutDto, workoutExerciseDto, workoutLogDto } from '../test/fixtures'
import type { DashboardDto } from '../types/me'
import { toAdminUser, toUserRequest } from './admin'
import { toArticle, toArticleRequest } from './articles'
import { toExercise, toExerciseForm, toExerciseRequest } from './exercises'
import { toDashboard, toMeasurement, toMeasurementRequest, toProfile, toSaved, toWorkout, toWorkoutRequest } from './me'
import { toProgramme, toRoutine, toRoutineRequest } from './routines'
import { toTaxonomies } from './taxonomies'

describe('toExercise', () => {
  it('maps the API record for display', () => {
    const exercise = toExercise(exerciseDto())
    expect(exercise).toMatchObject({
      id: 10,
      name: 'Bench Press',
      slug: 'bench-press',
      description: 'Press the bar.',
      difficulty: 'Intermediate',
      category: 'Strength',
      muscleGroups: ['Chest', 'Triceps'],
      primaryMuscles: 'Chest',
      equipment: 'Barbell, Bench',
      icon: 'dumbbell',
      videoId: null,
      videoUrl: '',
      image: 'https://img.example.com/bench.jpg',
      imageWide: 'https://img.example.com/bench.jpg',
    })
  })

  it('turns numbered instructions into steps', () => {
    expect(toExercise(exerciseDto({ instructions: '1. Lie down\n\n2.   Press up \n' })).steps).toEqual([
      { title: i18n.t('exerciseDetail.step', { n: 1 }), body: 'Lie down' },
      { title: i18n.t('exerciseDetail.step', { n: 2 }), body: 'Press up' },
    ])
    expect(toExercise(exerciseDto({ instructions: null })).steps).toEqual([])
  })

  it('fills blanks for missing optional fields', () => {
    const exercise = toExercise(exerciseDto({ description: null, instructions: null, thumbnail_url: null }))
    expect(exercise.description).toBe('')
    expect(exercise.instructions).toBe('')
    expect(exercise.image).toBe('')
    expect(exercise.thumbnailUrl).toBe('')
  })

  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://youtube.com/shorts/dQw4w9WgXcQ',
  ])('extracts the YouTube id from %s', (url) => {
    const exercise = toExercise(exerciseDto({ video_url: url }))
    expect(exercise.videoId).toBe('dQw4w9WgXcQ')
    expect(exercise.imageWide).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg')
  })

  it('falls back to a video in the media list', () => {
    const exercise = toExercise(
      exerciseDto({
        video_url: 'https://vimeo.com/123',
        media: [
          { id: 1, type: 'image', url: 'https://youtu.be/AAAAAAAAAAA', sort_order: 0 },
          { id: 2, type: 'video', url: 'https://youtu.be/BBBBBBBBBBB', sort_order: 1 },
        ],
      }),
    )
    expect(exercise.videoId).toBe('BBBBBBBBBBB')
  })

  it('picks the icon of the most characteristic equipment', () => {
    const withEquipment = (...names: string[]) =>
      toExercise(exerciseDto({ equipment: names.map((name, id) => ({ id, name, slug: name.toLowerCase() })) })).icon
    expect(withEquipment('Bench', 'Cable Machine')).toBe('cable')
    expect(withEquipment('Mat', 'Kettlebell')).toBe('weight')
    expect(withEquipment('Bodyweight')).toBe('person-standing')
    expect(withEquipment('Unknown Gizmo')).toBe('dumbbell')
    expect(withEquipment()).toBe('dumbbell')
  })

  it('uses the first muscle group when none is marked primary', () => {
    const exercise = toExercise(
      exerciseDto({ muscle_groups: [{ id: 1, name: 'Back', slug: 'back', pivot: { role: 'secondary' } }] }),
    )
    expect(exercise.primaryMuscles).toBe('Back')
    expect(toExercise(exerciseDto({ muscle_groups: [] })).primaryMuscles).toBe('')
  })
})

describe('exercise form <-> request', () => {
  it('toExerciseForm splits the equipment list', () => {
    const form = toExerciseForm(toExercise(exerciseDto({ video_url: 'https://youtu.be/dQw4w9WgXcQ' })))
    expect(form).toEqual({
      name: 'Bench Press',
      description: 'Press the bar.',
      instructions: '1. Lie down\n2. Press up',
      muscleGroups: ['Chest', 'Triceps'],
      equipmentList: ['Barbell', 'Bench'],
      difficulty: 'Intermediate',
      category: 'Strength',
      primaryMuscles: 'Chest',
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.example.com/bench.jpg',
    })
  })

  const form = {
    name: 'Clean',
    description: 'Lift',
    instructions: '',
    muscleGroups: ['Upper Back', 'Glutes'],
    equipmentList: ['EZ Bar'],
    difficulty: 'Advanced',
    category: 'Olympic Weightlifting',
    primaryMuscles: 'Glutes',
    videoUrl: '',
    thumbnailUrl: '',
  }

  it('toExerciseRequest slugs the values and leaves out blank URLs', () => {
    expect(toExerciseRequest(form)).toEqual({
      name: 'Clean',
      description: 'Lift',
      instructions: '',
      difficulty: 'advanced',
      exercise_type: 'olympic_weightlifting',
      muscle_groups: ['upper-back', 'glutes'],
      primary_muscles: ['glutes'],
      equipment: ['ez-bar'],
    })
  })

  it('makes the first muscle group primary when none is named', () => {
    expect(toExerciseRequest({ ...form, primaryMuscles: ' ' }).primary_muscles).toEqual(['upper-back'])
  })

  it('includes URLs when given', () => {
    expect(toExerciseRequest({ ...form, videoUrl: 'https://v', thumbnailUrl: 'https://t' })).toMatchObject({
      video_url: 'https://v',
      thumbnail_url: 'https://t',
    })
  })
})

describe('routines', () => {
  it('toRoutine maps the summary and defaults', () => {
    expect(toRoutine(routineDto())).toEqual({
      id: 5,
      title: 'Push Pull Legs',
      slug: 'push-pull-legs',
      description: 'Classic split.',
      goal: 'General Fitness',
      level: 'Beginner',
      daysPerWeek: 3,
      isPublic: true,
      icon: 'calendar-days',
      image: '',
      days: [],
    })
    expect(toRoutine(routineDto({ description: null })).description).toBe('')
  })

  it('toRoutine maps days and sorts their exercises by order', () => {
    const routine = toRoutine(
      routineDto({
        workouts: [
          workoutDto({
            day_order: 2,
            workout_exercises: [
              workoutExerciseDto({ id: 2, exercise_id: 22, order: 2, exercise: exerciseDto({ id: 22, name: 'Dips' }), notes: 'slow' }),
              workoutExerciseDto({ id: 1, exercise_id: 11, order: 1, exercise: exerciseDto({ id: 11, name: 'Press' }) }),
            ],
          }),
        ],
      }),
    )
    expect(routine.days).toHaveLength(1)
    const [day] = routine.days
    expect(day).toMatchObject({ id: 50, name: 'Day 2', focus: 'Push' })
    expect(day.exercises.map((entry) => entry.exercise.name)).toEqual(['Press', 'Dips'])
    expect(day.exercises[1]).toMatchObject({ exerciseId: 22, note: 'slow', sets: 3, reps: '8-12' })
  })

  it('toProgramme gives the builder shape with blanks for nulls', () => {
    expect(
      toProgramme(routineDto({ workouts: [workoutDto({ workout_exercises: [workoutExerciseDto({ target_reps: null, notes: null, target_weight: 50 })] })] })),
    ).toEqual([
      {
        name: 'Push',
        exercises: [
          { exercise_id: 10, name: 'Bench Press', target_sets: 3, target_reps: '', target_weight: 50, rest_seconds: 90, notes: '' },
        ],
      },
    ])
    expect(toProgramme(routineDto())).toEqual([])
  })

  const form = {
    title: 'PPL',
    description: 'Split',
    goal: 'Fat Loss',
    level: 'Intermediate',
    daysPerWeek: 4,
    isPublic: false,
    imageUrl: '  https://img  ',
    days: [],
  }

  it('toRoutineRequest leaves out days on a metadata-only edit', () => {
    expect(toRoutineRequest(form)).toEqual({
      title: 'PPL',
      description: 'Split',
      goal: 'fat_loss',
      level: 'intermediate',
      days_per_week: 4,
      is_public: false,
      image_url: 'https://img',
    })
  })

  it('toRoutineRequest sends the programme with blanks as null', () => {
    const request = toRoutineRequest({
      ...form,
      days: [
        {
          name: 'A',
          exercises: [{ exercise_id: 1, name: 'Squat', target_sets: 3, target_reps: '', rest_seconds: null, notes: '' }],
        },
      ],
    })
    expect(request.days).toEqual([
      {
        name: 'A',
        exercises: [{ exercise_id: 1, target_sets: 3, target_reps: null, target_weight: null, rest_seconds: null, notes: null }],
      },
    ])
  })
})

describe('articles', () => {
  it('toArticle maps labels and recursively maps related articles', () => {
    const article = toArticle(articleDto({ related: [articleDto({ id: 8, category: 'recovery' })] }))
    expect(article).toMatchObject({ category: 'Training Theory', status: 'Published', body: [] })
    expect(article.related[0]).toMatchObject({ id: 8, category: 'Recovery', related: [] })
  })

  const form = { title: 'T', body: '  Text  ', category: 'Training Theory', status: 'Draft' as const, imageUrl: ' https://x ' }

  it('toArticleRequest slugs and trims', () => {
    expect(toArticleRequest(form)).toEqual({
      title: 'T',
      category: 'training_theory',
      status: 'draft',
      body: 'Text',
      image_url: 'https://x',
    })
  })

  it('leaves out a blank body so an edit keeps the current content', () => {
    expect(toArticleRequest({ ...form, body: '   ' })).not.toHaveProperty('body')
  })
})

describe('admin users', () => {
  it('toAdminUser maps role, status and join date', () => {
    expect(toAdminUser(userDto({ role: 'admin', is_active: false }))).toEqual({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'Admin',
      status: 'Suspended',
      joined: '2024-03-15',
    })
  })

  it('toUserRequest maps back to the wire format', () => {
    expect(toUserRequest({ name: 'A', email: 'a@b.co', role: 'Member', status: 'Active' })).toEqual({
      name: 'A',
      email: 'a@b.co',
      role: 'member',
      is_active: true,
    })
    expect(toUserRequest({ name: 'A', email: 'a@b.co', role: 'Admin', status: 'Suspended' }).is_active).toBe(false)
  })
})

describe('me', () => {
  it('toProfile derives the plan, join month and avatar URL', () => {
    const profile = toProfile(userDto({ role: 'admin', avatar_url: '/uploads/a.png' }))
    expect(profile).toMatchObject({ id: 1, role: 'admin', plan: 'Admin', units: 'imperial' })
    expect(profile.joined).toBe(new Date('2024-03-15T10:00:00Z').toLocaleDateString('en', { month: 'long', year: 'numeric' }))
    expect(profile.avatarUrl).toMatch(/\/uploads\/a\.png$/)
    expect(toProfile(userDto()).plan).toBe('Member')
    expect(toProfile(userDto()).avatarUrl).toBeNull()
  })

  it('toWorkout groups set rows by exercise in first-seen order', () => {
    const squat = exerciseDto({ id: 2, name: 'Squat' })
    const bench = exerciseDto({ id: 1, name: 'Bench' })
    const set = (exercise: typeof squat, weight: number, reps: number, id: number) => ({
      id,
      exercise_id: exercise.id,
      set_number: id,
      weight,
      reps,
      is_completed: true,
      exercise,
    })
    const workout = toWorkout(
      workoutLogDto({ set_logs: [set(squat, 100, 5, 1), set(bench, 60, 8, 2), set(squat, 110, 3, 3)] }),
    )
    expect(workout).toMatchObject({ id: 3, name: 'Monday', performedAt: '2024-05-06', minutes: 45 })
    expect(workout.entries.map((entry) => entry.exercise.name)).toEqual(['Squat', 'Bench'])
    expect(workout.entries[0].sets).toEqual([
      { weight: 100, reps: 5 },
      { weight: 110, reps: 3 },
    ])
  })

  it('toWorkoutRequest drops skipped exercises', () => {
    expect(
      toWorkoutRequest({
        name: 'W',
        minutes: 30,
        entries: [
          { exerciseId: 1, sets: [{ weight: 50, reps: 10 }] },
          { exerciseId: 2, sets: [] },
        ],
      }),
    ).toEqual({ name: 'W', duration_minutes: 30, exercises: [{ exercise_id: 1, sets: [{ weight: 50, reps: 10 }] }] })
  })

  it('maps measurements both ways', () => {
    const base = { id: 1, date: '2024-01-01', weight: 180, body_fat_pct: 15, photo_url: null, created_at: '' }
    expect(toMeasurement({ ...base, custom_measurements: { waist: 32, arms: 15 } })).toEqual({
      id: 1,
      date: '2024-01-01',
      weight: 180,
      bodyFat: 15,
      waist: 32,
      chest: null,
      arms: 15,
    })
    expect(toMeasurement({ ...base, custom_measurements: null })).toMatchObject({ waist: null, chest: null, arms: null })
    expect(toMeasurementRequest({ weight: 180, bodyFat: null, waist: 32, chest: null, arms: 14 })).toEqual({
      weight: 180,
      body_fat_pct: null,
      custom_measurements: { waist: 32, chest: null, arms: 14 },
    })
  })

  it('toSaved maps routines and exercises', () => {
    const saved = toSaved({ routines: [routineDto()], exercises: [exerciseDto()] })
    expect(saved.routines[0].title).toBe('Push Pull Legs')
    expect(saved.exercises[0].name).toBe('Bench Press')
  })

  describe('toDashboard', () => {
    const dto = (overrides: Partial<DashboardDto> = {}): DashboardDto => ({
      user: { id: 1, name: 'Ada' },
      stats: { current_streak: 4, workouts_this_week: 2, latest_body_weight: 181.5 },
      consistency: [],
      measurement_trend: [{ date: '2024-01-01', weight: 180, body_fat_pct: null }],
      default_progression: null,
      ...overrides,
    })

    it('maps stats and the weight trend', () => {
      const dashboard = toDashboard(dto())
      expect(dashboard.stats).toEqual({ streak: 4, workoutsThisWeek: 2, latestWeight: 181.5 })
      expect(dashboard.weightSeries).toEqual([{ date: '2024-01-01', weight: 180, bodyFat: null }])
      expect(dashboard.strength).toBeNull()
    })

    it('fills 91 consecutive days ending today, with counts for workout days', () => {
      const today = new Date()
      const iso = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)

      const { consistency } = toDashboard(
        dto({ consistency: [{ date: iso(yesterday), count: 2 }, { date: '1999-01-01', count: 9 }] }),
      )
      expect(consistency).toHaveLength(91)
      expect(consistency.at(-1)).toEqual({ date: iso(today), count: 0 })
      expect(consistency.at(-2)).toEqual({ date: iso(yesterday), count: 2 })
      expect(consistency.reduce((sum, day) => sum + day.count, 0)).toBe(2)
      // Strictly increasing, one per day.
      for (let i = 1; i < consistency.length; i++) expect(consistency[i].date > consistency[i - 1].date).toBe(true)
    })

    it('maps the strength progression with short date labels', () => {
      const { strength } = toDashboard(
        dto({
          default_progression: {
            exercise: { id: 1, name: 'Squat' },
            data: [{ date: '2024-03-05', max_weight: 225, estimated_1rm: 250 }],
          },
        }),
      )
      expect(strength).toEqual({
        lift: 'Squat',
        series: [{ label: new Date('2024-03-05T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' }), value: 225 }],
      })
    })
  })
})

describe('toTaxonomies', () => {
  it('turns every list into select options and shares difficulties with levels', () => {
    const option = (name: string) => ({ id: name, name, slug: name.toLowerCase() })
    const taxonomies = toTaxonomies({
      muscles: [{ id: 1, name: 'Chest', slug: 'chest' }],
      equipment: [{ id: 1, name: 'Barbell', slug: 'barbell' }],
      difficulties: [option('Beginner')],
      categories: [option('Strength')],
      articleCategories: [option('Nutrition')],
      goals: [option('Strength')],
      authors: ['Coach'],
    })
    expect(taxonomies).toEqual({
      muscleGroups: [{ value: 'chest', label: 'Chest' }],
      equipment: [{ value: 'barbell', label: 'Barbell' }],
      difficulties: [{ value: 'beginner', label: 'Beginner' }],
      levels: [{ value: 'beginner', label: 'Beginner' }],
      categories: [{ value: 'strength', label: 'Strength' }],
      articleCategories: [{ value: 'nutrition', label: 'Nutrition' }],
      goals: [{ value: 'strength', label: 'Strength' }],
      authors: ['Coach'],
    })
  })
})
