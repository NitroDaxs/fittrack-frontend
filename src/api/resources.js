// Typed-ish wrappers around the HTTP client. Components import from here (or
// from ./hooks, which wraps these) and never touch client.js or the mock.

import { get, post, put, patch, del } from './client'

// The Laravel API models muscle groups/equipment as related objects and
// pluralizes fields snake_case-style; the UI was built against the mock's
// flatter shape (string arrays, `image`/`icon`, capitalized difficulty).
// These helpers translate at the boundary so components don't have to know
// which backend shape they're looking at.
function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}

function titleCase(value) {
  return value
    ? value
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ')
    : value
}

// Material Symbols name per equipment type. Every glyph here was checked
// against the loaded variable font -- an unknown name renders as the literal
// word rather than an icon, so do not add one without verifying it exists
// (`kettlebell` and `dumbbell`, for instance, do not).
const EQUIPMENT_ICONS = {
  Landmine: 'rotate_right',
  'Smith Machine': 'view_week',
  'Cable Machine': 'cable',
  'Pull-up Bar': 'sports_gymnastics',
  'Dip Bar': 'drag_handle',
  Kettlebell: 'weight',
  'EZ-Bar': 'line_curve',
  Barbell: 'fitness_center',
  Dumbbell: 'exercise',
  Machine: 'settings_input_component',
  'Bosu Ball': 'trip_origin',
  'Exercise Ball': 'circle',
  'Medicine Ball': 'sports_volleyball',
  'Suspension Straps': 'link',
  Box: 'deployed_code',
  'Weight Plate': 'album',
  Bench: 'airline_seat_flat',
  Mat: 'self_improvement',
  Bodyweight: 'accessibility_new',
}

// Key order above doubles as priority: an exercise usually lists several pieces
// of equipment ("Barbell, Bench") and we want the one that characterises the
// movement, not whatever the API happened to return first. Accessories that
// show up alongside everything -- bench, mat, bodyweight -- sort last.
const EQUIPMENT_ICON_PRIORITY = Object.keys(EQUIPMENT_ICONS)

function iconForEquipment(equipmentNames) {
  const match = EQUIPMENT_ICON_PRIORITY.find((name) => equipmentNames.includes(name))
  return match ? EQUIPMENT_ICONS[match] : 'fitness_center'
}

// The API stores a full watch URL on `video_url` and an embed URL on the
// `media` rows. The player only needs the id, and admins may paste any of the
// usual YouTube URL shapes, so pull it out of whichever we find first.
function parseYouTubeId(...urls) {
  for (const url of urls) {
    if (typeof url !== 'string') continue
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/)
    if (match) return match[1]
  }
  return null
}

function parseInstructions(instructions) {
  if (!instructions) return []
  return instructions
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map((body, index) => ({ title: `Step ${index + 1}`, body }))
}

function normalizeExercise(raw) {
  if (!raw) return raw
  const muscleGroups = (raw.muscle_groups ?? raw.muscleGroups ?? []).map((m) => (typeof m === 'string' ? m : m.name))
  const primaryMuscles = (raw.muscle_groups ?? [])
    .filter((m) => m?.pivot?.role === 'primary')
    .map((m) => m.name)
    .join(', ')
  const equipmentNames = (raw.equipment ?? []).map((e) => (typeof e === 'string' ? e : e.name))
  const videoMedia = (raw.media ?? []).find((m) => m?.type === 'video')
  const videoId = parseYouTubeId(raw.video_url, videoMedia?.url)
  const image = raw.thumbnail_url ?? raw.image ?? ''

  return {
    ...raw,
    videoId,
    image,
    // `image` is YouTube's hqdefault: 4:3 with the frame letterboxed inside.
    // A 16:9 container crops those bars off, but square thumbnails can't --
    // they get mqdefault, which is natively 16:9 and always exists (unlike
    // maxresdefault, missing for ~50 of our videos).
    imageWide: videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : image,
    icon: raw.icon ?? iconForEquipment(equipmentNames),
    muscleGroups,
    primaryMuscles: primaryMuscles || muscleGroups[0] || '',
    equipment: equipmentNames.join(', ') || (typeof raw.equipment === 'string' ? raw.equipment : ''),
    equipmentDetail: equipmentNames.join(', '),
    difficulty: capitalize(raw.difficulty),
    category: raw.category ?? capitalize(raw.exercise_type),
    mechanics: raw.mechanics ?? '',
    steps: raw.steps ?? parseInstructions(raw.instructions),
    tips: raw.tips ?? [],
    relatedIds: raw.relatedIds ?? [],
  }
}

