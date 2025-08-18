import vine from '@vinejs/vine'

export const searchValidator = vine.compile(
  vine.object({
    query: vine.string().minLength(1).maxLength(1024),
    provider: vine.enum(['google', 'bing', 'duckduckgo', 'yahoo']),
  })
)
