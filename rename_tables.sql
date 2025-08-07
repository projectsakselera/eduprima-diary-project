-- ========================================
-- Database Table Rename Script
-- Remove numeric code prefixes from all tables
-- Pattern: t_XXX_XX_XX_tablename -> tablename
-- ========================================

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- System & Configuration Tables
ALTER TABLE IF EXISTS t_110_02_01_universal_settings RENAME TO universal_settings;
ALTER TABLE IF EXISTS t_120_01_01_countries RENAME TO countries;
ALTER TABLE IF EXISTS t_120_01_02_province RENAME TO provinces;
ALTER TABLE IF EXISTS t_120_01_03_city RENAME TO cities;
ALTER TABLE IF EXISTS t_120_01_04_district RENAME TO districts;
ALTER TABLE IF EXISTS t_120_01_05_sub_district RENAME TO sub_districts;
ALTER TABLE IF EXISTS t_120_02_01_banks_indonesia RENAME TO banks_indonesia;
ALTER TABLE IF EXISTS t_120_02_02_payment_methods RENAME TO payment_methods;
ALTER TABLE IF EXISTS t_120_02_03_currencies RENAME TO currencies;
ALTER TABLE IF EXISTS t_130_01_01_application_status_definitions RENAME TO application_status_definitions;
ALTER TABLE IF EXISTS t_150_01_01_communication_channels RENAME TO communication_channels;

-- Program & Curriculum Tables
ALTER TABLE IF EXISTS t_210_01_01_program_main_categories RENAME TO program_main_categories;
ALTER TABLE IF EXISTS t_210_01_02_program_sub_categories RENAME TO program_sub_categories;
ALTER TABLE IF EXISTS t_210_02_01_program_specializations RENAME TO program_specializations;
ALTER TABLE IF EXISTS t_210_02_02_programs_catalog RENAME TO programs_catalog;
ALTER TABLE IF EXISTS t_210_03_01_curriculum_frameworks RENAME TO curriculum_frameworks;
ALTER TABLE IF EXISTS t_210_03_02_curriculum_standards RENAME TO curriculum_standards;
ALTER TABLE IF EXISTS t_210_04_01_subjects_catalog RENAME TO subjects_catalog;
ALTER TABLE IF EXISTS t_210_04_02_subject_categories RENAME TO subject_categories;
ALTER TABLE IF EXISTS t_210_05_01_learning_materials RENAME TO learning_materials;
ALTER TABLE IF EXISTS t_210_05_02_learning_objectives RENAME TO learning_objectives;
ALTER TABLE IF EXISTS t_210_06_01_assessment_methods RENAME TO assessment_methods;

-- User Management Tables
ALTER TABLE IF EXISTS t_310_01_01_users_universal RENAME TO users_universal;
ALTER TABLE IF EXISTS t_310_01_02_user_profiles RENAME TO user_profiles;
ALTER TABLE IF EXISTS t_310_02_01_authentication_methods RENAME TO authentication_methods;
ALTER TABLE IF EXISTS t_310_02_02_user_sessions RENAME TO user_sessions;
ALTER TABLE IF EXISTS t_310_03_01_user_preferences RENAME TO user_preferences;
ALTER TABLE IF EXISTS t_310_04_01_user_activity_logs RENAME TO user_activity_logs;
ALTER TABLE IF EXISTS t_310_05_01_user_notifications RENAME TO user_notifications;
ALTER TABLE IF EXISTS t_310_06_01_user_feedback RENAME TO user_feedback;

-- Educator & Tutor Tables
ALTER TABLE IF EXISTS t_315_01_01_educator_details RENAME TO educator_details;
ALTER TABLE IF EXISTS t_315_02_01_tutor_management RENAME TO tutor_management;
ALTER TABLE IF EXISTS t_315_03_01_tutor_availability_config RENAME TO tutor_availability_config;
ALTER TABLE IF EXISTS t_315_04_01_tutor_teaching_preferences RENAME TO tutor_teaching_preferences;
ALTER TABLE IF EXISTS t_315_05_01_tutor_personality_traits RENAME TO tutor_personality_traits;
ALTER TABLE IF EXISTS t_315_06_01_educator_banking_info RENAME TO educator_banking_info;
ALTER TABLE IF EXISTS t_315_07_01_tutor_qualifications RENAME TO tutor_qualifications;
ALTER TABLE IF EXISTS t_315_08_01_tutor_certifications RENAME TO tutor_certifications;
ALTER TABLE IF EXISTS t_315_09_01_tutor_work_experience RENAME TO tutor_work_experience;
ALTER TABLE IF EXISTS t_315_10_01_tutor_portfolio RENAME TO tutor_portfolio;
ALTER TABLE IF EXISTS t_315_11_01_tutor_reviews RENAME TO tutor_reviews;
ALTER TABLE IF EXISTS t_315_12_01_tutor_performance_metrics RENAME TO tutor_performance_metrics;
ALTER TABLE IF EXISTS t_315_13_01_tutor_compensation_history RENAME TO tutor_compensation_history;

