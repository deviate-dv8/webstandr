import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'serp_results'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.text('link').alter()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.string('link').alter()
    })
  }
}
