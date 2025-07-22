#!/usr/bin/env node

/**
 * 🚀 Deployment Verification Script
 * Checks if all critical components work after deployment
 */

const https = require('https');
const http = require('http');

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:3000';

console.log('🔍 Verifying deployment at:', DEPLOYMENT_URL);
console.log('=' .repeat(60));

// Test endpoints
const endpoints = [
  { path: '/api/auth/session', name: 'NextAuth Session' },
  { path: '/api/auth/providers', name: 'Auth Providers' },
  { path: '/api/supabase/test-connection', name: 'Supabase Connection' },
  { path: '/api/admin/test-users', name: 'Database Users' },
  { path: '/en', name: 'Frontend Homepage' },
  { path: '/en/auth/login', name: 'Login Page' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${DEPLOYMENT_URL}${endpoint.path}`;
    const client = url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    
    client.get(url, (res) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      
      if (status >= 200 && status < 400) {
        console.log(`✅ ${endpoint.name}: ${status} (${duration}ms)`);
        resolve({ success: true, status, duration });
      } else {
        console.log(`❌ ${endpoint.name}: ${status} (${duration}ms)`);
        resolve({ success: false, status, duration });
      }
    }).on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`💥 ${endpoint.name}: ERROR - ${err.message} (${duration}ms)`);
      resolve({ success: false, error: err.message, duration });
    });
  });
}

async function runVerification() {
  let passed = 0;
  let failed = 0;
  
  console.log('🧪 Testing endpoints...\n');
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is healthy.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
    process.exit(1);
  }
}

// Environment check
function checkEnvironment() {
  console.log('🔧 Environment Check:');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'AUTH_SECRET'
  ];
  
  let missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName}: Set`);
    } else {
      console.log(`  ❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.log('   These might be needed for full functionality.\n');
  } else {
    console.log('\n✅ All required environment variables are set.\n');
  }
}

// Run verification
async function main() {
  checkEnvironment();
  await runVerification();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEndpoint, runVerification }; 