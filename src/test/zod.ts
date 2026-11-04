import type * as z from 'zod'

/** The first message per field path (`''` for the root), or null when the value is valid. */
export function errorsOf(schema: z.ZodType, value: unknown): Record<string, string> | null {
  const result = schema.safeParse(value)
  if (result.success) return null
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    errors[key] ??= issue.message
  }
  return errors
}

/** The parsed output; throws with the issues when the value is invalid. */
export function parse<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value)
  if (!result.success) throw new Error(JSON.stringify(result.error.issues, null, 2))
  return result.data
}
