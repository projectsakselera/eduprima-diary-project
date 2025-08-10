-- ================================================================
-- SUPABASE STORAGE RLS POLICIES SETUP
-- File: supabase-storage-rls-policies.sql
-- Purpose: Fix storage bucket access and file upload issues
-- Error: "new row violates row-level security policy" + "Auth session missing!"
-- ================================================================

-- First, check current policies (optional)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ================================================================
-- SOLUTION 1: ALLOW ANONYMOUS ACCESS (FOR INITIAL TESTING) 🧪
-- ================================================================
-- Use this if you're getting "Auth session missing!" error
-- Good for initial testing, but NOT secure for production

-- Allow anonymous users to read storage objects
CREATE POLICY "Allow anon read" ON storage.objects
FOR SELECT USING (true);

-- Allow anonymous users to upload files
CREATE POLICY "Allow anon upload" ON storage.objects
FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update files (optional)
CREATE POLICY "Allow anon update" ON storage.objects
FOR UPDATE USING (true);

-- Allow anonymous users to delete files (optional)
CREATE POLICY "Allow anon delete" ON storage.objects
FOR DELETE USING (true);

-- ================================================================
-- PRODUCTION SECURITY UPGRADE: AUTHENTICATED USERS ONLY 🔒
-- ================================================================
-- Run this AFTER testing works - requires users to be logged in
-- More secure for production use

-- 1. Drop existing anonymous policies
DROP POLICY IF EXISTS "Allow anon upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon read" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon delete" ON storage.objects;

-- 2. Create secure authenticated-only policies
CREATE POLICY "Secure authenticated read" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Secure authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Secure authenticated update" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Secure authenticated delete" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');

-- ================================================================
-- SOLUTION 2: REQUIRE AUTHENTICATION (RECOMMENDED FOR PRODUCTION) 🔐
-- ================================================================
-- Use this if you have proper user authentication system
-- Comment out Solution 1 if using this

/*
-- Allow authenticated users to read all storage objects
CREATE POLICY "Allow authenticated read" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to upload files to any bucket
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated update" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
*/

-- ================================================================
-- SOLUTION 2: BUCKET-SPECIFIC POLICIES (MORE SECURE)
-- ================================================================

-- Alternative: Restrict to specific bucket only
-- Uncomment these if you want bucket-specific restrictions

/*
-- Allow read access to eduprimadiary bucket only
CREATE POLICY "Allow read eduprimadiary" ON storage.objects
FOR SELECT USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'eduprimadiary'
);

-- Allow upload to eduprimadiary bucket only
CREATE POLICY "Allow upload eduprimadiary" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'eduprimadiary'
);

-- Allow update in eduprimadiary bucket only
CREATE POLICY "Allow update eduprimadiary" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'eduprimadiary'
);

-- Allow delete in eduprimadiary bucket only
CREATE POLICY "Allow delete eduprimadiary" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'eduprimadiary'
);
*/

-- ================================================================
-- SOLUTION 3: TEMPORARY - DISABLE RLS (NOT RECOMMENDED FOR PRODUCTION)
-- ================================================================

-- ONLY USE THIS FOR TESTING! NOT SECURE FOR PRODUCTION!
-- Uncomment the line below ONLY for testing purposes

-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later (recommended):
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check if policies were created successfully
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%authenticated%';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ================================================================
-- ADDITIONAL BUCKET POLICIES (if needed)
-- ================================================================

-- If you also want to allow listing buckets (optional)
-- This is usually not needed for file uploads

/*
CREATE POLICY "Allow bucket listing" ON storage.buckets
FOR SELECT USING (auth.role() = 'authenticated');
*/

-- ================================================================
-- CLEANUP (if you need to remove policies later)
-- ================================================================

-- Uncomment these if you need to remove the policies

/*
DROP POLICY IF EXISTS "Allow authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
*/

