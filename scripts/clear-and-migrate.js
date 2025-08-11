#!/usr/bin/env node

/**
 * Clear existing data and re-migrate with proper debugging
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

async function clearAndMigrate() {
  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated as admin');
    
    // Clear existing records
    console.log('🧹 Clearing existing workforce records...');
    const existingRecords = await pb.collection('workforce_data').getFullList();
    for (const record of existingRecords) {
      await pb.collection('workforce_data').delete(record.id);
      console.log(`🗑️  Deleted record: ${record.id}`);
    }
    
    // Create a simple test record first
    console.log('📊 Creating simple test record...');
    const testRecord = await pb.collection('workforce_data').create({
      reporting_period: 'Q2-2025',
      total_employees: 1000,
      benefit_eligible_faculty: 300,
      benefit_eligible_staff: 400,
      new_hires: 50,
      terminations: 30
    });
    
    console.log('✅ Created test record:', testRecord.id);
    
    // Retrieve and verify the test record
    const retrievedRecord = await pb.collection('workforce_data').getOne(testRecord.id);
    console.log('📊 Retrieved record data:', {
      id: retrievedRecord.id,
      reporting_period: retrievedRecord.reporting_period,
      total_employees: retrievedRecord.total_employees,
      benefit_eligible_faculty: retrievedRecord.benefit_eligible_faculty,
      benefit_eligible_staff: retrievedRecord.benefit_eligible_staff,
      new_hires: retrievedRecord.new_hires,
      terminations: retrievedRecord.terminations
    });
    
    console.log('🎉 Test migration successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}

clearAndMigrate();