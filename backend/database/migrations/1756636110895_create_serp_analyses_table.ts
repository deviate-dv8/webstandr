import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'serp_analyses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.integer('highest_rank').nullable() // Added this because the result may not include the website
      table.integer('average_rank').nullable() // Average rank of the website in the results
      table.integer('frequency').defaultTo(0) // How many times the website appears in the results
      table
        .uuid('serp_response_id')
        .references('serp_responses.id')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
