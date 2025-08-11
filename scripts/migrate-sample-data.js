#!/usr/bin/env node

/**
 * Script to migrate sample JSON data to PocketBase
 * Migrates workforce data from public/data/workforce to PocketBase collections
 */

const PocketBase = require('pocketbase/cjs');
const fs = require('fs');
const path = require('path');

// PocketBase configuration
const pbUrl = 'http://localhost:8091';
const pb = new PocketBase(pbUrl);

// Admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SecurePassword123!';

// Sample data file path
const SAMPLE_DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'workforce', '2025-06-30.json');

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

async function transformWorkforceDataForPocketBase(jsonData) {
  // Transform JSON data to match PocketBase collection schema
  const pbData = {
    reporting_period: jsonData.quarter || '2025-Q2',
    total_employees: jsonData.metrics?.totalEmployees,
    benefit_eligible_faculty: jsonData.metrics?.beFaculty,
    benefit_eligible_staff: jsonData.metrics?.beStaff,
    non_benefit_eligible_faculty: jsonData.metrics?.nbeFaculty,
    non_benefit_eligible_staff: jsonData.metrics?.nbeStaff,
    total_students: jsonData.metrics?.students,
    vacancy_rate: jsonData.metrics?.vacancyRate,
    new_hires: jsonData.metrics?.newHires,
    terminations: jsonData.metrics?.departures,
    
    // Store complex data as JSON
    location_breakdown: jsonData.byLocation,
    demographics: {
      hsr: jsonData.metrics?.hsr,
      hsrOmaha: jsonData.metrics?.hsrOmaha,
      hsrPhoenix: jsonData.metrics?.hsrPhoenix,
      studentOmaha: jsonData.metrics?.studentOmaha,
      studentPhoenix: jsonData.metrics?.studentPhoenix
    },
    additional_metrics: {
      totalPositions: jsonData.metrics?.totalPositions,
      vacancies: jsonData.metrics?.vacancies,
      netChange: jsonData.metrics?.netChange,
      turnoverRate: jsonData.metrics?.turnoverRate,
      reportingDate: jsonData.reportingDate,
      lastUpdated: jsonData.lastUpdated
    }
  };
  
  console.log('📊 Transformed data structure:', {
    reporting_period: pbData.reporting_period,
    total_employees: pbData.total_employees,
    benefit_eligible_faculty: pbData.benefit_eligible_faculty,
    benefit_eligible_staff: pbData.benefit_eligible_staff,
    hasLocationData: !!pbData.location_breakdown,
    hasDemographics: !!pbData.demographics,
    hasAdditionalMetrics: !!pbData.additional_metrics
  });
  
  return pbData;
}

async function migrateWorkforceData() {
  try {
    console.log('📂 Reading sample data from:', SAMPLE_DATA_PATH);
    
    // Check if file exists
    if (!fs.existsSync(SAMPLE_DATA_PATH)) {
      throw new Error(`Sample data file not found: ${SAMPLE_DATA_PATH}`);
    }
    
    // Read and parse JSON data
    const fileContent = fs.readFileSync(SAMPLE_DATA_PATH, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log('✅ Successfully loaded JSON data');
    console.log('📊 Data preview:', {
      reportingDate: jsonData.reportingDate,
      quarter: jsonData.quarter,
      totalEmployees: jsonData.metrics?.totalEmployees,
      faculty: jsonData.metrics?.faculty,
      staff: jsonData.metrics?.staff
    });
    
    // Transform data for PocketBase
    const pbData = await transformWorkforceDataForPocketBase(jsonData);
    
    // Check if record already exists
    try {
      const existingRecords = await pb.collection('workforce_data').getFullList({
        filter: `reporting_period = "${pbData.reporting_period}"`
      });
      
      if (existingRecords.length > 0) {
        console.log(`⚠️  Record for ${pbData.reporting_period} already exists, updating...`);
        
        // Update existing record
        const updatedRecord = await pb.collection('workforce_data').update(existingRecords[0].id, pbData);
        console.log('✅ Successfully updated existing record:', updatedRecord.id);
        return updatedRecord;
      }
    } catch (error) {
      // Collection might be empty, continue with creation
      console.log('ℹ️  No existing records found, creating new record...');
    }
    
    // Create new record
    const newRecord = await pb.collection('workforce_data').create(pbData);
    console.log('✅ Successfully created new record:', newRecord.id);
    console.log('📊 Created record data:', {
      id: newRecord.id,
      reporting_period: newRecord.reporting_period,
      total_employees: newRecord.total_employees,
      benefit_eligible_faculty: newRecord.benefit_eligible_faculty
    });
    
    return newRecord;
    
  } catch (error) {
    console.error('❌ Failed to migrate workforce data:', error.message);
    throw error;
  }
}

async function testPocketBaseData() {
  try {
    console.log('🧪 Testing PocketBase data retrieval...');
    
    // Fetch all workforce data
    const records = await pb.collection('workforce_data').getFullList();
    
    console.log(`✅ Successfully retrieved ${records.length} workforce records`);
    
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log('📊 Sample record structure:', {
        id: firstRecord.id,
        reporting_period: firstRecord.reporting_period,
        total_employees: firstRecord.total_employees,
        benefit_eligible_faculty: firstRecord.benefit_eligible_faculty,
        benefit_eligible_staff: firstRecord.benefit_eligible_staff,
        created: firstRecord.created,
        updated: firstRecord.updated
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to test PocketBase data:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting workforce data migration to PocketBase...\n');
  
  try {
    // Step 1: Test PocketBase connection
    console.log('🔗 Testing PocketBase connection...');
    const healthCheck = await pb.health.check();
    console.log('✅ PocketBase is healthy:', healthCheck.message);
    
    // Step 2: Authenticate as admin
    const authenticated = await authenticateAdmin();
    if (!authenticated) {
      process.exit(1);
    }
    
    // Step 3: Migrate workforce data
    console.log('\n📊 Migrating workforce data...');
    const record = await migrateWorkforceData();
    
    // Step 4: Test data retrieval
    console.log('\n🧪 Testing data retrieval...');
    await testPocketBaseData();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📱 View data in PocketBase Admin: http://localhost:8091/_/#/collections/workforce_data');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, migrateWorkforceData, transformWorkforceDataForPocketBase };