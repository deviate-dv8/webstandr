import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import SerpResponse from './serp_response.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class SerpAnalysis extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare highestRank: number | null

  @column()
  declare averageRank: number | null

  @column()
  declare frequency: number

  @column()
  declare serpResponseId: string

  @belongsTo(() => SerpResponse)
  declare serpResponse: BelongsTo<typeof SerpResponse>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(serpAnalysis: SerpAnalysis) {
    serpAnalysis.id = randomUUID()
  }
}
