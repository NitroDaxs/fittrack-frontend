import { beforeEach, describe, expect, it, vi } from 'vitest'
import { articleDto, exerciseDto, paged, routineDto, userDto, workoutLogDto } from '../test/fixtures'

vi.mock('./http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./http')>()),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}))

const http = await import('./http')
const { adminService } = await import('./admin')
const { articleService } = await import('./articles')
const { authService } = await import('./auth')
const { calculatorService } = await import('./calculators')
const { chatService } = await import('./chat')
const { exerciseService } = await import('./exercises')
const { favoriteService, meService } = await import('./me')
const { routineService } = await import('./routines')
const { taxonomyService } = await import('./taxonomies')

const get = vi.mocked(http.get)
const post = vi.mocked(http.post)
const put = vi.mocked(http.put)
const patch = vi.mocked(http.patch)
const del = vi.mocked(http.del)

beforeEach(() => {
  for (const fn of [get, post, put, patch, del]) fn.mockReset().mockResolvedValue({})
})

const signal = new AbortController().signal

describe('authService', () => {
  it('posts to each auth endpoint', async () => {
    await authService.login({ email: 'a', password: 'b' })
    await authService.register({ name: 'n', email: 'a', password: 'b' })
    await authService.forgotPassword({ email: 'a' })
    await authService.resetPassword({ token: 't', password: 'p', password_confirmation: 'p' })
    await authService.logout()
    expect(post.mock.calls).toEqual([
      ['/login', { email: 'a', password: 'b' }],
      ['/register', { name: 'n', email: 'a', password: 'b' }],
      ['/forgot-password', { email: 'a' }],
      ['/reset-password', { token: 't', password: 'p', password_confirmation: 'p' }],
      ['/logout'],
    ])
  })
})

describe('calculatorService', () => {
  it.each([
    ['oneRepMax', '/calculators/one-rep-max'],
    ['bmi', '/calculators/bmi'],
    ['tdee', '/calculators/tdee'],
    ['macros', '/calculators/macros'],
    ['bodyFat', '/calculators/body-fat'],
  ] as const)('%s posts to %s and returns the result', async (name, url) => {
    post.mockResolvedValue({ result: 1 })
    const body = { x: 1 } as never
    await expect(calculatorService[name](body)).resolves.toEqual({ result: 1 })
    expect(post).toHaveBeenCalledWith(url, body)
  })
})

describe('exerciseService', () => {
  it('list joins multi-select filters and maps the page', async () => {
    get.mockResolvedValue(paged([exerciseDto()]))
    const page = await exerciseService.list({ search: 'press', muscleGroups: ['chest', 'back'], equipment: ['barbell'], page: 2 }, signal)
    expect(get).toHaveBeenCalledWith('/exercises', { search: 'press', page: 2, muscleGroup: 'chest,back', equipment: 'barbell' }, signal)
    expect(page.data[0].name).toBe('Bench Press')
    expect(page.meta.page).toBe(1)
  })

  it('list sends undefined for absent filters', async () => {
    get.mockResolvedValue(paged([]))
    await exerciseService.list({})
    expect(get).toHaveBeenCalledWith('/exercises', { muscleGroup: undefined, equipment: undefined }, undefined)
  })

  it('show maps one exercise', async () => {
    get.mockResolvedValue(exerciseDto({ name: 'Row' }))
    await expect(exerciseService.show('row')).resolves.toMatchObject({ name: 'Row' })
    expect(get).toHaveBeenCalledWith('/exercises/row')
  })
})

describe('routineService / articleService / taxonomyService', () => {
  it('routines list and show', async () => {
    get.mockResolvedValueOnce(paged([routineDto()])).mockResolvedValueOnce(routineDto({ title: 'X' }))
    expect((await routineService.list({ goals: ['strength'] }, signal)).data[0].title).toBe('Push Pull Legs')
    expect(get).toHaveBeenLastCalledWith('/routines', { goals: ['strength'] }, signal)
    expect((await routineService.show('x')).title).toBe('X')
    expect(get).toHaveBeenLastCalledWith('/routines/x')
  })

  it('articles list and show', async () => {
    get.mockResolvedValueOnce(paged([articleDto()])).mockResolvedValueOnce(articleDto({ title: 'Y' }))
    expect((await articleService.list({ category: 'nutrition' })).data[0].title).toBe('Protein 101')
    expect(get).toHaveBeenLastCalledWith('/articles', { category: 'nutrition' }, undefined)
    expect((await articleService.show('y')).title).toBe('Y')
    expect(get).toHaveBeenLastCalledWith('/articles/y')
  })

  it('taxonomies', async () => {
    get.mockResolvedValue({ muscles: [], equipment: [], difficulties: [], categories: [], articleCategories: [], goals: [], authors: [] })
    await expect(taxonomyService.taxonomies()).resolves.toMatchObject({ levels: [], authors: [] })
    expect(get).toHaveBeenCalledWith('/taxonomies')
  })
})

describe('chatService', () => {
  it('maps the reply and cards', async () => {
    post.mockResolvedValue({ reply: 'Hi', cards: { exercises: [exerciseDto()], routines: [routineDto()], articles: [articleDto()] } })
    const answer = await chatService.ask({ message: 'hi', history: [], language: 'en' })
    expect(post).toHaveBeenCalledWith('/chat', { message: 'hi', history: [], language: 'en' })
    expect(answer.reply).toBe('Hi')
    expect(answer.cards.exercises[0].name).toBe('Bench Press')
    expect(answer.cards.routines[0].title).toBe('Push Pull Legs')
    expect(answer.cards.articles[0].title).toBe('Protein 101')
  })

  it('tolerates missing cards', async () => {
    post.mockResolvedValue({ reply: 'Hi' })
    await expect(chatService.ask({ message: 'hi', history: [], language: 'bg' })).resolves.toEqual({
      reply: 'Hi',
      cards: { exercises: [], routines: [], articles: [] },
    })
  })
})

describe('meService', () => {
  it('profile and saved are mapped', async () => {
    get.mockResolvedValueOnce(userDto({ name: 'Bo' })).mockResolvedValueOnce({ routines: [], exercises: [exerciseDto()] })
    expect((await meService.profile()).name).toBe('Bo')
    expect(get).toHaveBeenLastCalledWith('/me')
    expect((await meService.saved()).exercises).toHaveLength(1)
    expect(get).toHaveBeenLastCalledWith('/me/saved')
  })

  it('updates the profile and password with PUT', async () => {
    await meService.updateProfile({ units: 'metric' })
    await meService.changePassword({ current_password: 'a', new_password: 'b', new_password_confirmation: 'b' })
    expect(put.mock.calls).toEqual([
      ['/me', { units: 'metric' }],
      ['/me/password', { current_password: 'a', new_password: 'b', new_password_confirmation: 'b' }],
    ])
  })

  it('uploads the avatar as multipart form data and removes it with DELETE', async () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    await meService.uploadAvatar(file)
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/me/avatar')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('file')).toBe(file)
    await meService.removeAvatar()
    expect(del).toHaveBeenCalledWith('/me/avatar')
  })

  it('lists, fetches and logs workouts', async () => {
    get.mockResolvedValueOnce(paged([workoutLogDto()])).mockResolvedValueOnce(workoutLogDto({ id: 9 }))
    expect((await meService.workouts({ range: '30d' }, signal)).data[0].id).toBe(3)
    expect(get).toHaveBeenLastCalledWith('/me/workouts', { range: '30d' }, signal)
    expect((await meService.workout(9)).id).toBe(9)
    expect(get).toHaveBeenLastCalledWith('/me/workouts/9')

    await meService.logWorkout({ name: 'W', minutes: 10, entries: [{ exerciseId: 1, sets: [] }] })
    expect(post).toHaveBeenCalledWith('/me/workouts', { name: 'W', duration_minutes: 10, exercises: [] })
  })

  it('lists and logs measurements', async () => {
    const row = { id: 1, date: 'd', weight: 1, body_fat_pct: null, custom_measurements: null, photo_url: null, created_at: '' }
    get.mockResolvedValue([row])
    post.mockResolvedValue(row)
    expect(await meService.measurements()).toHaveLength(1)
    expect(get).toHaveBeenCalledWith('/me/measurements')
    expect(await meService.logMeasurement({ weight: 1, bodyFat: null, waist: null, chest: null, arms: null })).toMatchObject({ id: 1 })
    expect(post).toHaveBeenCalledWith('/me/measurements', {
      weight: 1,
      body_fat_pct: null,
      custom_measurements: { waist: null, chest: null, arms: null },
    })
  })

  it('dashboard is mapped', async () => {
    get.mockResolvedValue({
      user: { id: 1, name: 'A' },
      stats: { current_streak: 1, workouts_this_week: 1, latest_body_weight: null },
      consistency: [],
      measurement_trend: [],
      default_progression: null,
    })
    expect((await meService.dashboard()).stats.streak).toBe(1)
    expect(get).toHaveBeenCalledWith('/me/dashboard')
  })
})

