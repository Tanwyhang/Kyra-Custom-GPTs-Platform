/*
  # Model Publishing System Database Schema

  1. New Tables
    - `published_models` - Main model metadata and publishing requirements
    - `model_versions` - Version control for models
    - `model_validations` - Validation results and test data
    - `model_samples` - Sample inputs/outputs and test cases
    - `model_download_logs` - Download tracking and analytics
    - `model_ratings` - User ratings and reviews

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to approved models
    - Add policies for model submission and rating

  3. Performance
    - Add indexes for common query patterns
    - Add triggers for automatic updates
*/

-- Published Models Table
CREATE TABLE IF NOT EXISTS published_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  version varchar(20) NOT NULL DEFAULT '1.0.0',
  description text NOT NULL,
  category varchar(50) NOT NULL,
  tags text[] DEFAULT '{}',
  
  -- Publishing Requirements
  license_type varchar(50) NOT NULL,
  license_text text,
  documentation_url text,
  repository_url text,
  
  -- Model Configuration
  system_prompt text NOT NULL,
  default_temperature numeric(3,2) DEFAULT 0.7 CHECK (default_temperature >= 0 AND default_temperature <= 1),
  default_top_p numeric(3,2) DEFAULT 0.9 CHECK (default_top_p >= 0 AND default_top_p <= 1),
  default_max_tokens integer DEFAULT 1024 CHECK (default_max_tokens > 0 AND default_max_tokens <= 4096),
  
  -- Knowledge Enhancement
  knowledge_context text,
  knowledge_files jsonb DEFAULT '[]',
  
  -- Validation Status
  validation_status varchar(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validating', 'approved', 'rejected', 'needs_revision')),
  validation_notes text,
  
  -- Performance Metrics
  accuracy_score numeric(5,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  response_time_ms integer,
  token_efficiency numeric(5,2),
  
  -- Publishing Info
  publisher_name varchar(100),
  publisher_email varchar(255),
  is_public boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  download_count integer DEFAULT 0,
  rating_average numeric(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  
  -- Constraints
  UNIQUE(name, version)
);

-- Model Versions Table
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES published_models(id) ON DELETE CASCADE,
  version varchar(20) NOT NULL,
  changelog text,
  is_current boolean DEFAULT false,
  
  -- Version-specific configuration
  system_prompt text NOT NULL,
  default_config jsonb NOT NULL,
  
  -- Validation for this version
  validation_status varchar(20) DEFAULT 'pending',
  validation_results jsonb,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(model_id, version)
);

-- Model Validations Table
CREATE TABLE IF NOT EXISTS model_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES published_models(id) ON DELETE CASCADE,
  version_id uuid REFERENCES model_versions(id) ON DELETE CASCADE,
  
  -- Validation Details
  validation_type varchar(50) NOT NULL, -- 'automated', 'manual', 'performance', 'safety'
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'skipped')),
  
  -- Test Results
  test_cases_total integer DEFAULT 0,
  test_cases_passed integer DEFAULT 0,
  test_cases_failed integer DEFAULT 0,
  
  -- Performance Metrics
  avg_response_time_ms numeric(10,2),
  accuracy_score numeric(5,2),
  consistency_score numeric(5,2),
  safety_score numeric(5,2),
  
  -- Detailed Results
  results jsonb,
  error_details text,
  recommendations text,
  
  -- Validation Metadata
  validator_name varchar(100),
  validation_started_at timestamptz,
  validation_completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Model Samples Table
CREATE TABLE IF NOT EXISTS model_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES published_models(id) ON DELETE CASCADE,
  
  -- Sample Details
  sample_type varchar(50) NOT NULL, -- 'input_output', 'prompt_template', 'use_case'
  title varchar(200) NOT NULL,
  description text,
  
  -- Sample Data
  input_data jsonb NOT NULL,
  expected_output jsonb,
  actual_output jsonb,
  
  -- Configuration used for this sample
  config_used jsonb,
  
  -- Validation
  is_validated boolean DEFAULT false,
  validation_score numeric(5,2),
  
  -- Metadata
  tags text[] DEFAULT '{}',
  difficulty_level varchar(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  execution_time_ms integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Model Downloads Tracking (Enhanced)
CREATE TABLE IF NOT EXISTS model_download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES published_models(id) ON DELETE CASCADE,
  
  -- Download Details
  download_type varchar(50) DEFAULT 'full_model', -- 'full_model', 'config_only', 'samples_only'
  user_agent text,
  ip_address inet,
  country_code varchar(2),
  
  -- Usage Tracking
  intended_use varchar(100),
  user_feedback text,
  
  downloaded_at timestamptz DEFAULT now()
);

-- Model Ratings Table
CREATE TABLE IF NOT EXISTS model_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES published_models(id) ON DELETE CASCADE,
  
  -- Rating Details
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  
  -- Reviewer Info (anonymous)
  reviewer_hash varchar(64), -- Hash of user identifier for duplicate prevention
  use_case varchar(100),
  
  -- Helpful votes
  helpful_votes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(model_id, reviewer_hash)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_published_models_category ON published_models(category);
CREATE INDEX IF NOT EXISTS idx_published_models_validation_status ON published_models(validation_status);
CREATE INDEX IF NOT EXISTS idx_published_models_is_public ON published_models(is_public);
CREATE INDEX IF NOT EXISTS idx_published_models_created_at ON published_models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_published_models_download_count ON published_models(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_published_models_rating ON published_models(rating_average DESC);

CREATE INDEX IF NOT EXISTS idx_model_versions_model_id ON model_versions(model_id);
CREATE INDEX IF NOT EXISTS idx_model_versions_is_current ON model_versions(is_current);

CREATE INDEX IF NOT EXISTS idx_model_validations_model_id ON model_validations(model_id);
CREATE INDEX IF NOT EXISTS idx_model_validations_status ON model_validations(status);
CREATE INDEX IF NOT EXISTS idx_model_validations_type ON model_validations(validation_type);

CREATE INDEX IF NOT EXISTS idx_model_samples_model_id ON model_samples(model_id);
CREATE INDEX IF NOT EXISTS idx_model_samples_type ON model_samples(sample_type);
CREATE INDEX IF NOT EXISTS idx_model_samples_validated ON model_samples(is_validated);

CREATE INDEX IF NOT EXISTS idx_model_downloads_model_id ON model_download_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_model_downloads_date ON model_download_logs(downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_ratings_model_id ON model_ratings(model_id);
CREATE INDEX IF NOT EXISTS idx_model_ratings_rating ON model_ratings(rating);

-- Enable RLS
ALTER TABLE published_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read published models" ON published_models
  FOR SELECT TO public USING (is_public = true AND validation_status = 'approved');

CREATE POLICY "Anyone can submit models" ON published_models
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Publishers can update their models" ON published_models
  FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public can read model versions" ON model_versions
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read validations" ON model_validations
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read samples" ON model_samples
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can log downloads" ON model_download_logs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can read download stats" ON model_download_logs
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can rate models" ON model_ratings
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can read ratings" ON model_ratings
  FOR SELECT TO public USING (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_model_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_model_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and count
  UPDATE published_models 
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM model_ratings 
      WHERE model_id = NEW.model_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM model_ratings 
      WHERE model_id = NEW.model_id
    )
  WHERE id = NEW.model_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update download count
  UPDATE published_models 
  SET download_count = download_count + 1
  WHERE id = NEW.model_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_published_models_updated_at
  BEFORE UPDATE ON published_models
  FOR EACH ROW
  EXECUTE FUNCTION update_model_updated_at();

CREATE TRIGGER update_model_samples_updated_at
  BEFORE UPDATE ON model_samples
  FOR EACH ROW
  EXECUTE FUNCTION update_model_updated_at();

CREATE TRIGGER update_rating_on_insert
  AFTER INSERT ON model_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_model_rating();

CREATE TRIGGER update_rating_on_update
  AFTER UPDATE ON model_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_model_rating();

CREATE TRIGGER update_rating_on_delete
  AFTER DELETE ON model_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_model_rating();

CREATE TRIGGER update_download_count_trigger
  AFTER INSERT ON model_download_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

-- Insert sample data for testing
INSERT INTO published_models (
  name, version, description, category, tags,
  license_type, system_prompt,
  default_temperature, default_top_p, default_max_tokens,
  validation_status, publisher_name, is_public, is_featured,
  accuracy_score, download_count, rating_average, rating_count
) VALUES 
(
  'Advanced Code Assistant',
  '1.0.0',
  'A sophisticated AI model specialized in code generation, debugging, and technical documentation. Trained on diverse programming languages and frameworks.',
  'Code Assistant',
  ARRAY['programming', 'code-generation', 'debugging', 'documentation'],
  'MIT',
  'You are an expert programming assistant with deep knowledge of multiple programming languages, frameworks, and best practices. Help users write clean, efficient, and well-documented code. Provide explanations for your solutions and suggest improvements when appropriate.',
  0.3,
  0.8,
  1536,
  'approved',
  'AI Model Hub',
  true,
  true,
  94.5,
  1250,
  4.7,
  89
),
(
  'Creative Writing Companion',
  '1.2.0',
  'An AI model designed for creative writing, storytelling, and content creation. Excels at generating engaging narratives and helping with creative blocks.',
  'Creative Writing',
  ARRAY['creative-writing', 'storytelling', 'content-creation', 'narrative'],
  'Creative Commons',
  'You are a creative writing companion with expertise in storytelling, character development, and narrative structure. Help users craft compelling stories, overcome creative blocks, and explore creative ideas. Be imaginative while maintaining literary quality.',
  0.9,
  0.95,
  2048,
  'approved',
  'Creative AI Labs',
  true,
  true,
  91.2,
  890,
  4.5,
  67
),
(
  'Business Strategy Advisor',
  '1.1.0',
  'A professional AI consultant for business strategy, market analysis, and decision-making support. Provides data-driven insights and actionable recommendations.',
  'Business Assistant',
  ARRAY['business-strategy', 'consulting', 'market-analysis', 'decision-support'],
  'Commercial',
  'You are a senior business consultant with expertise in strategy, operations, marketing, and financial analysis. Provide professional advice, data-driven insights, and actionable recommendations. Focus on practical solutions and measurable outcomes.',
  0.5,
  0.85,
  1280,
  'approved',
  'Business AI Solutions',
  true,
  false,
  89.8,
  567,
  4.3,
  45
);

-- Insert sample validations
INSERT INTO model_validations (
  model_id, validation_type, status, test_cases_total, test_cases_passed,
  avg_response_time_ms, accuracy_score, consistency_score, safety_score,
  validator_name, validation_completed_at
) 
SELECT 
  id,
  'automated',
  'passed',
  100,
  95,
  850.5,
  accuracy_score,
  92.3,
  98.7,
  'AI Validation System',
  now() - interval '1 day'
FROM published_models;

-- Insert sample model samples
INSERT INTO model_samples (
  model_id, sample_type, title, description,
  input_data, expected_output, is_validated, validation_score
)
SELECT 
  pm.id,
  'input_output',
  'Basic Code Generation',
  'Generate a simple function based on requirements',
  '{"prompt": "Create a Python function that calculates the factorial of a number", "language": "python"}',
  '{"code": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)", "explanation": "Recursive implementation of factorial function"}',
  true,
  4.8
FROM published_models pm
WHERE pm.category = 'Code Assistant';