import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'websites'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.unique(['url', 'user_id'])
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropUnique(['url', 'user_id'])
    })
  }
}
