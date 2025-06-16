/*
  # Fix Users Table RLS Policies

  1. Security Updates
    - Drop all existing restrictive policies on users table
    - Create proper policies for user profile management
    - Ensure users can create, read, and update their own profiles
    - Maintain public read access for display purposes

  2. Policy Changes
    - Allow authenticated users to insert their own profile
    - Allow users to read their own complete profile
    - Allow users to update their own profile
    - Keep public read access for basic user info
*/

-- First, drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can read public user info" ON users;

-- Policy 1: Allow users to insert their own profile during sign-up
-- This is crucial for the sign-up process to work
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own complete profile data
-- This is needed for dashboard and profile management
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile data
-- This enables profile editing functionality
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow reading public user info for display purposes
-- This enables showing user names and avatars throughout the app
CREATE POLICY "Anyone can read public user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);