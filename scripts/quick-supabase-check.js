#!/usr/bin/env node

/**
 * Quick check untuk Supabase credentials
 * Versi simpel tanpa user input - baca dari environment
 */

const fs = require('fs');
const path = require('path');

// Baca .env.local jika ada
function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    console.log('📁 Reading .env.local file...');
    const content = fs.readFileSync(envPath, 'utf8');
    
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } else {
    console.log('⚠️  .env.local file not found');
    return null;
  }
  
  return env;
}

// Validate JWT format
function validateJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    return {
      valid: true,
      header,
      payload,
      role: payload.role,
      exp: payload.exp ? new Date(payload.exp * 1000) : null
    };
  } catch {
    return { valid: false };
  }
}

// Quick validation
function quickCheck() {
  console.log('🔍 Supabase Quick Credential Check');
  console.log('===================================\n');

  const env = readEnvFile();
  
  if (!env) {
    console.log('❌ Cannot read .env.local file');
    console.log('💡 Tip: Pastikan file .env.local ada di root project');
    return;
  }

  const checks = [
    {
      name: 'SUPABASE_URL',
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      validate: (value) => {
        try {
          const url = new URL(value);
          return {
            valid: url.protocol === 'https:' && url.hostname.includes('supabase'),
            info: `Domain: ${url.hostname}`
          };
        } catch {
          return { valid: false, info: 'Invalid URL format' };
        }
      }
    },
    {
      name: 'ANON_KEY',
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      validate: (value) => {
        const jwt = validateJWT(value);
        return {
          valid: jwt.valid,
          info: jwt.valid ? `Role: ${jwt.role}, Expires: ${jwt.exp ? jwt.exp.toLocaleDateString() : 'Never'}` : 'Invalid JWT format'
        };
      }
    },
    {
      name: 'SERVICE_ROLE_KEY',
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      validate: (value) => {
        const jwt = validateJWT(value);
        return {
          valid: jwt.valid,
          info: jwt.valid ? `Role: ${jwt.role}, Expires: ${jwt.exp ? jwt.exp.toLocaleDateString() : 'Never'}` : 'Invalid JWT format'
        };
      }
    }
  ];

  let allValid = true;

  checks.forEach(check => {
    console.log(`📋 ${check.name}:`);
    
    const value = env[check.key];
    if (!value) {
      console.log(`   ❌ Missing in .env.local`);
      allValid = false;
      return;
    }

    const result = check.validate(value);
    if (result.valid) {
      console.log(`   ✅ Valid - ${result.info}`);
    } else {
      console.log(`   ❌ Invalid - ${result.info}`);
      allValid = false;
    }
    console.log();
  });

  // Check JWT Secret juga
  const jwtSecret = env['SUPABASE_JWT_SECRET'] || env['JWT_SECRET'];
  if (jwtSecret) {
    console.log('🔐 JWT_SECRET:');
    if (jwtSecret.length >= 32) {
      console.log('   ✅ Length adequate');
    } else {
      console.log('   ⚠️  Might be too short');
    }
  } else {
    console.log('⚠️  JWT_SECRET not found (optional untuk development)');
  }

  console.log('\n================================');
  console.log(`🎯 Overall Status: ${allValid ? '✅ ALL GOOD' : '❌ NEEDS ATTENTION'}`);
  
  if (allValid) {
    console.log('\n🎉 Credentials look good!');
    console.log('💡 You can run the full connection test with:');
    console.log('   node scripts/test-supabase-connection.js');
  } else {
    console.log('\n⚠️  Please fix the issues above');
    console.log('💡 Check your Supabase dashboard for correct values');
  }
}

quickCheck();
