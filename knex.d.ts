/* eslint-disable no-unused-vars */
declare module "knex" {
  interface TableBuilder {
    uuid(name: string): TableBuilder;
    primary(columns?: string[]): TableBuilder;
    string(name: string): TableBuilder;
    text(name: string): TableBuilder;
    notNullable(): TableBuilder;
    defaultTo(value: string | boolean | Date): TableBuilder;
    timestamp(name: string): TableBuilder;
    boolean(name: string): TableBuilder;
  }

  export interface SchemaBuilder {
    createTable(tableName: string, callback: (table: TableBuilder) => void): Promise<void>;
    dropTableIfExists(tableName: string): Promise<void>;
  }

  export interface Knex {
    schema: SchemaBuilder;
    fn: {
      now(): Date;
    };
  }

  export default function (config?: unknown): Knex;
}
