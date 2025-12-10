CREATE TABLE employee_roles (
    employee_id INT NOT NULL,
    role_id INT NOT NULL,

    CONSTRAINT fk_employee
        FOREIGN KEY (employee_id) 
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role
        FOREIGN KEY (role_id) 
        REFERENCES roles(role_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_employee_role
        UNIQUE (employee_id, role_id)
);