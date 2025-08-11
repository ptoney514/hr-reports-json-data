#!/usr/bin/env node

/**
 * Debug PocketBase collection schema and data
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

async function debugCollection() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated as admin');
    
    // Get collection schema
    console.log('🔍 Fetching workforce_data collection schema...');
    const collection = await pb.collections.getOne('workforce_data');
    
    console.log('\n📊 Collection Details (Raw):');
    console.log(JSON.stringify(collection, null, 2));
    
    console.log('\n📊 Collection Details:');
    console.log('- ID:', collection.id);
    console.log('- Name:', collection.name);
    console.log('- Type:', collection.type);
    console.log('- List Rule:', collection.listRule || 'public');
    console.log('- View Rule:', collection.viewRule || 'public');
    
    if (collection.schema && Array.isArray(collection.schema)) {
      console.log('\n📋 Collection Schema Fields:');
      collection.schema.forEach((field, index) => {
        console.log(`${index + 1}. ${field.name} (${field.type})`);
        if (field.options) {
          console.log(`   Options:`, field.options);
        }
      });
    } else {
      console.log('\n❌ Schema is missing or invalid:', typeof collection.schema);
    }
    
    // Get records with admin auth
    console.log('\n📊 Fetching records as admin...');
    const records = await pb.collection('workforce_data').getFullList();
    
    console.log(`\n✅ Found ${records.length} records`);
    
    if (records.length > 0) {
      const record = records[0];
      console.log('\n📊 First record (raw object):');
      console.log(JSON.stringify(record, null, 2));
      
      console.log('\n🔍 Field access test:');
      collection.schema.forEach(field => {
        const value = record[field.name];
        console.log(`- ${field.name}: ${value} (${typeof value})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}

debugCollection();