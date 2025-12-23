import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE role_menus (
        role_id INT NOT NULL,
        menu_id INT NOT NULL,
        PRIMARY KEY (role_id, menu_id),
    
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menus(menu_id) ON DELETE CASCADE
    );
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`DROP TABLE IF EXISTS role_menus`);
}