// Laravel can hand back a bare array (no pagination configured yet) or a
// paginator envelope (flat current_page/last_page/per_page/total, or nested
// under `meta`); the UI always wants { data, meta: { total, page, perPage, lastPage } }.
function normalizePaginated(response, mapItem) {
  const rows = Array.isArray(response) ? response : response?.data ?? []
  const meta = Array.isArray(response)
    ? { total: rows.length, page: 1, perPage: rows.length || 1, lastPage: 1 }
    : {
        total: response.meta?.total ?? response.total ?? rows.length,
        page: response.meta?.current_page ?? response.current_page ?? response.meta?.page ?? 1,
        perPage: response.meta?.per_page ?? response.per_page ?? response.meta?.perPage ?? rows.length,
        lastPage: response.meta?.last_page ?? response.last_page ?? response.meta?.lastPage ?? 1,
      }
  return { data: rows.map(mapItem), meta }
}

export const exercisesApi = {
  list: (query) => get('/exercises', query).then((res) => normalizePaginated(res, normalizeExercise)),
  show: (key) => get(`/exercises/${key}`).then(normalizeExercise),
  // Writes live on adminApi.exercises -- the public /exercises route is
  // read-only, so create/update/remove here would have 405'd.
}

// The show endpoint nests the day-by-day breakdown as `workouts` (each with
// `workout_exercises`), not the mock's `days`/`exercises` naming, and doesn't
// track a day "name" separate from its focus or a per-day time estimate.
function normalizeRoutineDay(workout) {
  return {
    id: workout.id,
    name: `Day ${workout.day_order}`,
    focus: workout.name,
    minutes: workout.minutes ?? null,
    exercises: (workout.workout_exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((entry) => ({
        exerciseId: entry.exercise_id,
        exercise: normalizeExercise(entry.exercise),
        note: entry.notes,
        sets: entry.target_sets,
        reps: entry.target_reps,
      })),
  }
}

// The routines index returns Laravel's default paginator shape with
// snake_case `days_per_week` and lowercase `goal`/`level` enum values; the UI
// expects `daysPerWeek` and Title Case labels (matching the taxonomy names).
function normalizeRoutine(raw) {
  if (!raw) return raw
  return {
    ...raw,
    daysPerWeek: raw.daysPerWeek ?? raw.days_per_week,
    goal: titleCase(raw.goal) || raw.goal,
    level: titleCase(raw.level) || raw.level,
    image: raw.image ?? raw.thumbnail_url ?? '',
    icon: raw.icon ?? 'event_note',
    days: raw.days ?? (raw.workouts ?? []).map(normalizeRoutineDay),
  }
}

export const routinesApi = {
  list: (query) => get('/routines', query).then((res) => normalizePaginated(res, normalizeRoutine)),
  show: (key) => get(`/routines/${key}`).then(normalizeRoutine),
  // Writes live on adminApi.routines (see note on exercisesApi).
}

// ArticleSummaryResource/ArticleResource already hand back the card shape the
// UI wants (flat author name, excerpt, readMinutes, decoded body blocks), so
// this only has to prettify the category label for display.
function normalizeArticle(raw) {
  if (!raw) return raw
  return {
    ...raw,
    category: titleCase(raw.category) || raw.category,
    // The admin table compares against 'Published'/'Draft' for its status pill.
    status: capitalize(raw.status) || raw.status,
  }
}

export const articlesApi = {
  list: (query) => get('/articles', query).then((res) => normalizePaginated(res, normalizeArticle)),
  show: (key) => get(`/articles/${key}`).then((res) => ({
    ...normalizeArticle(res),
    related: (res.related ?? []).map(normalizeArticle),
  })),
  // Writes live on adminApi.articles (see note on exercisesApi).
}

// usersApi removed: it pointed at /users, which has never existed. The admin
// console uses adminApi.users against /admin/users.

// The dashboard endpoint uses snake_case stat names and doesn't have the
// mock's multi-lift `strengthProgression` dict -- it sends a single
// `default_progression` (null until the user has logged sets) and a
// `measurement_trend` array instead of `weightSeries` (confirmed shape:
// { date, weight, body_fat_pct }, with weight/body_fat_pct as numeric
// strings -- Laravel decimal columns serialize that way). `default_progression`
// is still unconfirmed since it's null on every account seen so far; the
// wrapping below is a best-effort guess so the dashboard can't crash on it.
// The dashboard sends `default_progression` as { exercise: {id, name}, data:
// [{date, max_weight, estimated_1rm}] }. StrengthChart wants a
// { liftName: [{month, value}] } dict, so wrap the single lift into that shape
// and map each point (value = top working weight that day).
function normalizeStrengthProgression(raw) {
  if (raw.strengthProgression) return raw.strengthProgression
  const progression = raw.default_progression
  if (!progression) return {}

  const points = progression.data ?? progression.series ?? (Array.isArray(progression) ? progression : [])
  const name = progression.exercise?.name ?? progression.lift ?? progression.name ?? 'Current lift'
  const series = points.map((point) => ({
    month: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: Number(point.value ?? point.max_weight ?? point.estimated_1rm ?? 0),
  }))
  return { [name]: series }
}

function normalizeDashboard(raw) {
  if (!raw) return raw
  const stats = raw.stats ?? {}
  return {
    ...raw,
    stats: {
      streak: stats.streak ?? stats.current_streak ?? 0,
      workoutsThisWeek: stats.workoutsThisWeek ?? stats.workouts_this_week ?? 0,
      latestWeight: stats.latestWeight ?? stats.latest_body_weight ?? null,
      weightUnit: stats.weightUnit ?? 'lbs',
    },
    consistency: raw.consistency ?? [],
    weightSeries: (raw.weightSeries ?? raw.measurement_trend ?? []).map((entry) => ({
      ...entry,
      date: entry.date ?? entry.recorded_at ?? entry.recordedAt,
      weight: Number(entry.weight ?? entry.weight_lbs ?? entry.value),
      bodyFat: entry.bodyFat ?? (entry.body_fat_pct != null ? Number(entry.body_fat_pct) : null),
    })),
    strengthProgression: normalizeStrengthProgression(raw),
  }
}

// The measurements table stores tape measurements in a `custom_measurements`
// JSON column and uses `body_fat_pct`; the UI wants flat `chest`/`waist`/`arms`
// and `bodyFat` fields on each entry (matching what the log form collects).
function normalizeMeasurement(raw) {
  if (!raw) return raw
  const custom = raw.custom_measurements ?? {}
  return {
    ...raw,
    weight: raw.weight != null ? Number(raw.weight) : raw.weight,
    bodyFat: raw.bodyFat ?? (raw.body_fat_pct != null ? Number(raw.body_fat_pct) : null),
    waist: raw.waist ?? custom.waist ?? null,
    chest: raw.chest ?? custom.chest ?? null,
    arms: raw.arms ?? custom.arms ?? null,
  }
}

// `/me/saved` returns the user's saved routines and favorited exercises. Run
// each through the resource normalizers so ProfileSettings' cards (which read
// `level`, `icon`, `muscleGroups`, etc.) get the same shape as the catalog.
/**
 * `GET /me` returns id, name, email, role, units, created_at. ProfileSettings was
 * written against the mock and also read `fullName`, `joined`, `plan`, `level`,
 * `title`, `avatar` and `pushNotifications` -- rendering "undefined • Joined
 * undefined" and "Level undefined" against the real API.
 *
 * Derive the ones that map to real data; leave the rest undefined so the page can
 * hide them rather than print placeholders for features that don't exist yet.
 */
function normalizeProfile(raw) {
  if (!raw) return raw
  return {
    ...raw,
    fullName: raw.fullName ?? raw.name,
    plan: raw.plan ?? (raw.role === 'admin' ? 'Admin' : 'Member'),
    joined: raw.joined
      ?? (raw.created_at
        ? new Date(raw.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : null),
  }
}

function normalizeSaved(raw) {
  return {
    routines: (raw?.routines ?? raw?.saved_routines ?? []).map(normalizeRoutine),
    exercises: (raw?.exercises ?? raw?.saved_exercises ?? raw?.favorite_exercises ?? []).map(normalizeExercise),
  }
}

// A logged workout (WorkoutLog) has a flat `set_logs` array -- one row per set,
// each carrying its `exercise_id` and nested `exercise`. WorkoutHistory/Dashboard
// want `entries` grouped by exercise (each with a `sets` array), plus
// `performedAt`/`icon`/`tags`/`minutes`.
function normalizeWorkout(raw) {
  if (!raw) return raw
  const setLogs = raw.set_logs ?? raw.setLogs ?? []

  // Group set logs by exercise, preserving the order each exercise first appears.
  const byExercise = new Map()
  for (const setLog of setLogs) {
    const key = setLog.exercise_id ?? setLog.exerciseId
    if (!byExercise.has(key)) {
      byExercise.set(key, { exerciseId: key, exercise: normalizeExercise(setLog.exercise), sets: [] })
    }
    byExercise.get(key).sets.push({
      weight: setLog.weight != null ? Number(setLog.weight) : null,
      reps: setLog.reps != null ? Number(setLog.reps) : null,
    })
  }

  return {
    ...raw,
    icon: raw.icon ?? 'fitness_center',
    performedAt: raw.performedAt ?? raw.date ?? raw.created_at,
    minutes: raw.minutes ?? raw.duration_minutes ?? null,
    tags: raw.tags ?? [],
    entries: Array.from(byExercise.values()),
  }
}

export const meApi = {
  profile: () => get('/me').then(normalizeProfile),
  updateProfile: (body) => put('/me', body),
  saved: () => get('/me/saved').then(normalizeSaved),
  dashboard: () => get('/me/dashboard').then(normalizeDashboard),
  workouts: (query) => get('/me/workouts', query).then((res) => normalizePaginated(res, normalizeWorkout)),
  workout: (id) => get(`/me/workouts/${id}`).then(normalizeWorkout),
  // ActiveWorkout builds a camelCase payload with an `entries` array; the
  // backend validates a required snake_case `exercises` array (mirroring the
  // `workout_exercises` read shape: exercise_id, order, performed sets). The
  // per-set field names are a best-effort guess until a log round-trips.
  logWorkout: (body) =>
    post('/me/workouts', {
      name: body.name,
      duration_minutes: body.minutes,
      exercises: (body.entries ?? body.exercises ?? []).map((entry, index) => ({
        exercise_id: entry.exerciseId ?? entry.exercise_id,
        order: index + 1,
        sets: (entry.sets ?? []).map((set, setIndex) => ({
          set_number: setIndex + 1,
          weight: set.weight,
          reps: set.reps,
        })),
      })),
    }),
  measurements: () =>
    get('/me/measurements').then((res) => (Array.isArray(res) ? res : res?.data ?? []).map(normalizeMeasurement)),
  // Best-effort mirror of the GET shape (body_fat_pct + custom_measurements)
  // -- unconfirmed until an actual log entry round-trips through this.
  logMeasurement: (body) =>
    post('/me/measurements', {
      weight: body.weight,
      body_fat_pct: body.bodyFat,
      custom_measurements: { waist: body.waist, chest: body.chest, arms: body.arms },
    }).then(normalizeMeasurement),
}

// Save/unsave toggles. The routes use implicit route-model binding
// (`/routines/{routine}/save`), which resolves by primary key, so these take
// the numeric id -- not the slug the detail pages are addressed by.
export const favoritesApi = {
  saveRoutine: (id) => post(`/routines/${id}/save`),
  unsaveRoutine: (id) => del(`/routines/${id}/save`),
  saveExercise: (id) => post(`/exercises/${id}/save`),
  unsaveExercise: (id) => del(`/exercises/${id}/save`),
}

// ---------------------------------------------------------------------------
// Admin console
//
// Writes go to /admin/* (the public catalog routes are read-only), and the admin
// forms were built against the mock's display vocabulary -- Title Case labels,
// muscle-group *names*, `status: 'Active'`. The de-normalizers below translate
// that into what the API validates, so the form components keep working
// unchanged. Same boundary principle as the read-side normalizers above.
// ---------------------------------------------------------------------------

const toSlug = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '-')
const toSnake = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_')

/**
 * The admin filter dropdowns use "All", "All Roles", "All Status" as their
 * no-filter option. Those are UI sentinels, not values -- sent as-is the API
 * would filter for an exercise_type of "all" and return nothing.
 */
function cleanQuery(query = {}) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => {
      if (value === null || value === undefined || value === '') return false
      return !/^all\b/i.test(String(value))
    })
  )
}

