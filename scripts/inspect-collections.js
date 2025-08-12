#!/usr/bin/env node

/**
 * Script to inspect PocketBase collections and their schemas
 */

const PocketBase = require('pocketbase/cjs');

// PocketBase configuration
const pbUrl = 'http://localhost:8091';
const pb = new PocketBase(pbUrl);

// Admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

async function authenticateAdmin() {
  try {
    console.log('🔐 Authenticating with PocketBase admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Successfully authenticated as admin');
    return true;
  } catch (error) {
    console.error('❌ Failed to authenticate:', error.message);
    return false;
  }
}

async function inspectCollections() {
  try {
    console.log('🔍 Inspecting collections...');
    
    // List all collections
    const collections = await pb.collections.getFullList();
    
    console.log(`📋 Found ${collections.length} collections:`);
    
    collections.forEach((collection, index) => {
      console.log(`\n${index + 1}. Collection: ${collection.name} (ID: ${collection.id})`);
      console.log(`   Type: ${collection.type}`);
      console.log(`   System: ${collection.system}`);
      
      if (collection.fields && collection.fields.length > 0) {
        console.log('   Fields:');
        collection.fields.forEach((field, fieldIndex) => {
          console.log(`     ${fieldIndex + 1}. ${field.name} (${field.type})${field.required ? ' *required' : ''}`);
          if (field.id) console.log(`        ID: ${field.id}`);
        });
      } else {
        console.log('   No fields defined');
      }
      
      console.log(`   Rules: list=${collection.listRule}, view=${collection.viewRule}, create=${collection.createRule}, update=${collection.updateRule}, delete=${collection.deleteRule}`);
    });
    
    // Specifically check workforce_data collection
    const workforceCollection = collections.find(c => c.name === 'workforce_data');
    if (workforceCollection) {
      console.log('\n📊 WORKFORCE_DATA Collection Details:');
      console.log('   ID:', workforceCollection.id);
      console.log('   Schema:', JSON.stringify(workforceCollection.fields, null, 2));
      
      // Try to get records from workforce_data
      try {
        const records = await pb.collection('workforce_data').getFullList();
        console.log(`\n   Records: ${records.length} found`);
        
        if (records.length > 0) {
          const firstRecord = records[0];
          console.log('   Sample record keys:', Object.keys(firstRecord));
          console.log('   Sample record data:', JSON.stringify(firstRecord, null, 2));
        }
      } catch (recordError) {
        console.error('   Error fetching records:', recordError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to inspect collections:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
  }
}

async function main() {
  console.log('🔍 Inspecting PocketBase collections...\n');
  
  try {
    // Test connection
    const healthCheck = await pb.health.check();
    console.log('✅ PocketBase is healthy:', healthCheck.message);
    
    // Authenticate
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      process.exit(1);
    }
    
    // Inspect collections
    await inspectCollections();
    
    console.log('\n✅ Inspection completed!');
    
  } catch (error) {
    console.error('\n❌ Inspection failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };