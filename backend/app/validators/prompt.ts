import vine from '@vinejs/vine'

export const createPromptValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64),
    query: vine.string().minLength(1).maxLength(1024),
    websiteId: vine.string().uuid(),
    provider: vine.enum(['google', 'duckduckgo', 'bing', 'yahoo']).optional(),
  })
)

export const updatePromptvalidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64).optional(),
    query: vine.string().minLength(1).maxLength(1024).optional(),
    websiteId: vine.string().uuid().optional(),
    provider: vine.enum(['google', 'duckduckgo', 'bing', 'yahoo']).optional(),
  })
)
