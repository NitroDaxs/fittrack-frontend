import { endpoints } from './endpoints'
import { get } from './http'
import type { Exercise, ExerciseCategoryValue, ExerciseDto, ExerciseForm, ExerciseQuery, ExerciseRequest, ExerciseStep } from '../types/exercises'
import { capitalize, splitList, titleCase, toPage, toSlug, toSnake } from './shared'
import type { DifficultyValue, PagedDto } from '../types/shared'

// Material Symbols name per equipment type. Every glyph here was checked against
// the loaded variable font -- an unknown name renders as the literal word rather
// than an icon, so do not add one without verifying it exists (`kettlebell` and
// `dumbbell`, for instance, do not).
//
// Key order doubles as priority: an exercise usually lists several pieces of
// equipment ("Barbell, Bench") and we want the one that characterises the
// movement. Accessories that show up alongside everything sort last.
const EQUIPMENT_ICONS: Record<string, string> = {
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

function iconForEquipment(names: string[]): string {
  const match = Object.keys(EQUIPMENT_ICONS).find((name) => names.includes(name))
  return match ? EQUIPMENT_ICONS[match] : 'fitness_center'
}

// Admins may paste any of the usual YouTube URL shapes, so accept them all.
function parseYouTubeId(...urls: (string | null | undefined)[]): string | null {
  for (const url of urls) {
    const match = url?.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([\w-]{11})/)
    if (match) return match[1]
  }
  return null
}

function parseSteps(instructions: string | null): ExerciseStep[] {
  return (instructions ?? '')
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
    .map((body, index) => ({ title: `Step ${index + 1}`, body }))
}

export function toExercise(raw: ExerciseDto): Exercise {
  const muscleGroups = raw.muscle_groups.map((group) => group.name)
  const primaryMuscles = raw.muscle_groups.filter((group) => group.pivot.role === 'primary').map((group) => group.name)
  const equipment = raw.equipment.map((item) => item.name)
  const videoId = parseYouTubeId(raw.video_url, raw.media.find((item) => item.type === 'video')?.url)
  const image = raw.thumbnail_url ?? ''

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? '',
    instructions: raw.instructions ?? '',
    difficulty: capitalize(raw.difficulty),
    category: titleCase(raw.exercise_type),
    videoId,
    videoUrl: raw.video_url ?? '',
    thumbnailUrl: raw.thumbnail_url ?? '',
    image,
    // `image` is YouTube's hqdefault: 4:3 with the frame letterboxed inside.
    // mqdefault is natively 16:9 and always exists (unlike maxresdefault).
    imageWide: videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : image,
    icon: iconForEquipment(equipment),
    muscleGroups,
    primaryMuscles: primaryMuscles.join(', ') || muscleGroups[0] || '',
    equipment: equipment.join(', '),
    steps: parseSteps(raw.instructions),
  }
}

export function toExerciseForm(exercise: Exercise): ExerciseForm {
  return {
    name: exercise.name,
    description: exercise.description,
    instructions: exercise.instructions,
    muscleGroups: exercise.muscleGroups,
    equipmentList: splitList(exercise.equipment),
    difficulty: exercise.difficulty,
    category: exercise.category,
    primaryMuscles: exercise.primaryMuscles,
    videoUrl: exercise.videoUrl,
    thumbnailUrl: exercise.thumbnailUrl,
  }
}

export function toExerciseRequest(form: ExerciseForm): ExerciseRequest {
  const primary = splitList(form.primaryMuscles)

  return {
    name: form.name,
    description: form.description,
    instructions: form.instructions,
    difficulty: toSlug(form.difficulty) as DifficultyValue,
    exercise_type: toSnake(form.category) as ExerciseCategoryValue,
    muscle_groups: form.muscleGroups.map(toSlug),
    // Anything named here gets the `primary` role, everything else `secondary`.
    primary_muscles: (primary.length ? primary : form.muscleGroups.slice(0, 1)).map(toSlug),
    equipment: form.equipmentList.map(toSlug),
    // The API validates these as URLs, so an empty string would be rejected.
    ...(form.videoUrl ? { video_url: form.videoUrl } : {}),
    ...(form.thumbnailUrl ? { thumbnail_url: form.thumbnailUrl } : {}),
  }
}

export const exerciseService = {
  list: (query: ExerciseQuery, signal?: AbortSignal) =>
    get<PagedDto<ExerciseDto>>(endpoints.exercises.list, { ...query }, signal).then((res) => toPage(res, toExercise)),
  show: (key: string) => get<ExerciseDto>(endpoints.exercises.show(key)).then(toExercise),
}
