import * as z from 'zod'
import { msg, optionalHttpUrl, requiredText } from './shared'

export const ARTICLE_TITLE_MAX = 255

/** A new article needs a body; on edit a blank body keeps the current one. */
export const adminArticleSchema = (isNew: boolean) =>
  z.object({
    title: requiredText('common.titleIsRequired', ARTICLE_TITLE_MAX),
    body: isNew ? z.string().trim().min(1, msg('admin.articles.writeTheArticleBody')) : z.string().trim(),
    category: z.string().min(1, msg('validation.required')),
    status: z.enum(['Draft', 'Published']),
    imageUrl: optionalHttpUrl(),
  })

/** Also the `ArticleForm` the admin service sends (types/articles.ts). */
export type AdminArticleValues = z.infer<ReturnType<typeof adminArticleSchema>>
