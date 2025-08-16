import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prompts'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.enum('provider', ['google', 'bing', 'duckduckgo', 'yahoo']).defaultTo('google')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('provider')
    })
  }
}
