-- Perfume Architect Pro Database Initialization
-- This file is executed when the PostgreSQL container starts for the first time

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database is already created by POSTGRES_DB env variable
-- User is already created by POSTGRES_USER env variable

-- Grant all privileges to dataverse user
GRANT ALL PRIVILEGES ON DATABASE dataverse TO dataverse;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dataverse;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dataverse;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE '🌸 Perfume Architect Pro database initialized successfully!';
  RAISE NOTICE '   Database: dataverse';
  RAISE NOTICE '   User: dataverse';
  RAISE NOTICE '   Extensions: uuid-ossp';
END $$;
