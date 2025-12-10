export interface Empoyee {
  id: number;
  username: string;
  password: string;
  fullname?: string;
  is_active: boolean;
}

export interface TokenPayload {
  employee_id: number;
  role: string;
}
