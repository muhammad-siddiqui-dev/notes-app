import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("notes", (table) => {
    table.uuid("id").primary();
    table.string("user_id").notNullable();
    table.string("title").notNullable();
    table.text("content").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("featured").defaultTo(false);
    table.boolean("visible").defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("notes");
}
