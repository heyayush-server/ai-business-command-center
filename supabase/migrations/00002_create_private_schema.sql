-- Migration: 00002_create_private_schema.sql
-- Description: Create isolated private schema for SECURITY DEFINER functions

CREATE SCHEMA IF NOT EXISTS private;

-- Restrict schema usage so public/anon cannot inspect internal definitions
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;

-- Service role and postgres keep full administration
GRANT USAGE ON SCHEMA private TO postgres;
GRANT USAGE ON SCHEMA private TO service_role;
