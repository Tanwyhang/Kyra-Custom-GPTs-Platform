/*
  # Fix Users Table RLS Policies

  1. Policy Updates
    - Update INSERT policy to use correct auth.uid() function
    - Update SELECT policies to use correct auth.uid() function  
    - Update UPDATE policy to use correct auth.uid() function
    - Ensure policies allow users to manage their own profiles

  2. Security
    - Maintain RLS protection while allowing proper user profile management
    - Fix authentication context issues during signup and profile access
*/

-- Drop existing policies that may have incorrect function references
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can read public user info" ON users;

-- Create corrected policies with proper auth.uid() function
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read public user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);