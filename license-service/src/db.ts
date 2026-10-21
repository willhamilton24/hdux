import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS licenses (
    id          SERIAL PRIMARY KEY,
    key         TEXT        NOT NULL UNIQUE,
    session_id  TEXT        NOT NULL UNIQUE,
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ
  );
`;

export async function migrate(): Promise<void> {
  await pool.query(SCHEMA);
}

export async function createLicense(params: {
  key: string;
  sessionId: string;
  email: string | null;
}): Promise<void> {
  await pool.query(
    `INSERT INTO licenses (key, session_id, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (session_id) DO NOTHING`,
    [params.key, params.sessionId, params.email],
  );
}

export async function findLicenseByKey(key: string): Promise<{
  key: string;
  email: string | null;
  revoked_at: Date | null;
} | null> {
  const result = await pool.query<{
    key: string;
    email: string | null;
    revoked_at: Date | null;
  }>('SELECT key, email, revoked_at FROM licenses WHERE key = $1', [key]);
  return result.rows[0] ?? null;
}

export async function findLicenseBySession(sessionId: string): Promise<{
  key: string;
  email: string | null;
  created_at: Date;
} | null> {
  const result = await pool.query<{
    key: string;
    email: string | null;
    created_at: Date;
  }>('SELECT key, email, created_at FROM licenses WHERE session_id = $1', [sessionId]);
  return result.rows[0] ?? null;
}
