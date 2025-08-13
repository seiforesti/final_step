-- Initialize Data Governance Database
-- This script sets up the initial database structure

-- Create the main database if it doesn't exist
-- (PostgreSQL will create it automatically based on POSTGRES_DB env var)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas for different data governance domains
CREATE SCHEMA IF NOT EXISTS data_classification;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS quality;
CREATE SCHEMA IF NOT EXISTS lineage;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS orchestration;

-- Set search path
SET search_path TO public, data_classification, compliance, security, quality, lineage, analytics, orchestration;

-- Create initial tables (basic structure)
-- These will be populated by SQLModel/SQLAlchemy when the app starts

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Data Governance Database initialized successfully';
    RAISE NOTICE 'Schemas created: data_classification, compliance, security, quality, lineage, analytics, orchestration';
END $$;
