export const locales = ['en', 'ar', 'id'];

export const baseURL = process.env.NEXT_PUBLIC_SITE_URL + "/api";

// 🔄 MIGRATION FLAGS - Gradual Client-to-EdgeFunction Migration
export const migrationConfig = {
  // Phase 1: Basic user creation via edge function
  useEdgeFunctionForUserCreation: true, // ✅ ENABLED for Phase 1 testing
  
  // Phase 2: Core tutor data via edge function  
  useEdgeFunctionForTutorDetails: false,
  
  // Phase 3: Extended data (address, banking, availability)
  useEdgeFunctionForExtendedData: false,
  
  // Phase 4: Full migration (documents, personality, preferences)
  useEdgeFunctionForFullCreation: false,
  
  // Debug: Keep both code paths for comparison
  enableFallbackToClientSide: true,
  
  // Logging: Detailed migration logs
  enableMigrationLogs: true,
};