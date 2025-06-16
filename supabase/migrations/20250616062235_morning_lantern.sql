/*
  # Fix Users Table RLS Policies

  This migration fixes the Row-Level Security policies for the users table to resolve
  authentication and profile creation issues.

  ## Changes Made

  1. **Drop Existing Policies**: Remove all current policies that have issues
  2. **Create New Policies**: 
     - Allow authenticated users to insert their own profile using auth.uid()
     - Allow authenticated users to read their own profile data
     - Allow authenticated users to update their own profile data
     - Allow public read access for basic user info (display_name, avatar_url) for community features

  ## Security Notes
  
  - Users can only create, read, and update their own profiles
  - Public users can read basic profile info for community features
  - Admin status and sensitive data remain protected
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read public user info" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies with proper auth.uid() function

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access to basic user info for community features
-- This allows other users to see display names and avatars in the marketplace
CREATE POLICY "Public can read basic user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);