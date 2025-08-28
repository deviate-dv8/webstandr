import vine from '@vinejs/vine'

export const createWebsiteValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64),
    url: vine
      .string()
      .toLowerCase()
      .url()
      .maxLength(255)
      .unique({
        table: 'websites',
        column: 'url',
        filter: (db, _, field) => {
          db.where('user_id', field.meta.userId)
        },
      }),
    description: vine.string().maxLength(512).optional(),
    icon: vine.string().maxLength(255).optional(),
  })
)

export const updateWebsiteValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(64).optional(),
    url: vine
      .string()
      .toLowerCase()
      .url()
      .maxLength(255)
      .unique({
        table: 'websites',
        column: 'url',
        filter: (db, _, field) => {
          db.where('user_id', field.meta.userId)
        },
      })
      .optional(),
    description: vine.string().maxLength(512).optional(),
    icon: vine.string().maxLength(255).optional(),
  })
)

export const listWebsitesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(1).max(100).optional(),
    search: vine.string().trim().toLowerCase().maxLength(255).optional(),
    searchBy: vine.enum(['name', 'url']).optional(),
  })
)

export const validateUrl = vine.compile(
  vine.object({
    search: vine.string().toLowerCase().url().maxLength(255),
  })
)
