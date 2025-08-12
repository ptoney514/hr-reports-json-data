#!/usr/bin/env node

/**
 * Script to update PocketBase collection schemas with proper fields
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

async function updateWorkforceDataSchema() {
  try {
    console.log('📊 Updating workforce_data collection schema...');
    
    // Get the existing collection
    const collections = await pb.collections.getFullList();
    const workforceCollection = collections.find(c => c.name === 'workforce_data');
    
    if (!workforceCollection) {
      throw new Error('workforce_data collection not found');
    }
    
    console.log('Current collection ID:', workforceCollection.id);
    
    // Define the new schema with all required fields
    const updatedSchema = {
      ...workforceCollection,
      fields: [
        // Keep existing ID field
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        // Add reporting period field
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1110990446",
          "max": 0,
          "min": 0,
          "name": "reporting_period",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        // Add numeric fields
        {
          "hidden": false,
          "id": "number106610454",
          "max": null,
          "min": null,
          "name": "total_employees",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number2053934951",
          "max": null,
          "min": null,
          "name": "benefit_eligible_faculty",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1272990947",
          "max": null,
          "min": null,
          "name": "benefit_eligible_staff",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number613067084",
          "max": null,
          "min": null,
          "name": "non_benefit_eligible_faculty",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1275588673",
          "max": null,
          "min": null,
          "name": "non_benefit_eligible_staff",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number446071043",
          "max": null,
          "min": null,
          "name": "total_students",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1204388304",
          "max": null,
          "min": null,
          "name": "vacancy_rate",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1462449055",
          "max": null,
          "min": null,
          "name": "new_hires",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number3465163051",
          "max": null,
          "min": null,
          "name": "terminations",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        // Add JSON fields for complex data
        {
          "hidden": false,
          "id": "json4249045969",
          "maxSize": 0,
          "name": "location_breakdown",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "json1932134886",
          "maxSize": 0,
          "name": "demographics",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "json587233555",
          "maxSize": 0,
          "name": "additional_metrics",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        }
      ]
    };
    
    // Update the collection
    const updatedCollection = await pb.collections.update(workforceCollection.id, updatedSchema);
    
    console.log('✅ Successfully updated workforce_data collection schema');
    console.log('📋 New fields added:', updatedCollection.fields.length);
    
    // List the new fields
    console.log('\n🔍 Collection fields:');
    updatedCollection.fields.forEach((field, index) => {
      if (!field.system) { // Only show non-system fields
        console.log(`   ${index}. ${field.name} (${field.type})${field.required ? ' *required' : ''}`);
      }
    });
    
    return updatedCollection;
    
  } catch (error) {
    console.error('❌ Failed to update collection schema:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
    throw error;
  }
}

async function testUpdatedSchema() {
  try {
    console.log('\n🧪 Testing updated schema...');
    
    // Fetch the updated collection
    const collections = await pb.collections.getFullList();
    const workforceCollection = collections.find(c => c.name === 'workforce_data');
    
    console.log('✅ Collection found with', workforceCollection.fields.length, 'fields');
    
    // Try to create a test record
    const testData = {
      reporting_period: 'test-2025-01-01',
      total_employees: 100,
      benefit_eligible_faculty: 30,
      benefit_eligible_staff: 50,
      new_hires: 5,
      location_breakdown: {
        test: 'data'
      },
      demographics: {
        hsp: 15
      },
      additional_metrics: {
        test: 'metrics'
      }
    };
    
    const testRecord = await pb.collection('workforce_data').create(testData);
    console.log('✅ Test record created successfully:', testRecord.id);
    
    // Clean up test record
    await pb.collection('workforce_data').delete(testRecord.id);
    console.log('✅ Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
  }
}

async function main() {
  console.log('🔧 Updating PocketBase collection schemas...\n');
  
  try {
    // Test connection
    const healthCheck = await pb.health.check();
    console.log('✅ PocketBase is healthy:', healthCheck.message);
    
    // Authenticate
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      process.exit(1);
    }
    
    // Update schema
    await updateWorkforceDataSchema();
    
    // Test the updated schema
    await testUpdatedSchema();
    
    console.log('\n🎉 Schema update completed successfully!');
    console.log('📱 View updated collection: http://localhost:8091/_/#/collections/workforce_data');
    
  } catch (error) {
    console.error('\n❌ Schema update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };