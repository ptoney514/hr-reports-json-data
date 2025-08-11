#!/usr/bin/env node

/**
 * Recreate PocketBase collections with proper field schema
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

// Updated collection schema - PocketBase v0.26 format
const WORKFORCE_COLLECTION = {
  name: 'workforce_data',
  type: 'base',
  fields: [
    {
      name: 'reporting_period',
      type: 'text',
      required: true,
      options: { max: 50 }
    },
    {
      name: 'total_employees',
      type: 'number',
      required: false
    },
    {
      name: 'benefit_eligible_faculty',
      type: 'number',
      required: false
    },
    {
      name: 'benefit_eligible_staff',
      type: 'number',
      required: false
    },
    {
      name: 'non_benefit_eligible_faculty',
      type: 'number',
      required: false
    },
    {
      name: 'non_benefit_eligible_staff',
      type: 'number',
      required: false
    },
    {
      name: 'total_students',
      type: 'number',
      required: false
    },
    {
      name: 'vacancy_rate',
      type: 'number',
      required: false
    },
    {
      name: 'new_hires',
      type: 'number',
      required: false
    },
    {
      name: 'terminations',
      type: 'number',
      required: false
    },
    {
      name: 'location_breakdown',
      type: 'json',
      required: false
    },
    {
      name: 'demographics',
      type: 'json',
      required: false
    },
    {
      name: 'additional_metrics',
      type: 'json',
      required: false
    }
  ],
  listRule: '', // Public read access
  viewRule: '', // Public read access
  createRule: null, // Deny create
  updateRule: null, // Deny update
  deleteRule: null  // Deny delete
};

async function recreateCollections() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated as admin');
    
    // Delete existing collection
    try {
      console.log('🗑️  Deleting existing workforce_data collection...');
      const existingCollection = await pb.collections.getOne('workforce_data');
      await pb.collections.delete(existingCollection.id);
      console.log('✅ Deleted existing collection');
    } catch (error) {
      console.log('ℹ️  No existing collection to delete');
    }
    
    // Create new collection with proper schema
    console.log('📊 Creating new workforce_data collection...');
    const newCollection = await pb.collections.create(WORKFORCE_COLLECTION);
    
    console.log('✅ Created collection:', newCollection.id);
    console.log('📊 Collection fields:', newCollection.fields?.length || 0);
    
    // Verify the collection
    console.log('\n🔍 Verifying collection...');
    const verifyCollection = await pb.collections.getOne(newCollection.id);
    
    console.log('📋 Collection Fields:');
    if (verifyCollection.fields && Array.isArray(verifyCollection.fields)) {
      verifyCollection.fields.forEach((field, index) => {
        if (!field.system) { // Skip system fields
          console.log(`${index + 1}. ${field.name} (${field.type})`);
        }
      });
    }
    
    console.log('\n🎉 Collection recreated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}

recreateCollections();