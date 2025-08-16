import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'websites'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.enum('type', ['personal', 'competitor']).defaultTo('personal')
      table.integer('user_id').notNullable().alter()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('type')
      table.integer('user_id').alter().nullable()
    })
  }
}
