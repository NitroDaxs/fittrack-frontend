// ---------------------------------------------------------------------------
// In-memory stand-in for the Laravel REST API.
//
// Every handler below maps 1:1 to an endpoint the real API will expose. Filtering,
// sorting and pagination happen here (i.e. "server side") rather than in the
// components, so when this file is deleted the components keep passing the same
// query parameters and nothing else has to change.
//
// State lives for the lifetime of the tab: admin creates/edits/deletes are real
// mutations against these arrays, so the UI behaves like a genuine CRUD app.
// ---------------------------------------------------------------------------

import * as seed from './db'

const clone = (v) => JSON.parse(JSON.stringify(v))

const state = {
  exercises: clone(seed.exercises),
  routines: clone(seed.routines),
  articles: clone(seed.articles),
  users: clone(seed.users),
  workouts: clone(seed.workoutHistory),
  measurements: clone(seed.measurements),
  currentUser: clone(seed.currentUser),
}

let nextId = 1000

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const notFound = (what) => {
  throw new ApiError(404, `${what} not found`)
}

const contains = (haystack, needle) => String(haystack ?? '').toLowerCase().includes(needle)

function paginate(rows, { page = 1, perPage = 0 } = {}) {
  const total = rows.length
  if (!perPage) return { data: rows, meta: { total, page: 1, perPage: total, lastPage: 1 } }
  const p = Math.max(1, Number(page))
  const start = (p - 1) * perPage
  return {
    data: rows.slice(start, start + perPage),
    meta: { total, page: p, perPage, lastPage: Math.max(1, Math.ceil(total / perPage)) },
  }
}

function sortRows(rows, sort, dir = 'asc') {
  if (!sort) return rows
  const factor = dir === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = a[sort]
    const bv = b[sort]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * factor
  })
}

const byIdOrSlug = (rows, key) =>
  rows.find((r) => r.slug === key || String(r.id) === String(key))

// --- resource handlers ------------------------------------------------------

