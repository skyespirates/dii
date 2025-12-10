import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "bmwb1gtr",
  database: "access_management",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

export default pool;
