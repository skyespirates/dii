import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE users (
        id  VARCHAR(64) NOT NULL,
        display_name  VARCHAR(64) NOT NULL,
        email VARCHAR(64) NOT NULL,
        profile_photo VARCHAR(255) NOT NULL
    );
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE users`);
}