-- ================================================================
-- INSTRUCTIONS:
-- 
-- 1. Copy this entire file or just the SOLUTION 1 section
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run the SQL commands
-- 4. Test your file upload again
-- 
-- If you're still having issues:
-- - Check if you're properly authenticated in your app
-- - Verify the bucket name is exactly 'eduprimadiary'
-- - Check browser console for detailed error messages
-- ================================================================


-- ================================================================
-- 🚀 NEW: CUSTOM JWT SUPPORT FOR NEXTAUTH/CUSTOM AUTH SYSTEM
-- ================================================================
-- Date Added: Based on /api/supabase-session JWT bridge
-- Purpose: Support custom authentication system with Supabase Storage
-- ================================================================

-- First, clean up any existing eduprimadiary policies
DROP POLICY IF EXISTS "Allow eduprimadiary reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow eduprimadiary uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow read eduprimadiary" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload eduprimadiary" ON storage.objects;
DROP POLICY IF EXISTS "Allow update eduprimadiary" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete eduprimadiary" ON storage.objects;

-- ================================================================
-- CUSTOM JWT POLICIES untuk BUCKET EDUPRIMADIARY
-- ================================================================

-- 1. READ Policy - authenticated users can read all files in eduprimadiary
CREATE POLICY "Custom JWT - Allow reads on eduprimadiary"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated'
);

-- 2. UPLOAD Policy - users can only upload to their own folder
-- Expected path structure: {user_id}/filename.ext
CREATE POLICY "Custom JWT - Allow uploads to own folder on eduprimadiary"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  -- Extract user ID from JWT 'sub' claim and match with first folder in path
  (auth.jwt() ->> 'sub')::text = split_part(name, '/', 1)
);

-- 3. UPDATE Policy - users can only update their own files
CREATE POLICY "Custom JWT - Allow updates to own files on eduprimadiary"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub')::text = split_part(name, '/', 1)
)
WITH CHECK (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub')::text = split_part(name, '/', 1)
);

-- 4. DELETE Policy - users can only delete their own files
CREATE POLICY "Custom JWT - Allow deletes of own files on eduprimadiary"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub')::text = split_part(name, '/', 1)
);

-- ================================================================
-- OPTIONAL: ROLE-BASED POLICIES (Uncomment if needed)
-- ================================================================

-- Super Admin Policy - full access to all files (uncomment if needed)
/*
CREATE POLICY "Custom JWT - Super admin full access on eduprimadiary"
ON storage.objects FOR ALL
USING (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
)
WITH CHECK (
  bucket_id = 'eduprimadiary' AND
  auth.role() = 'authenticated' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);
*/

-- ================================================================
-- VERIFICATION QUERIES for Custom JWT Policies
-- ================================================================

-- Check if custom JWT policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%Custom JWT%';

-- ================================================================
-- TESTING NOTES:
-- ================================================================
-- 
-- 1. File Upload Path Structure:
--    ✅ Correct: '550e8400-e29b-41d4-a716-446655440000/foto-profil.jpg'
--    ✅ Correct: '550e8400-e29b-41d4-a716-446655440000/identitas.pdf'
--    ❌ Wrong:   'TRN001/foto-profil.jpg' (user can't access TRN folder)
--    ❌ Wrong:   'shared/document.pdf' (user can't access shared folder)
--
-- 2. Custom JWT Structure (from /api/supabase-session):
--    {
--      "sub": "user-id-from-user_universal-table",
--      "role": "authenticated",
--      "user_metadata": {
--        "user_code": "UC001",
--        "email": "user@example.com", 
--        "role": "super_admin",
--        "account_type": "premium"
--      }
--    }
--
-- 3. How to Test:
--    a. Login to your app with custom auth
--    b. Call /api/supabase-session to get JWT token
--    c. Use token in Supabase client Authorization header
--    d. Try uploading file with path: {user_id}/filename.ext
--
-- ================================================================