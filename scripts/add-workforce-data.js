#!/usr/bin/env node

/**
 * Script to add current workforce data to PocketBase
 * Uses the data from public/data/workforce-data.json
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

// Data file path
const WORKFORCE_DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'workforce-data.json');

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

function transformWorkforceDataForPocketBase(jsonData) {
  // Extract data from our JSON structure
  const pbData = {
    reporting_period: `${jsonData.metadata?.reportingDate || '2025-06-30'}`,
    total_employees: jsonData.summary?.totalEmployees || jsonData.headcount?.benefitEligible?.total || 0,
    benefit_eligible_faculty: jsonData.summary?.faculty || jsonData.headcount?.benefitEligible?.faculty || 0,
    benefit_eligible_staff: jsonData.summary?.staff || jsonData.headcount?.benefitEligible?.staff || 0,
    non_benefit_eligible_faculty: jsonData.headcount?.nonBenefitEligible?.faculty || 0,
    non_benefit_eligible_staff: jsonData.headcount?.nonBenefitEligible?.staff || 0,
    total_students: jsonData.headcount?.nonBenefitEligible?.students || 0,
    vacancy_rate: 0, // Not in our current data
    new_hires: jsonData.starters?.currentPeriod?.total || 262,
    terminations: 0, // Not in our current data
    
    // Store complex data as JSON
    location_breakdown: {
      locations: jsonData.locations || [],
      byLocation: jsonData.byLocation || {},
      currentPeriod: {
        locations: jsonData.currentPeriod?.locations || []
      }
    },
    demographics: {
      hsp: jsonData.summary?.hsp || jsonData.headcount?.benefitEligible?.hsp || 0,
      starters: jsonData.starters || {}
    },
    additional_metrics: {
      departments: jsonData.departments || [],
      departmentalBreakdown: jsonData.currentPeriod?.departmentalBreakdown || [],
      byAssignmentType: jsonData.currentPeriod?.byAssignmentType || [],
      metadata: jsonData.metadata || {},
      totalPositions: jsonData.summary?.totalEmployees || 0,
      reportingDate: jsonData.metadata?.reportingDate,
      lastUpdated: jsonData.metadata?.lastUpdated
    }
  };
  
  console.log('📊 Transformed data structure:');
  console.log(`   Reporting Period: ${pbData.reporting_period}`);
  console.log(`   Total Employees: ${pbData.total_employees}`);
  console.log(`   BE Faculty: ${pbData.benefit_eligible_faculty}`);
  console.log(`   BE Staff: ${pbData.benefit_eligible_staff}`);
  console.log(`   HSP: ${pbData.demographics.hsp}`);
  console.log(`   New Hires: ${pbData.new_hires}`);
  console.log(`   Locations: ${pbData.location_breakdown.locations?.length || 0}`);
  console.log(`   Departments: ${pbData.additional_metrics.departments?.length || 0}`);
  
  return pbData;
}

async function addWorkforceData() {
  try {
    console.log('📂 Reading workforce data from:', WORKFORCE_DATA_PATH);
    
    // Check if file exists
    if (!fs.existsSync(WORKFORCE_DATA_PATH)) {
      throw new Error(`Workforce data file not found: ${WORKFORCE_DATA_PATH}`);
    }
    
    // Read and parse JSON data
    const fileContent = fs.readFileSync(WORKFORCE_DATA_PATH, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log('✅ Successfully loaded JSON data');
    console.log('📊 Data overview:', {
      reportingDate: jsonData.metadata?.reportingDate,
      totalEmployees: jsonData.summary?.totalEmployees,
      faculty: jsonData.summary?.faculty,
      staff: jsonData.summary?.staff,
      hsp: jsonData.summary?.hsp,
      locationsCount: jsonData.locations?.length,
      departmentsCount: jsonData.departments?.length
    });
    
    // Transform data for PocketBase
    const pbData = transformWorkforceDataForPocketBase(jsonData);
    
    // Check if record already exists for this period
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
    console.log('📊 Created record summary:', {
      id: newRecord.id,
      reporting_period: newRecord.reporting_period,
      total_employees: newRecord.total_employees,
      benefit_eligible_faculty: newRecord.benefit_eligible_faculty,
      benefit_eligible_staff: newRecord.benefit_eligible_staff
    });
    
    return newRecord;
    
  } catch (error) {
    console.error('❌ Failed to add workforce data:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
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
      const latestRecord = records[records.length - 1];
      console.log('📊 Latest record structure:', {
        id: latestRecord.id,
        reporting_period: latestRecord.reporting_period,
        total_employees: latestRecord.total_employees,
        benefit_eligible_faculty: latestRecord.benefit_eligible_faculty,
        benefit_eligible_staff: latestRecord.benefit_eligible_staff,
        hsp: latestRecord.demographics?.hsp,
        locations_count: latestRecord.location_breakdown?.locations?.length,
        created: latestRecord.created,
        updated: latestRecord.updated
      });
      
      // Test specific data access
      console.log('\n🔍 Testing location data access:');
      if (latestRecord.location_breakdown?.locations) {
        latestRecord.location_breakdown.locations.forEach((location, index) => {
          console.log(`   Location ${index + 1}: ${location.name} - ${location.total} employees`);
        });
      }
      
      console.log('\n🔍 Testing department data access:');
      if (latestRecord.additional_metrics?.departments) {
        console.log(`   Found ${latestRecord.additional_metrics.departments.length} departments`);
        // Show top 3 departments
        latestRecord.additional_metrics.departments.slice(0, 3).forEach((dept, index) => {
          console.log(`   Top ${index + 1}: ${dept.name} - ${dept.total} employees`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to test PocketBase data:', error.message);
  }
}

async function main() {
  console.log('🚀 Adding workforce data to PocketBase...\n');
  
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
    
    // Step 3: Add workforce data
    console.log('\n📊 Adding workforce data...');
    const record = await addWorkforceData();
    
    // Step 4: Test data retrieval
    console.log('\n🧪 Testing data retrieval...');
    await testPocketBaseData();
    
    console.log('\n🎉 Data added successfully!');
    console.log('📱 View data in PocketBase Admin: http://localhost:8091/_/#/collections/workforce_data');
    console.log('🌐 Admin UI: http://localhost:8091/_/');
    console.log(`📋 Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, addWorkforceData, transformWorkforceDataForPocketBase };