-- ===== CREATE CASCADE DELETE PREVIEW FUNCTION =====
-- Script untuk membuat RPC function preview_user_deletion
-- Sesuai dengan SUPABASE-CASCADE-DOCUMENTATION.json
-- 
-- Jalankan script ini di Supabase SQL Editor

-- Function to preview CASCADE impact before deletion
CREATE OR REPLACE FUNCTION preview_user_deletion(p_user_id UUID)
RETURNS TABLE (
    table_name TEXT,
    records_affected BIGINT,
    data_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- User core data
    SELECT 'users_universal'::TEXT, COUNT(*), 'User Account'::TEXT
    FROM t_310_01_01_users_universal WHERE id = p_user_id
    
    UNION ALL
    
    SELECT 'user_profiles', COUNT(*), 'Personal Profile'
    FROM t_310_01_02_user_profiles WHERE user_id = p_user_id
    
    UNION ALL
    
    SELECT 'user_addresses', COUNT(*), 'Addresses'
    FROM t_310_01_03_user_addresses WHERE user_id = p_user_id
    
    UNION ALL
    
    SELECT 'user_demographics', COUNT(*), 'Demographics'
    FROM t_380_01_01_user_demographics WHERE user_id = p_user_id
    
    UNION ALL
    
    -- Educator data
    SELECT 'educator_details', COUNT(*), 'Educator Profile'
    FROM t_315_01_01_educator_details WHERE user_id = p_user_id
    
    UNION ALL
    
    -- Educator sub-tables (via educator_id)
    SELECT 'availability_config', COUNT(*), 'Schedule Config'
    FROM t_315_03_01_tutor_availability_config tac
    JOIN t_315_01_01_educator_details ed ON tac.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'teaching_preferences', COUNT(*), 'Teaching Preferences'
    FROM t_315_04_01_tutor_teaching_preferences tp
    JOIN t_315_01_01_educator_details ed ON tp.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'personality_traits', COUNT(*), 'Personality Profile'
    FROM t_315_05_01_tutor_personality_traits pt
    JOIN t_315_01_01_educator_details ed ON pt.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'program_mappings', COUNT(*), 'Subject Mappings'
    FROM t_315_06_01_tutor_program_mappings pm
    JOIN t_315_01_01_educator_details ed ON pm.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'additional_subjects', COUNT(*), 'Additional Subjects'
    FROM t_315_07_01_tutor_additional_subjects tas
    JOIN t_315_01_01_educator_details ed ON tas.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'educator_banking_info', COUNT(*), 'Banking Information'
    FROM t_460_02_04_educator_banking_info ebi
    JOIN t_315_01_01_educator_details ed ON ebi.educator_id = ed.id
    WHERE ed.user_id = p_user_id
    
    UNION ALL
    
    SELECT 'tutor_management', COUNT(*), 'Management Data'
    FROM t_315_02_01_tutor_management WHERE user_id = p_user_id
    
    UNION ALL
    
    SELECT 'document_storage', COUNT(*), 'Documents'
    FROM t_460_03_01_document_storage WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION preview_user_deletion(UUID) TO authenticated;

-- Create a test function to verify CASCADE relationships
CREATE OR REPLACE FUNCTION test_cascade_relationships()
RETURNS TABLE (
    child_table TEXT,
    fk_column TEXT,
    parent_table TEXT,
    delete_rule TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.table_name::TEXT AS child_table,
        kcu.column_name::TEXT AS fk_column,
        ccu.table_name::TEXT AS parent_table,
        rc.delete_rule::TEXT,
        CASE 
            WHEN rc.delete_rule = 'CASCADE' THEN '✅ Configured'::TEXT
            ELSE '❌ Not CASCADE'::TEXT
        END as status
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND (
            ccu.table_name = 't_310_01_01_users_universal'
            OR ccu.table_name = 't_315_01_01_educator_details'
        )
    ORDER BY parent_table, child_table;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION test_cascade_relationships() TO authenticated;

-- Add comments
COMMENT ON FUNCTION preview_user_deletion(UUID) IS 
'Preview the CASCADE impact of deleting a user. Shows all tables and record counts that will be affected by the deletion.';

COMMENT ON FUNCTION test_cascade_relationships() IS 
'Test and verify that CASCADE DELETE relationships are properly configured for the tutor management system.';

-- Test the function with a sample (replace with actual user ID for testing)
-- SELECT * FROM preview_user_deletion('your-user-id-here');
-- SELECT * FROM test_cascade_relationships();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ CASCADE preview functions created successfully!';
    RAISE NOTICE '🔍 Use: SELECT * FROM preview_user_deletion(''user-id'') to preview deletion impact';
    RAISE NOTICE '🧪 Use: SELECT * FROM test_cascade_relationships() to verify CASCADE setup';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Remember to test with actual user IDs before production use';
END $$;