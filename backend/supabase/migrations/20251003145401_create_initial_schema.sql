/*
  # Create Health Platform Database Schema

  ## Overview
  Multi-tenant health platform supporting three systems: Doula Care, Functional Health, and Elderly Care.

  ## 1. New Tables Created

  ### `systems`
  Central table for managing different health platforms (tenants).
  - `id` (uuid, primary key) - Unique system identifier
  - `name` (text, unique) - Human-readable system name
  - `slug` (text, unique) - URL-friendly identifier
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `users`
  User accounts with tenant isolation.
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email for authentication
  - `username` (text, unique) - Display username
  - `password` (text) - Hashed password
  - `language` (text, default 'en') - User preferred language
  - `profile_type` (text) - User profile classification
  - `journey_type` (text) - User journey classification
  - `system_id` (uuid, foreign key) - Links to systems table
  - `created_at`, `updated_at` (timestamptz)

  ### `refresh_tokens`
  JWT refresh token management for authentication.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `token` (text, unique) - Refresh token value
  - `expires_at` (timestamptz) - Token expiration
  - `created_at` (timestamptz)

  ### `system_configs`
  Dynamic configuration key-value pairs per system.
  - `id` (uuid, primary key)
  - `system_id` (uuid, foreign key) - Links to systems table
  - `config_key` (text) - Configuration key name
  - `config_value` (text) - Configuration value
  - `data_type` (text) - Value data type (string, number, boolean, json)
  - `created_at`, `updated_at` (timestamptz)
  - Unique constraint on (system_id, config_key)

  ### `feature_flags`
  Feature toggle system with gradual rollout support.
  - `id` (uuid, primary key)
  - `system_id` (uuid, foreign key) - Links to systems table
  - `flag_name` (text) - Feature flag identifier
  - `is_enabled` (boolean, default false) - Enable/disable flag
  - `rollout_percentage` (integer, default 0) - Gradual rollout (0-100)
  - `created_at`, `updated_at` (timestamptz)
  - Unique constraint on (system_id, flag_name)

  ### `lab_results`
  Lab test PDF uploads and processing tracking.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `system_id` (uuid, foreign key) - Links to systems table
  - `file_name` (text) - Original filename
  - `s3_key` (text) - AWS S3 object key
  - `s3_url` (text) - AWS S3 access URL
  - `uploaded_at` (timestamptz, default now) - Upload timestamp
  - `processing_status` (text, default 'pending') - Status: pending, processing, completed, failed
  - `raw_ocr_text` (text, nullable) - Extracted text from Tesseract.js
  - `created_at`, `updated_at` (timestamptz)

  ### `biomarkers`
  Parsed biomarker data from lab results.
  - `id` (uuid, primary key)
  - `lab_result_id` (uuid, foreign key) - Links to lab_results table
  - `test_name` (text) - Biomarker test name
  - `value` (text) - Test result value
  - `unit` (text, nullable) - Measurement unit
  - `reference_range_low` (text, nullable) - Lower reference range
  - `reference_range_high` (text, nullable) - Upper reference range
  - `test_date` (timestamptz, nullable) - Date of test
  - `notes` (text, nullable) - Additional notes
  - `created_at`, `updated_at` (timestamptz)

  ### `action_plans`
  Health action plans for users.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `system_id` (uuid, foreign key) - Links to systems table
  - `title` (text) - Action plan title
  - `description` (text, nullable) - Detailed description
  - `status` (text, default 'active') - Status: active, completed, archived
  - `created_at`, `updated_at` (timestamptz)

  ### `action_items`
  Individual tasks within action plans.
  - `id` (uuid, primary key)
  - `action_plan_id` (uuid, foreign key) - Links to action_plans table
  - `title` (text) - Task title
  - `description` (text, nullable) - Task details
  - `due_date` (timestamptz, nullable) - Task deadline
  - `completed_at` (timestamptz, nullable) - Completion timestamp
  - `priority` (text, default 'medium') - Priority: low, medium, high
  - `created_at`, `updated_at` (timestamptz)

  ## 2. Security
  - All foreign keys configured with CASCADE DELETE for data integrity
  - Indexes added on foreign keys and frequently queried fields
  - Unique constraints on critical fields (emails, usernames, system slugs)

  ## 3. Data Isolation
  - Multi-tenancy enforced via system_id on all relevant tables
  - Users, lab results, and action plans scoped to specific systems

  ## 4. Notes
  - UUIDs used for all primary keys (security and distributed systems)
  - Timestamps track creation and updates
  - Default values set for status fields and configuration
  - Text fields used for flexible data storage (JSON parsing in application layer)
*/

-- Create systems table
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  profile_type TEXT NOT NULL,
  journey_type TEXT NOT NULL,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_system_id ON users(system_id);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Create system_configs table
CREATE TABLE IF NOT EXISTS system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value TEXT NOT NULL,
  data_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(system_id, config_key)
);

CREATE INDEX IF NOT EXISTS idx_system_configs_system_id ON system_configs(system_id);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false NOT NULL,
  rollout_percentage INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(system_id, flag_name)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_system_id ON feature_flags(system_id);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  s3_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processing_status TEXT DEFAULT 'pending' NOT NULL,
  raw_ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_system_id ON lab_results(system_id);

-- Create biomarkers table
CREATE TABLE IF NOT EXISTS biomarkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_result_id UUID NOT NULL REFERENCES lab_results(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range_low TEXT,
  reference_range_high TEXT,
  test_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_biomarkers_lab_result_id ON biomarkers(lab_result_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_test_name ON biomarkers(test_name);

-- Create action_plans table
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_action_plans_user_id ON action_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_system_id ON action_plans(system_id);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_action_items_action_plan_id ON action_items(action_plan_id);