-- Financial & Banking Tables
ALTER TABLE IF EXISTS t_460_01_01_financial_transactions RENAME TO financial_transactions;
ALTER TABLE IF EXISTS t_460_01_02_transaction_categories RENAME TO transaction_categories;
ALTER TABLE IF EXISTS t_460_01_03_payment_processing RENAME TO payment_processing;
ALTER TABLE IF EXISTS t_460_01_04_invoice_management RENAME TO invoice_management;
ALTER TABLE IF EXISTS t_460_01_05_billing_cycles RENAME TO billing_cycles;
ALTER TABLE IF EXISTS t_460_01_06_refund_processing RENAME TO refund_processing;
ALTER TABLE IF EXISTS t_460_02_01_compensation_rules RENAME TO compensation_rules;
ALTER TABLE IF EXISTS t_460_02_02_tutor_earnings RENAME TO tutor_earnings;
ALTER TABLE IF EXISTS t_460_02_03_payout_schedules RENAME TO payout_schedules;
ALTER TABLE IF EXISTS t_460_02_04_educator_banking_info RENAME TO educator_banking_info_duplicate;
ALTER TABLE IF EXISTS t_460_02_05_tax_information RENAME TO tax_information;
ALTER TABLE IF EXISTS t_460_03_01_document_storage RENAME TO document_storage;
ALTER TABLE IF EXISTS t_460_03_02_contract_management RENAME TO contract_management;
ALTER TABLE IF EXISTS t_460_03_03_agreement_templates RENAME TO agreement_templates;
ALTER TABLE IF EXISTS t_460_04_01_pricing_models RENAME TO pricing_models;
ALTER TABLE IF EXISTS t_460_04_02_discount_policies RENAME TO discount_policies;
ALTER TABLE IF EXISTS t_460_04_03_promotional_campaigns RENAME TO promotional_campaigns;
ALTER TABLE IF EXISTS t_460_05_01_financial_reports RENAME TO financial_reports;
ALTER TABLE IF EXISTS t_460_05_02_revenue_analytics RENAME TO revenue_analytics;
ALTER TABLE IF EXISTS t_460_06_01_audit_trails RENAME TO audit_trails;
ALTER TABLE IF EXISTS t_460_06_02_compliance_tracking RENAME TO compliance_tracking;

-- Security, Analytics, and Integration Tables
ALTER TABLE IF EXISTS t_340_01_01_roles RENAME TO roles;
ALTER TABLE IF EXISTS t_340_01_02_permissions RENAME TO permissions;
ALTER TABLE IF EXISTS t_340_02_01_role_permissions RENAME TO role_permissions;
ALTER TABLE IF EXISTS t_340_03_01_user_roles RENAME TO user_roles;
ALTER TABLE IF EXISTS t_350_01_01_security_policies RENAME TO security_policies;
ALTER TABLE IF EXISTS t_350_02_01_access_controls RENAME TO access_controls;
ALTER TABLE IF EXISTS t_520_01_01_learning_analytics_core RENAME TO learning_analytics_core;
ALTER TABLE IF EXISTS t_520_02_01_performance_tracking RENAME TO performance_tracking;
ALTER TABLE IF EXISTS t_520_03_01_engagement_metrics RENAME TO engagement_metrics;
ALTER TABLE IF EXISTS t_530_01_01_system_integrations RENAME TO system_integrations;
ALTER TABLE IF EXISTS t_530_02_01_api_endpoints RENAME TO api_endpoints;
ALTER TABLE IF EXISTS t_530_03_01_webhook_configurations RENAME TO webhook_configurations;
ALTER TABLE IF EXISTS t_610_01_01_external_apis RENAME TO external_apis;
ALTER TABLE IF EXISTS t_620_01_01_data_sync_logs RENAME TO data_sync_logs;

-- Additional tables found during analysis
ALTER TABLE IF EXISTS t_315_02_04_tutor_availability_config RENAME TO tutor_availability_config_duplicate;
ALTER TABLE IF EXISTS t_315_02_05_tutor_teaching_preferences RENAME TO tutor_teaching_preferences_duplicate;
ALTER TABLE IF EXISTS t_315_02_06_tutor_personality_traits RENAME TO tutor_personality_traits_duplicate;
ALTER TABLE IF EXISTS t_460_02_04_tutor_availability_config RENAME TO tutor_availability_config_alt;
ALTER TABLE IF EXISTS t_460_02_06_tutor_teaching_preferences RENAME TO tutor_teaching_preferences_alt;
ALTER TABLE IF EXISTS t_460_02_07_tutor_personality_traits RENAME TO tutor_personality_traits_alt;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Verification Query
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 't_%'
ORDER BY tablename;