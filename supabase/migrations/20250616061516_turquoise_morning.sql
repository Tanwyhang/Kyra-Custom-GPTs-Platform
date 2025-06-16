/*
  # Fix RLS policies for users table

  1. Security Changes
    - Drop existing restrictive policies that prevent user profile creation
    - Add policy for users to insert their own profile during sign-up
    - Add policy for users to read their own profile data
    - Add policy for users to update their own profile data
    - Keep existing policy for reading public user info (display names, avatars)

  2. Changes Made
    - Enable authenticated users to create profiles with their own auth.uid()
    - Allow users to read their own complete profile data
    - Allow users to update their own profile information
    - Maintain public read access for basic user info needed for the app
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Policy for users to insert their own profile during sign-up
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for users to read their own complete profile data
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own profile data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the existing policy for public user info (this should already exist)
-- This allows reading display names, avatars, etc. for public display
-- CREATE POLICY "Anyone can read public user info" ON users FOR SELECT TO authenticated USING (true);