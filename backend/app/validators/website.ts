import vine from '@vinejs/vine'

export const createWebsiteValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64),
    url: vine.string().url().maxLength(255),
    description: vine.string().maxLength(512).optional(),
    icon: vine.string().maxLength(255).optional(),
  })
)

export const updateWebsiteValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64).optional(),
    url: vine.string().url().maxLength(255).optional(),
    description: vine.string().maxLength(512).optional(),
    icon: vine.string().maxLength(255).optional(),
  })
)
