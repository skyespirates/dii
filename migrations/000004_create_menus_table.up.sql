CREATE TABLE menus (
    menu_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL REFERENCES menus(menu_id),
    url VARCHAR(255),
    sort_order INT DEFAULT 0
);
