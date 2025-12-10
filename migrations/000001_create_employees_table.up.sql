CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(96),
    is_active BOOLEAN DEFAULT true
);