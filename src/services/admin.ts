import { endpoints } from './endpoints'
import { del, get, patch, post, put } from './http'
import type { ActivityDto, AdminQuery, AdminStatsDto, AdminUser, AdminUserRequest, UserForm } from '../types/admin'
import { toArticle, toArticleRequest } from './articles'
import type { ArticleDto, ArticleForm } from '../types/articles'
import type { UserDto } from '../types/auth'
import { toExercise, toExerciseRequest } from './exercises'
import type { ExerciseDto, ExerciseForm } from '../types/exercises'
import { toProgramme, toRoutine, toRoutineRequest } from './routines'
import type { RoutineDto, RoutineForm } from '../types/routines'
import { capitalize, toPage, toSlug } from './shared'
import type { PagedDto, UserRole } from '../types/shared'

export function toAdminUser(raw: UserDto): AdminUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: capitalize(raw.role),
    status: raw.is_active ? 'Active' : 'Suspended',
    joined: raw.created_at.slice(0, 10),
  }
}

export function toUserRequest(form: UserForm): AdminUserRequest {
  return {
    name: form.name,
    email: form.email,
    role: toSlug(form.role) as UserRole,
    is_active: form.status === 'Active',
  }
}

export const adminService = {
  stats: () => get<AdminStatsDto>(endpoints.admin.stats),
  activity: () => get<ActivityDto[]>(endpoints.admin.activity),

  exercises: {
    list: (query: AdminQuery, signal?: AbortSignal) =>
      get<PagedDto<ExerciseDto>>(endpoints.admin.exercises.list, { ...query }, signal).then((res) => toPage(res, toExercise)),
    create: (form: ExerciseForm) => post<ExerciseDto>(endpoints.admin.exercises.list, toExerciseRequest(form)),
    update: (id: number, form: ExerciseForm) => put<ExerciseDto>(endpoints.admin.exercises.item(id), toExerciseRequest(form)),
    remove: (id: number) => del<unknown>(endpoints.admin.exercises.item(id)),
  },

  routines: {
    list: (query: AdminQuery, signal?: AbortSignal) =>
      get<PagedDto<RoutineDto>>(endpoints.admin.routines.list, { ...query }, signal).then((res) => toPage(res, toRoutine)),
    /** The full programme, for the day builder. */
    programme: (id: number) => get<RoutineDto>(endpoints.admin.routines.item(id)).then(toProgramme),
    create: (form: RoutineForm) => post<RoutineDto>(endpoints.admin.routines.list, toRoutineRequest(form)),
    update: (id: number, form: RoutineForm) => put<RoutineDto>(endpoints.admin.routines.item(id), toRoutineRequest(form)),
    remove: (id: number) => del<unknown>(endpoints.admin.routines.item(id)),
  },

  articles: {
    list: (query: AdminQuery, signal?: AbortSignal) =>
      get<PagedDto<ArticleDto>>(endpoints.admin.articles.list, { ...query }, signal).then((res) => toPage(res, toArticle)),
    create: (form: ArticleForm) => post<ArticleDto>(endpoints.admin.articles.list, toArticleRequest(form)),
    update: (id: number, form: ArticleForm) => put<ArticleDto>(endpoints.admin.articles.item(id), toArticleRequest(form)),
    remove: (id: number) => del<unknown>(endpoints.admin.articles.item(id)),
  },

  users: {
    list: (query: AdminQuery, signal?: AbortSignal) =>
      get<PagedDto<UserDto>>(endpoints.admin.users.list, { ...query }, signal).then((res) => toPage(res, toAdminUser)),
    create: (form: UserForm) => post<UserDto>(endpoints.admin.users.list, toUserRequest(form)),
    update: (id: number, form: UserForm) => put<UserDto>(endpoints.admin.users.item(id), toUserRequest(form)),
    remove: (id: number) => del<unknown>(endpoints.admin.users.item(id)),
    toggleActive: (id: number) => patch<UserDto>(endpoints.admin.users.toggleActive(id)),
  },
}
