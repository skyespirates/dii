import pool from "../infra/db";
import { Users } from "../types";

export async function getUser(id: string): Promise<Users> {
  const result = await pool.query<Users>(
    "SELECT id, display_name, email, profile_photo, provider FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

export async function createUser(u: Users): Promise<Users> {
  const args: string[] = [
    u.id,
    u.display_name,
    u.email,
    u.profile_photo,
    u.provider,
  ];
  const result = await pool.query<Users>(
    "INSERT INTO users (id, display_name, email, profile_photo, provider) VALUES ($1, $2, $3, $4, $5) RETURNING id, display_name, email, profile_photo, provider",
    args
  );
  return result.rows[0];
}
