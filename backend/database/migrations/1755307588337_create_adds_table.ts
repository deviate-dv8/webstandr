import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prompts'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('user_id').references('users.id').notNullable().onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('user_id')
    })
  }
}
