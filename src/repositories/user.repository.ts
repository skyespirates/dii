import pool from "../infra/db";
import { GoogleUser } from "../types";

export async function getUser(id: string): Promise<GoogleUser> {
  const result = await pool.query<GoogleUser>(
    "SELECT * FROM users WHERE google_id = $1",
    [id]
  );
  return result.rows[0];
}

export async function createUser(u: GoogleUser): Promise<GoogleUser> {
  const args: string[] = [
    u.google_id,
    u.display_name,
    u.email,
    u.profile_photo,
  ];
  const result = await pool.query<GoogleUser>(
    "INSERT INTO users (google_id, display_name, email, profile_photo) VALUES ($1, $2, $3, $4) RETURNING google_id, display_name, email, profile_photo",
    args
  );
  return result.rows[0];
}
