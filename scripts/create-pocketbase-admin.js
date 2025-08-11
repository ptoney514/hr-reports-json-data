#!/usr/bin/env node

/**
 * Script to verify PocketBase admin account status
 * The admin account is created automatically via migration
 * This script verifies the account exists and can authenticate
 */

const PocketBase = require('pocketbase/cjs');

// Configuration
const POCKETBASE_URL = process.env.REACT_APP_POCKETBASE_URL || 'http://localhost:8091';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

async function verifyAdminAccount() {
  console.log('🔍 Verifying PocketBase admin account...');
  console.log(`📍 PocketBase URL: ${POCKETBASE_URL}`);
  
  const pb = new PocketBase(POCKETBASE_URL);
  
  try {
    // First, check if we can connect to PocketBase
    const health = await pb.health.check();
    console.log('✅ PocketBase is healthy:', health);
    
    // Admin account is created automatically via migration
    console.log('\n📝 Admin account creation:');
    console.log('The admin account is created automatically via migration when PocketBase starts.');
    console.log('Migration file: pb_migrations/1736803200_create_superuser.js');
    console.log('');
    console.log('Default credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    
    // Try to authenticate with the provided credentials to check if they already exist
    try {
      const authData = await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('✅ Admin account already exists and credentials are valid!');
      console.log('   Admin ID:', authData.record.id);
      console.log('   Email:', authData.record.email);
      return true;
    } catch (error) {
      if (error.response?.code === 400 || error.response?.code === 401) {
        console.log('⚠️  Admin account does not exist yet or credentials are different');
        console.log('   Please create it using one of the options above');
      } else {
        console.log('❌ Error checking admin credentials:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
verifyAdminAccount().catch(console.error);