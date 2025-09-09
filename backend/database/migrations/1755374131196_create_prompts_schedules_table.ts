import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prompts'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.enum('schedule', ['daily', 'weekly', 'monthly', 'annually']).defaultTo('daily')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('schedule')
    })
  }
}
