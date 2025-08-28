import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Website from './website.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import SerpResponse from './serp_response.js'

export default class Prompt extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare query: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare provider: 'google' | 'bing' | 'duckduckgo' | 'yahoo'

  @column()
  declare schedule: 'daily' | 'weekly' | 'monthly' | 'annually'

  @column()
  declare websiteId: string

  @belongsTo(() => Website)
  declare website: BelongsTo<typeof Website>

  @hasOne(() => SerpResponse)
  declare serpResponses: HasOne<typeof SerpResponse>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(prompt: Prompt) {
    prompt.id = randomUUID()
  }
}
