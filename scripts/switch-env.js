#!/usr/bin/env node

/**
 * 🔧 Environment Switcher Script
 * Helps switch between different Supabase configurations
 */

const fs = require('fs');
const path = require('path');

// Predefined environment templates
const environments = {
  dev: {
    name: 'Development',
    template: `# Development Environment
NEXT_PUBLIC_SUPABASE_URL=https://btnsfqhgrjdyxwjiomrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM4MDA5MSwiZXhwIjoyMDY3OTU2MDkxfQ.dNNwElmfp7NVyXrxZp0zMjxAfT79157UGlXDM0hcvpo

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=KiDwEUCWmc9xcgNJWkgYepqKkUFCjgpT3z9dh56eQbM=
AUTH_SECRET=KiDwEUCWmc9xcgNJWkgYepqKkUFCjgpT3z9dh56eQbM=
AUTH_URL=http://localhost:3000`
  },
  
  staging: {
    name: 'Staging',
    template: `# Staging Environment  
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=staging_service_role_key_here

# NextAuth Configuration (Staging)
NEXTAUTH_URL=https://yourapp-staging.vercel.app
NEXTAUTH_SECRET=staging_secret_here
AUTH_SECRET=staging_secret_here
AUTH_URL=https://yourapp-staging.vercel.app`
  },
  
  prod: {
    name: 'Production',
    template: `# Production Environment
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key_here

# NextAuth Configuration (Production)
NEXTAUTH_URL=https://yourapp.vercel.app
NEXTAUTH_SECRET=prod_secret_here
AUTH_SECRET=prod_secret_here
AUTH_URL=https://yourapp.vercel.app`
  },
  
  clean: {
    name: 'Clean/Empty',
    template: `# Empty Environment Template
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
AUTH_SECRET=
AUTH_URL=http://localhost:3000`
  }
};

function showHelp() {
  console.log('🔧 Environment Switcher\n');
  console.log('Usage: node scripts/switch-env.js [environment]\n');
  console.log('Available environments:');
  
  Object.keys(environments).forEach(key => {
    console.log(`  ${key.padEnd(10)} - ${environments[key].name}`);
  });
  
  console.log('\nExamples:');
  console.log('  node scripts/switch-env.js dev     # Switch to development');
  console.log('  node scripts/switch-env.js staging # Switch to staging');
  console.log('  node scripts/switch-env.js clean   # Reset to empty template');
  console.log('\n⚠️  This will overwrite your current .env.local file!');
}

function backupCurrentEnv() {
  const envPath = '.env.local';
  const backupPath = `.env.local.backup.${Date.now()}`;
  
  if (fs.existsSync(envPath)) {
    try {
      fs.copyFileSync(envPath, backupPath);
      console.log(`📦 Current .env.local backed up as: ${backupPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to backup current .env.local: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

function switchEnvironment(envKey) {
  const env = environments[envKey];
  
  if (!env) {
    console.error(`❌ Environment '${envKey}' not found!`);
    showHelp();
    process.exit(1);
  }
  
  console.log(`🔄 Switching to ${env.name} environment...`);
  
  // Backup current env
  if (!backupCurrentEnv()) {
    console.error('❌ Backup failed. Aborting switch.');
    process.exit(1);
  }
  
  // Write new environment
  try {
    fs.writeFileSync('.env.local', env.template);
    console.log(`✅ Successfully switched to ${env.name} environment!`);
    console.log('\n🔄 Remember to restart your development server:');
    console.log('   npm run dev');
    
    if (envKey !== 'dev') {
      console.log('\n⚠️  Note: You may need to update the credentials with actual values');
    }
    
  } catch (error) {
    console.error(`❌ Failed to write .env.local: ${error.message}`);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

const envKey = args[0].toLowerCase();
switchEnvironment(envKey); 