describe('favoriteService', () => {
  it('saves with POST and unsaves with DELETE', async () => {
    await favoriteService.saveRoutine(1)
    await favoriteService.saveExercise(2)
    await favoriteService.unsaveRoutine(3)
    await favoriteService.unsaveExercise(4)
    expect(post.mock.calls).toEqual([['/routines/1/save'], ['/exercises/2/save']])
    expect(del.mock.calls).toEqual([['/routines/3/save'], ['/exercises/4/save']])
  })
})

describe('adminService', () => {
  it('stats and activity', async () => {
    await adminService.stats()
    await adminService.activity()
    expect(get.mock.calls).toEqual([['/admin/stats'], ['/admin/activity']])
  })

  it.each([
    ['exercises', paged([exerciseDto()]), 'Bench Press', 'name'],
    ['routines', paged([routineDto()]), 'Push Pull Legs', 'title'],
    ['articles', paged([articleDto()]), 'Protein 101', 'title'],
    ['users', paged([userDto()]), 'Ada Lovelace', 'name'],
  ] as const)('%s list maps rows', async (resource, response, expected, field) => {
    get.mockResolvedValue(response)
    const page = await adminService[resource].list({ search: 'q' }, signal)
    expect(get).toHaveBeenCalledWith(`/admin/${resource}`, { search: 'q' }, signal)
    expect((page.data[0] as unknown as Record<string, unknown>)[field]).toBe(expected)
  })

  it('creates, updates and removes with mapped request bodies', async () => {
    const user = { name: 'A', email: 'a@b.co', role: 'Admin' as const, status: 'Active' as const }
    await adminService.users.create(user)
    await adminService.users.update(4, user)
    await adminService.users.remove(4)
    await adminService.users.toggleActive(4)
    const request = { name: 'A', email: 'a@b.co', role: 'admin', is_active: true }
    expect(post).toHaveBeenCalledWith('/admin/users', request)
    expect(put).toHaveBeenCalledWith('/admin/users/4', request)
    expect(del).toHaveBeenCalledWith('/admin/users/4')
    expect(patch).toHaveBeenCalledWith('/admin/users/4/toggle-active')
  })

  it('routes exercise, routine and article writes to their endpoints', async () => {
    const exerciseForm = {
      name: 'n', description: 'd', instructions: '', muscleGroups: ['Chest'], equipmentList: [], difficulty: 'Beginner',
      category: 'Strength', primaryMuscles: '', videoUrl: '', thumbnailUrl: '',
    }
    const routineForm = { title: 't', description: 'd', goal: 'Strength', level: 'Beginner', daysPerWeek: 3, isPublic: true, imageUrl: '', days: [] }
    const articleForm = { title: 't', body: 'b', category: 'Nutrition', status: 'Draft' as const, imageUrl: '' }

    await adminService.exercises.create(exerciseForm)
    await adminService.exercises.update(1, exerciseForm)
    await adminService.exercises.remove(1)
    await adminService.routines.create(routineForm)
    await adminService.routines.update(2, routineForm)
    await adminService.routines.remove(2)
    await adminService.articles.create(articleForm)
    await adminService.articles.update(3, articleForm)
    await adminService.articles.remove(3)

    expect(post.mock.calls.map(([url]) => url)).toEqual(['/admin/exercises', '/admin/routines', '/admin/articles'])
    expect(put.mock.calls.map(([url]) => url)).toEqual(['/admin/exercises/1', '/admin/routines/2', '/admin/articles/3'])
    expect(del.mock.calls.map(([url]) => url)).toEqual(['/admin/exercises/1', '/admin/routines/2', '/admin/articles/3'])
    expect(post.mock.calls[0][1]).toMatchObject({ difficulty: 'beginner', exercise_type: 'strength' })
    expect(post.mock.calls[1][1]).toMatchObject({ goal: 'strength', days_per_week: 3 })
    expect(post.mock.calls[2][1]).toMatchObject({ category: 'nutrition', status: 'draft', body: 'b' })
  })

  it('programme loads the day-builder shape', async () => {
    get.mockResolvedValue(routineDto({ workouts: [] }))
    await expect(adminService.routines.programme(5)).resolves.toEqual([])
    expect(get).toHaveBeenCalledWith('/admin/routines/5')
  })
})
