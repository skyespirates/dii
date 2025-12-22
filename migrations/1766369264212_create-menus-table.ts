import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE menus (
        menu_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INT NULL REFERENCES menus(menu_id),
        url VARCHAR(255),
        sort_order INT DEFAULT 0
    );
    
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS menus`);
}
