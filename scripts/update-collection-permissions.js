#!/usr/bin/env node

/**
 * Script to update PocketBase collection permissions for public read access
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

const COLLECTIONS_TO_UPDATE = ['workforce_data', 'turnover_data', 'exit_survey_data'];

async function updateCollectionPermissions() {
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating with PocketBase admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Successfully authenticated as admin');

    for (const collectionName of COLLECTIONS_TO_UPDATE) {
      try {
        console.log(`\n📊 Updating permissions for ${collectionName}...`);
        
        // Get existing collection
        const collection = await pb.collections.getOne(collectionName);
        
        // Update permissions for public read access
        // In PocketBase: "" = public access, null = deny access
        const updatedCollection = await pb.collections.update(collection.id, {
          listRule: "", // Public read access
          viewRule: "", // Public read access
          createRule: null, // Deny create (admin only via admin UI)
          updateRule: null, // Deny update (admin only via admin UI)
          deleteRule: null  // Deny delete (admin only via admin UI)
        });
        
        console.log(`✅ Updated ${collectionName} permissions`);
        console.log(`   - List Rule: ${updatedCollection.listRule || 'public'}`);
        console.log(`   - View Rule: ${updatedCollection.viewRule || 'public'}`);
        
      } catch (error) {
        console.error(`❌ Failed to update ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Permission update completed!');
    
  } catch (error) {
    console.error('❌ Failed to update permissions:', error.message);
    process.exit(1);
  }
}

updateCollectionPermissions();