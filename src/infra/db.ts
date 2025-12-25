import { Pool } from "pg";
import { env } from "../configs/env";

const pool = new Pool({
  connectionString:
    env.MODE === "dev"
      ? "postgresql://postgres:bmwb1gtr@localhost/access_management"
      : env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

export default pool;
