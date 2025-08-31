import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import SerpResponse from './serp_response.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class SerpResult extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare link: string

  @column()
  declare description: string

  @column()
  declare rank: number

  @column()
  declare domain: string

  @column()
  declare serpResponseId: string

  @belongsTo(() => SerpResponse)
  declare serpResponse: BelongsTo<typeof SerpResponse>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(serpResult: SerpResult) {
    serpResult.id = randomUUID()
  }
}
