#!/usr/bin/env node

/**
 * Quick test script to verify PocketBase data retrieval
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://localhost:8091');

async function testPocketBaseData() {
  try {
    // Test connection
    const health = await pb.health.check();
    console.log('✅ PocketBase Health:', health.message);
    
    // Test data retrieval without auth (public access)
    console.log('\n📊 Testing workforce data retrieval...');
    const records = await pb.collection('workforce_data').getFullList();
    
    console.log(`✅ Retrieved ${records.length} workforce records`);
    
    if (records.length > 0) {
      const record = records[0];
      console.log('\n📊 Record Details:');
      console.log('- ID:', record.id);
      console.log('- Reporting Period:', record.reporting_period);
      console.log('- Total Employees:', record.total_employees);
      console.log('- BE Faculty:', record.benefit_eligible_faculty);
      console.log('- BE Staff:', record.benefit_eligible_staff);
      console.log('- NBE Faculty:', record.non_benefit_eligible_faculty);
      console.log('- NBE Staff:', record.non_benefit_eligible_staff);
      console.log('- Students:', record.total_students);
      console.log('- New Hires:', record.new_hires);
      console.log('- Terminations:', record.terminations);
      console.log('- Vacancy Rate:', record.vacancy_rate);
      console.log('- Location Data:', record.location_breakdown);
      console.log('- Demographics:', record.demographics);
      console.log('- Created:', record.created);
      console.log('- Updated:', record.updated);
      
      console.log('\n🎯 Ready for React Query integration!');
      console.log('The data can now be consumed by useDashboardDataPB hook');
    } else {
      console.log('⚠️  No workforce records found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.status === 403) {
      console.log('ℹ️  This might be due to collection permissions. Check PocketBase admin.');
    }
  }
}

testPocketBaseData();