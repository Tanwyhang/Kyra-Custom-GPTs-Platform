/*
  # Remove Authentication System

  This migration removes all authentication-related dependencies from the database schema
  to support the new no-auth system.

  ## Changes Made

  1. **Drop RLS Policies**: Remove all Row Level Security policies that depend on auth.uid()
  2. **Disable RLS**: Turn off Row Level Security on all tables
  3. **Update Tables**: Remove user-specific constraints and foreign keys
  4. **Simplify Schema**: Make the system work without authentication

  ## Security Notes
  
  - This removes all authentication-based security
  - Tables are now publicly accessible
  - Consider implementing application-level security if needed
*/

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Anyone can read verified models" ON models;
DROP POLICY IF EXISTS "Users can read own models" ON models;
DROP POLICY IF EXISTS "Users can create models" ON models;
DROP POLICY IF EXISTS "Users can update own models" ON models;
DROP POLICY IF EXISTS "Admins can verify models" ON models;
DROP POLICY IF EXISTS "Users can create download records" ON model_downloads;
DROP POLICY IF EXISTS "Users can read own downloads" ON model_downloads;
DROP POLICY IF EXISTS "Model owners can see their model downloads" ON model_downloads;

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE models DISABLE ROW LEVEL SECURITY;
ALTER TABLE model_downloads DISABLE ROW LEVEL SECURITY;

-- Make uploader_id nullable in models table since we don't have user authentication
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'models' AND column_name = 'uploader_id'
  ) THEN
    ALTER TABLE models ALTER COLUMN uploader_id DROP NOT NULL;
  END IF;
END $$;

-- Make user_id nullable in model_downloads table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'model_downloads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE model_downloads ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Add a simple public access policy (optional, for future use)
-- This allows anyone to read, insert, update, and delete from all tables
-- You can customize this based on your needs

-- For users table - allow all operations
CREATE POLICY "Public access" ON users FOR ALL TO public USING (true) WITH CHECK (true);

-- For models table - allow all operations
CREATE POLICY "Public access" ON models FOR ALL TO public USING (true) WITH CHECK (true);

-- For model_downloads table - allow all operations
CREATE POLICY "Public access" ON model_downloads FOR ALL TO public USING (true) WITH CHECK (true);

-- Re-enable RLS with public policies (optional)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_downloads ENABLE ROW LEVEL SECURITY;