const handlers = {
  'GET /exercises': (_p, q) => {
    let rows = state.exercises
    if (q.search) {
      const s = q.search.toLowerCase()
      rows = rows.filter(
        (e) => contains(e.name, s) || contains(e.description, s) || e.muscleGroups.some((m) => contains(m, s))
      )
    }
    if (q.muscleGroup) rows = rows.filter((e) => e.muscleGroups.includes(q.muscleGroup))
    if (q.equipment) rows = rows.filter((e) => e.equipment === q.equipment)
    if (q.difficulty) rows = rows.filter((e) => e.difficulty === q.difficulty)
    if (q.category && q.category !== 'All') rows = rows.filter((e) => e.category === q.category)
    rows = sortRows(rows, q.sort, q.dir)
    return paginate(rows, q)
  },

  'GET /exercises/:key': (p) => byIdOrSlug(state.exercises, p.key) ?? notFound('Exercise'),

  'POST /exercises': (_p, _q, body) => {
    const row = {
      id: ++nextId,
      slug: (body.name || 'exercise').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      muscleGroups: [],
      steps: [],
      tips: [],
      relatedIds: [],
      icon: 'fitness_center',
      image: '',
      ...body,
    }
    state.exercises = [row, ...state.exercises]
    return row
  },

  'PUT /exercises/:key': (p, _q, body) => {
    const row = byIdOrSlug(state.exercises, p.key) ?? notFound('Exercise')
    Object.assign(row, body)
    return row
  },

  'DELETE /exercises/:key': (p) => {
    const row = byIdOrSlug(state.exercises, p.key) ?? notFound('Exercise')
    state.exercises = state.exercises.filter((e) => e.id !== row.id)
    return { deleted: row.id }
  },

  'GET /routines': (_p, q) => {
    let rows = state.routines
    if (q.search) {
      const s = q.search.toLowerCase()
      rows = rows.filter((r) => contains(r.title, s) || contains(r.description, s))
    }
    if (q.goal) rows = rows.filter((r) => r.goal === q.goal)
    if (q.level) rows = rows.filter((r) => r.level === q.level)
    if (q.goals?.length) rows = rows.filter((r) => q.goals.includes(r.goal))
    if (q.levels?.length) rows = rows.filter((r) => q.levels.includes(r.level))
    if (q.daysPerWeek) {
      const d = Number(q.daysPerWeek)
      rows = rows.filter((r) => (d >= 5 ? r.daysPerWeek >= 5 : r.daysPerWeek === d))
    }
    rows = sortRows(rows, q.sort, q.dir)
    return paginate(rows, q)
  },

  'GET /routines/:key': (p) => {
    const routine = byIdOrSlug(state.routines, p.key) ?? notFound('Routine')
    // The API will return days with their exercises already joined.
    return {
      ...routine,
      days: routine.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((item) => ({
          ...item,
          exercise: state.exercises.find((e) => e.id === item.exerciseId) ?? null,
        })),
      })),
    }
  },

  'POST /routines': (_p, _q, body) => {
    const row = {
      id: ++nextId,
      slug: (body.title || 'routine').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      days: [],
      icon: 'fitness_center',
      image: '',
      weeks: 8,
      minutes: 60,
      ...body,
    }
    state.routines = [row, ...state.routines]
    return row
  },

  'PUT /routines/:key': (p, _q, body) => {
    const row = byIdOrSlug(state.routines, p.key) ?? notFound('Routine')
    Object.assign(row, body)
    return row
  },

  'DELETE /routines/:key': (p) => {
    const row = byIdOrSlug(state.routines, p.key) ?? notFound('Routine')
    state.routines = state.routines.filter((r) => r.id !== row.id)
    return { deleted: row.id }
  },

  'GET /articles': (_p, q) => {
    let rows = state.articles
    if (q.search) {
      const s = q.search.toLowerCase()
      rows = rows.filter((a) => contains(a.title, s) || contains(a.excerpt, s) || contains(a.author, s))
    }
    if (q.category && q.category !== 'All') rows = rows.filter((a) => a.category === q.category)
    if (q.status && q.status !== 'All Status') rows = rows.filter((a) => a.status === q.status)
    if (q.author && q.author !== 'All Authors') rows = rows.filter((a) => a.author === q.author)
    if (q.publishedOnly) rows = rows.filter((a) => a.status === 'Published')
    rows = sortRows(rows, q.sort ?? 'date', q.dir ?? 'desc')
    return paginate(rows, q)
  },

  'GET /articles/:key': (p) => {
    const article = byIdOrSlug(state.articles, p.key) ?? notFound('Article')
    return {
      ...article,
      related: (article.relatedIds ?? [])
        .map((id) => state.articles.find((a) => a.id === id))
        .filter(Boolean),
    }
  },

  'POST /articles': (_p, _q, body) => {
    const row = {
      id: ++nextId,
      slug: (body.title || 'article').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: new Date().toISOString().slice(0, 10),
      readMinutes: 5,
      status: 'Draft',
      body: [],
      relatedIds: [],
      image: '',
      ...body,
    }
    state.articles = [row, ...state.articles]
    return row
  },

  'PUT /articles/:key': (p, _q, body) => {
    const row = byIdOrSlug(state.articles, p.key) ?? notFound('Article')
    Object.assign(row, body)
    return row
  },

  'DELETE /articles/:key': (p) => {
    const row = byIdOrSlug(state.articles, p.key) ?? notFound('Article')
    state.articles = state.articles.filter((a) => a.id !== row.id)
    return { deleted: row.id }
  },

  'GET /users': (_p, q) => {
    let rows = state.users
    if (q.search) {
      const s = q.search.toLowerCase()
      rows = rows.filter((u) => contains(u.name, s) || contains(u.email, s))
    }
    if (q.role && q.role !== 'All Roles') rows = rows.filter((u) => u.role === q.role)
    if (q.status && q.status !== 'All Status') rows = rows.filter((u) => u.status === q.status)
    rows = sortRows(rows, q.sort, q.dir)
    return paginate(rows, q)
  },

  'POST /users': (_p, _q, body) => {
    const row = { id: ++nextId, role: 'Member', status: 'Active', joined: new Date().toISOString().slice(0, 10), ...body }
    state.users = [row, ...state.users]
    return row
  },

  'PUT /users/:key': (p, _q, body) => {
    const row = state.users.find((u) => String(u.id) === String(p.key)) ?? notFound('User')
    Object.assign(row, body)
    return row
  },

  'DELETE /users/:key': (p) => {
    const row = state.users.find((u) => String(u.id) === String(p.key)) ?? notFound('User')
    state.users = state.users.filter((u) => u.id !== row.id)
    return { deleted: row.id }
  },

  // --- authenticated member endpoints ---------------------------------------

  'GET /me': () => state.currentUser,

  'PUT /me': (_p, _q, body) => {
    Object.assign(state.currentUser, body)
    return state.currentUser
  },

  'GET /me/saved': () => ({
    routines: state.currentUser.savedRoutineIds
      .map((id) => state.routines.find((r) => r.id === id))
      .filter(Boolean),
    exercises: state.currentUser.favoriteExerciseIds
      .map((id) => state.exercises.find((e) => e.id === id))
      .filter(Boolean),
  }),

  'GET /me/workouts': (_p, q) => {
    let rows = state.workouts
    if (q.search) {
      const s = q.search.toLowerCase()
      rows = rows.filter((w) => contains(w.name, s) || w.tags.some((t) => contains(t, s)))
    }
    if (q.range && q.range !== 'All Time') {
      const days = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'This Month': 31 }[q.range]
      if (days) {
        const cutoff = new Date('2024-06-26')
        cutoff.setDate(cutoff.getDate() - days)
        rows = rows.filter((w) => new Date(w.performedAt) >= cutoff)
      }
    }
    rows = sortRows(rows, q.sort ?? 'performedAt', q.dir ?? 'desc')
    return paginate(rows, q)
  },

  'GET /me/workouts/:key': (p) => {
    const workout = state.workouts.find((w) => String(w.id) === String(p.key)) ?? notFound('Workout')
    return {
      ...workout,
      entries: workout.entries.map((e) => ({
        ...e,
        exercise: state.exercises.find((x) => x.id === e.exerciseId) ?? null,
      })),
    }
  },

  'POST /me/workouts': (_p, _q, body) => {
    const row = { id: ++nextId, performedAt: new Date().toISOString(), tags: [], icon: 'fitness_center', ...body }
    state.workouts = [row, ...state.workouts]
    return row
  },

  'GET /me/measurements': () =>
    [...state.measurements].sort((a, b) => new Date(b.date) - new Date(a.date)),

  'POST /me/measurements': (_p, _q, body) => {
    const row = { id: ++nextId, date: new Date().toISOString().slice(0, 10), ...body }
    state.measurements = [row, ...state.measurements]
    return row
  },

  'GET /me/dashboard': () => ({
    stats: seed.dashboardStats,
    strengthProgression: seed.strengthProgression,
    consistency: seed.consistency,
    weightSeries: [...state.measurements]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((m) => ({ date: m.date, weight: m.weight, bodyFat: m.bodyFat })),
  }),

  // --- admin ----------------------------------------------------------------

  'GET /admin/stats': () => ({
    ...seed.adminStats,
    totalExercises: state.exercises.length,
    totalRoutines: state.routines.length,
    publishedArticles: state.articles.filter((a) => a.status === 'Published').length,
    totalUsers: state.users.length,
  }),

  'GET /admin/activity': () => seed.adminActivity,

  // --- misc -----------------------------------------------------------------

  'GET /calculators': () => seed.calculators,

  'GET /taxonomies': () => ({
    muscleGroups: seed.MUSCLE_GROUPS,
    equipment: seed.EQUIPMENT,
    difficulties: seed.DIFFICULTIES,
    goals: seed.GOALS,
    levels: seed.LEVELS,
    categories: seed.CATEGORIES,
    authors: [...new Set(state.articles.map((a) => a.author))],
    roles: [...new Set(state.users.map((u) => u.role))],
    statuses: [...new Set(state.users.map((u) => u.status))],
  }),

  // No real authentication: the API contract is here so the swap is mechanical,
  // but the mock accepts any well-formed credentials and picks a role.
  'POST /auth/login': (_p, _q, body) => {
    const known = state.users.find((u) => u.email.toLowerCase() === String(body.email).toLowerCase())
    const role = known?.role === 'Admin' ? 'admin' : 'member'
    return { token: 'mock-token', user: { ...state.currentUser, email: body.email, role } }
  },

  'POST /auth/register': (_p, _q, body) => ({
    token: 'mock-token',
    user: { ...state.currentUser, name: (body.name || 'Athlete').split(' ')[0], fullName: body.name, email: body.email, role: 'member' },
  }),
}

// --- tiny router ------------------------------------------------------------

const routes = Object.entries(handlers).map(([key, handler]) => {
  const [method, pattern] = key.split(' ')
  const names = []
  const regex = new RegExp(
    '^' +
      pattern
        .split('/')
        .map((seg) => {
          if (!seg.startsWith(':')) return seg
          names.push(seg.slice(1))
          return '([^/]+)'
        })
        .join('/') +
      '$'
  )
  return { method, regex, names, handler }
})

export function handle(method, path, { query = {}, body = null } = {}) {
  for (const route of routes) {
    if (route.method !== method) continue
    const match = route.regex.exec(path)
    if (!match) continue
    const params = Object.fromEntries(route.names.map((n, i) => [n, decodeURIComponent(match[i + 1])]))
    return route.handler(params, query, body)
  }
  throw new ApiError(404, `No mock route for ${method} ${path}`)
}

export { ApiError }
