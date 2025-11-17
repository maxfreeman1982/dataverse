-- ═══════════════════════════════════════════════════════════════════
-- PERFUME ARCHITECT PRO - DATABASE SETUP SCRIPT
-- ═══════════════════════════════════════════════════════════════════

-- Créer la base de données
CREATE DATABASE dataverse;

-- Créer l'utilisateur
CREATE USER dataverse WITH PASSWORD 'dataverse';

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE dataverse TO dataverse;

-- Se connecter à la base de données (à exécuter séparément)
\c dataverse

-- Activer les extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching pour recherche fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- Index GIN pour meilleure performance

-- Accorder les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO dataverse;
GRANT ALL ON ALL TABLES IN SCHEMA public TO dataverse;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO dataverse;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO dataverse;

-- Configuration par défaut
ALTER DATABASE dataverse SET timezone TO 'UTC';

COMMENT ON DATABASE dataverse IS 'Perfume Architect Pro - Professional AI-Powered Perfume Formulation System';
