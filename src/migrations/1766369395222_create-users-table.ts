import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE users (
        id TEXT NOT NULL,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL,
        profile_photo TEXT NOT NULL,
        provider TEXT NOT NULL
    );
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE users`);
}
