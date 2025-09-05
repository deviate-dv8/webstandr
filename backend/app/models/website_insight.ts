import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import Website from './website.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'

export default class WebsiteInsight extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare performance: number

  @column()
  declare accessibility: number

  @column()
  declare bestPractices: number

  @column()
  declare seo: number

  @column()
  declare websiteId: string

  @belongsTo(() => Website)
  declare website: BelongsTo<typeof Website>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignId(websiteInsight: WebsiteInsight) {
    websiteInsight.id = randomUUID()
  }
}
