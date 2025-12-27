import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE employees (
        employee_id SERIAL PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullname VARCHAR(96),
        is_active BOOLEAN DEFAULT true,
        CONSTRAINT uq_username UNIQUE (username)
    );
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql("DROP TABLE IF EXISTS employees");
}