function denormalizeExercise(form) {
  const muscleGroups = form.muscleGroups ?? []
  // The form collects primary muscles as a free-text list; anything named there
  // gets the `primary` pivot role, everything else `secondary`.
  const primary = String(form.primaryMuscles ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  const payload = {
    name: form.name,
    description: form.description,
    difficulty: toSlug(form.difficulty),
    exercise_type: toSnake(form.category ?? 'strength'),
    muscle_groups: muscleGroups.map(toSlug),
    primary_muscles: (primary.length ? primary : muscleGroups.slice(0, 1)).map(toSlug),
    equipment: (Array.isArray(form.equipmentList)
      ? form.equipmentList
      : String(form.equipment ?? '').split(',')
    )
      .map((name) => String(name).trim())
      .filter(Boolean)
      .map(toSlug),
  }

  // `instructions` is stored as newline-separated steps (see parseInstructions
  // on the read side); the form's textarea already uses one line per step.
  if (typeof form.instructions === 'string') {
    payload.instructions = form.instructions
  } else if (Array.isArray(form.steps)) {
    payload.instructions = form.steps.join('\n')
  }

  // Send URL fields only when non-empty -- the API validates `url`, and an
  // empty string fails that rule rather than clearing the column.
  if (form.video_url) payload.video_url = form.video_url
  if (form.thumbnail_url) payload.thumbnail_url = form.thumbnail_url

  return payload
}

function denormalizeRoutine(form) {
  const payload = {
    title: form.title,
    description: form.description,
    goal: toSnake(form.goal),
    level: toSlug(form.level),
    days_per_week: Number(form.daysPerWeek ?? form.days_per_week ?? 3),
    is_public: form.isPublic ?? true,
  }

  // Omit `days` entirely when the builder never loaded (or the routine genuinely
  // has none) so a metadata-only edit can't wipe an existing programme -- the API
  // treats an absent key as "leave the schedule alone".
  if (Array.isArray(form.days) && form.days.length > 0) {
    payload.days = form.days.map((day) => ({
      name: day.name,
      exercises: (day.exercises ?? []).map((entry) => ({
        exercise_id: entry.exercise_id,
        target_sets: entry.target_sets ?? null,
        target_reps: entry.target_reps || null,
        target_weight: entry.target_weight ?? null,
        rest_seconds: entry.rest_seconds ?? null,
        notes: entry.notes || null,
      })),
    }))
  }

  return payload
}

/**
 * Flattens the API's nested programme into the shape RoutineDayBuilder edits.
 * Exercise name is carried alongside the id so the builder can label rows
 * without a second lookup.
 */
function normalizeRoutineProgramme(raw) {
  return {
    ...normalizeRoutine(raw),
    days: (raw?.workouts ?? []).map((workout) => ({
      name: workout.name,
      exercises: (workout.workout_exercises ?? []).map((entry) => ({
        exercise_id: entry.exercise_id,
        name: entry.exercise?.name ?? 'Unknown exercise',
        target_sets: entry.target_sets,
        target_reps: entry.target_reps ?? '',
        target_weight: entry.target_weight,
        rest_seconds: entry.rest_seconds,
        notes: entry.notes ?? '',
      })),
    })),
  }
}

function denormalizeArticle(form, { isNew = false } = {}) {
  const payload = {
    title: form.title,
    category: toSnake(form.category),
    status: toSlug(form.status),
  }

  const typedBody = typeof form.body === 'string' ? form.body.trim() : ''

  if (typedBody) {
    // Prose from the textarea; the API splits it into blocks.
    payload.body = typedBody
  } else if (isNew) {
    // A new article needs *some* body, so fall back to the excerpt.
    payload.excerpt = form.excerpt
  }
  // On edit with an empty body box, send neither field. The admin table's rows
  // carry no body (the summary resource omits it), so passing an empty string
  // through would overwrite an article's real blocks with a one-line excerpt.

  return payload
}

function denormalizeUser(form) {
  const payload = {
    name: form.name,
    email: form.email,
    role: toSlug(form.role),
  }
  if (form.status !== undefined) {
    payload.is_active = toSlug(form.status) === 'active'
  }
  return payload
}

// Users come back with `role: 'member'` and a boolean `is_active`; the table
// renders Title Case role/status labels and tone-maps on them.
function normalizeAdminUser(raw) {
  if (!raw) return raw
  return {
    ...raw,
    role: capitalize(raw.role),
    status: raw.is_active === false ? 'Suspended' : 'Active',
    joined: raw.created_at ? String(raw.created_at).slice(0, 10) : '',
  }
}

export const adminApi = {
  stats: () => get('/admin/stats'),
  activity: () => get('/admin/activity'),

  exercises: {
    list: (query) => get('/admin/exercises', cleanQuery(query)).then((res) => normalizePaginated(res, normalizeExercise)),
    create: (body) => post('/admin/exercises', denormalizeExercise(body)).then(normalizeExercise),
    update: (id, body) => put(`/admin/exercises/${id}`, denormalizeExercise(body)).then(normalizeExercise),
    remove: (id) => del(`/admin/exercises/${id}`),
  },

  routines: {
    list: (query) => get('/admin/routines', cleanQuery(query)).then((res) => normalizePaginated(res, normalizeRoutine)),
    // Loads the full programme so the day builder can edit it.
    show: (id) => get(`/admin/routines/${id}`).then(normalizeRoutineProgramme),
    create: (body) => post('/admin/routines', denormalizeRoutine(body)).then(normalizeRoutine),
    update: (id, body) => put(`/admin/routines/${id}`, denormalizeRoutine(body)).then(normalizeRoutine),
    remove: (id) => del(`/admin/routines/${id}`),
  },

  articles: {
    list: (query) => get('/admin/articles', cleanQuery(query)).then((res) => normalizePaginated(res, normalizeArticle)),
    create: (body) => post('/admin/articles', denormalizeArticle(body, { isNew: true })).then(normalizeArticle),
    update: (id, body) => put(`/admin/articles/${id}`, denormalizeArticle(body)).then(normalizeArticle),
    remove: (id) => del(`/admin/articles/${id}`),
  },

  users: {
    list: (query) => get('/admin/users', cleanQuery(query)).then((res) => normalizePaginated(res, normalizeAdminUser)),
    create: (body) => post('/admin/users', denormalizeUser(body)).then(normalizeAdminUser),
    update: (id, body) => put(`/admin/users/${id}`, denormalizeUser(body)).then(normalizeAdminUser),
    remove: (id) => del(`/admin/users/${id}`),
    toggleActive: (id) => patch(`/admin/users/${id}/toggle-active`).then(normalizeAdminUser),
  },
}

export const authApi = {
  login: (body) => post('/login', body),
  register: (body) => post('/register', body),
  // AuthContext already calls this if present. Without it, signing out only
  // cleared localStorage and the Sanctum token stayed valid server-side forever.
  logout: () => post('/logout'),
}

// The backend hands back muscle groups/equipment/etc as { id, name, slug }
// objects (and calls muscle groups "muscles"); the UI's filter chips and
// admin selects were built against plain label strings. Normalize every
// taxonomy list to a uniform { value, label } shape so consumers don't need
// to know which backend shape they're looking at.
function normalizeTaxonomyList(list) {
  return (list ?? []).map((item) =>
    typeof item === 'string' ? { value: item, label: item } : { value: item.slug ?? item.id, label: item.name }
  )
}

function normalizeTaxonomies(raw) {
  return {
    ...raw,
    muscleGroups: normalizeTaxonomyList(raw?.muscleGroups ?? raw?.muscles),
    equipment: normalizeTaxonomyList(raw?.equipment),
    difficulties: normalizeTaxonomyList(raw?.difficulties),
    categories: normalizeTaxonomyList(raw?.categories),
    articleCategories: normalizeTaxonomyList(raw?.articleCategories),
    goals: normalizeTaxonomyList(raw?.goals),
    // Routine "level" and exercise "difficulty" share the same
    // beginner/intermediate/advanced vocabulary; the backend only sends one list.
    levels: normalizeTaxonomyList(raw?.levels ?? raw?.difficulties),
  }
}

// Taxonomies are static reference data, so cache the in-flight/resolved promise
// module-wide: every caller shares one network request for the app's lifetime.
// Cleared on failure so a later call can retry.
let taxonomiesPromise = null

export const metaApi = {
  taxonomies: () => {
    if (!taxonomiesPromise) {
      taxonomiesPromise = get('/taxonomies')
        .then(normalizeTaxonomies)
        .catch((error) => {
          taxonomiesPromise = null
          throw error
        })
    }
    return taxonomiesPromise
  },
}

// The chat endpoint answers across several topics and always returns the same
// envelope, with only the relevant collection populated. Each one is run
// through the same normalizer its own catalog endpoint uses, so the chat can
// reuse ExerciseCard/RoutineCard/ArticleCard unchanged. Articles arrive
// pre-flattened by the backend (author name, excerpt, readMinutes).
export const chatApi = {
  ask: (message) =>
    post('/chat', { message }).then((res) => ({
      ...res,
      exercises: (res.exercises ?? []).map(normalizeExercise),
      routines: (res.routines ?? []).map(normalizeRoutine),
      articles: (res.articles ?? []).map(normalizeArticle),
      measurements: (res.measurements ?? []).map(normalizeMeasurement),
      workouts: res.workouts ?? [],
      authRequired: res.authRequired ?? false,
    })),
}
