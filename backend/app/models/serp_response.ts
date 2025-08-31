import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Prompt from './prompt.js'
import SerpResult from './serp_result.js'
import SerpAnalysis from './serp_analysis.js'

export default class SerpResponse extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare requestId: string

  @column()
  declare success: boolean

  @column()
  declare provider: 'google' | 'bing' | 'yahoo' | 'duckduckgo'

  @column()
  declare query: string

  @column()
  declare promptId: string

  @belongsTo(() => Prompt)
  declare prompt: BelongsTo<typeof Prompt>

  @hasMany(() => SerpResult)
  declare serpResults: HasMany<typeof SerpResult>

  @hasOne(() => SerpAnalysis)
  declare serpAnalysis: HasOne<typeof SerpAnalysis>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(serpResponse: SerpResponse) {
    serpResponse.id = randomUUID()
  }
}
