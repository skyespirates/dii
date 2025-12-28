export interface Employee {
  employee_id: number;
  username: string;
  password: string;
  fullname?: string;
  is_active: string;
}

export type Role = {
  role_id: number;
  name: string;
};

export interface TokenPayload {
  employee_id: number | string;
  role_id?: number;
  roles?: number[];
  role?: string;
  iat?: number;
  exp?: number;
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

export interface InsertedId {
  menu_id: number;
}

export interface Roles {
  role_id: number;
  name: string;
  description?: string;
}

export interface UserRole {
  employee_id: number;
  username: string;
  role_id: number;
  role_name: string;
}

export type Users = {
  id: string;
  display_name: string;
  email: string;
  profile_photo: string;
  provider: "google" | "github";
};
