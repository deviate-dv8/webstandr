import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique({
      table: 'users',
      column: 'email',
    }),
    full_name: vine.string().minLength(4).maxLength(32).nullable().optional(),
    username: vine.string().minLength(4).maxLength(32).unique({
      table: 'users',
      column: 'username',
    }),
    password: vine.string().minLength(8),
  })
)
