/*
  # AI Model Hub Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
    
    - `models`
      - `id` (uuid, primary key)
      - `uploader_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `model_type` (text)
      - `framework` (text)
      - `tags` (text array)
      - `accuracy` (numeric)
      - `file_url` (text)
      - `file_size` (bigint)
      - `is_verified` (boolean, default false)
      - `download_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create bucket for model files
    - Set up RLS policies

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-only policies for verification
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  model_type text NOT NULL,
  framework text NOT NULL,
  tags text[] DEFAULT '{}',
  accuracy numeric CHECK (accuracy >= 0 AND accuracy <= 100),
  file_url text,
  file_size bigint,
  is_verified boolean DEFAULT false,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create model_downloads table for tracking
CREATE TABLE IF NOT EXISTS model_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  downloaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_downloads ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read public user info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Models policies
CREATE POLICY "Anyone can read verified models"
  ON models
  FOR SELECT
  TO authenticated
  USING (is_verified = true);

CREATE POLICY "Users can read own models"
  ON models
  FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Users can create models"
  ON models
  FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can update own models"
  ON models
  FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins can verify models"
  ON models
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Model downloads policies
CREATE POLICY "Users can create download records"
  ON model_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own downloads"
  ON model_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Model owners can see their model downloads"
  ON model_downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_downloads.model_id
      AND models.uploader_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS models_uploader_id_idx ON models(uploader_id);
CREATE INDEX IF NOT EXISTS models_created_at_idx ON models(created_at DESC);
CREATE INDEX IF NOT EXISTS models_is_verified_idx ON models(is_verified);
CREATE INDEX IF NOT EXISTS models_model_type_idx ON models(model_type);
CREATE INDEX IF NOT EXISTS models_framework_idx ON models(framework);
CREATE INDEX IF NOT EXISTS model_downloads_model_id_idx ON model_downloads(model_id);
CREATE INDEX IF NOT EXISTS model_downloads_user_id_idx ON model_downloads(user_id);

-- Create storage bucket for models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('models', 'models', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload models"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'models');

CREATE POLICY "Users can read model files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'models');

CREATE POLICY "Users can update own model files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for models table
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();