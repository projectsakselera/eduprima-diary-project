-- ========================================
-- Execute Table Rename Script
-- Run this to apply all table name changes
-- ========================================

-- Step 1: Check current table names
SELECT 
  'BEFORE RENAME:' as status,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 't_%'
ORDER BY tablename;

-- Step 2: Execute the rename script
\i rename_tables.sql

-- Step 3: Verify the changes
SELECT 
  'AFTER RENAME:' as status,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Step 4: Check for any remaining tables with old format
SELECT 
  'REMAINING OLD FORMAT TABLES:' as status,
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 't_%'
ORDER BY tablename;