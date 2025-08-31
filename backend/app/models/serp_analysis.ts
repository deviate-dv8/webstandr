import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import SerpResponse from './serp_response.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class SerpAnalysis extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare highestRankedResult: number | null

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
}
