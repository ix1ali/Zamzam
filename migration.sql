-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Sessions table for server-side session management
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Login attempts table for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  username TEXT PRIMARY KEY,
  attempt_count INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table (blocks anon key access, service role key bypasses)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to users" ON users;
CREATE POLICY "No public access to users" ON users FOR ALL USING (false);

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to sessions" ON sessions;
CREATE POLICY "No public access to sessions" ON sessions FOR ALL USING (false);

-- Enable RLS on login_attempts table
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to login_attempts" ON login_attempts;
CREATE POLICY "No public access to login_attempts" ON login_attempts FOR ALL USING (false);
