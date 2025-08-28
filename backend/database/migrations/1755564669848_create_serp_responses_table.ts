import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'serp_responses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('request_id').notNullable()
      table.boolean('success').notNullable().defaultTo(false)
      table.enum('provider', ['google', 'bing', 'yahoo', 'duckduckgo']).notNullable()
      table.string('query').notNullable()
      table.uuid('prompt_id').references('prompts.id').onDelete('CASCADE').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
