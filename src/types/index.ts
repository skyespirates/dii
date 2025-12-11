export interface Employee {
  employee_id: number;
  username: string;
  password: string;
  fullname?: string;
  is_active: string;
}

export interface TokenPayload {
  employee_id: number;
  role_id: number;
  role: string;
}

export interface EmployeeRole {
  employee_id: number;
  username: string;
  password: string;
  role_id: number;
  role_name: string;
}

export interface EmployeeRow {
  employee_id: number;
  username: string;
  role_id: number;
  role_name: string;
}

export interface Menu {
  menu_id: number;
  name: string;
  parent_id: number;
  url: string;
  sort_order: number;
}
