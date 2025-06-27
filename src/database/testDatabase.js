import hrDatabase from './HRDatabase.js';
import MigrationRunner from './migrations/migrationRunner.js';

/**
 * Test the HR Database setup
 */
export async function testDatabaseSetup() {
  try {
    console.log('🧪 Testing HR Database Setup...');
    
    // Test 1: Initialize database
    console.log('1️⃣ Testing database initialization...');
    await hrDatabase.initialize();
    console.log('✅ Database initialized successfully');
    
    // Test 2: Health check
    console.log('2️⃣ Testing health check...');
    const health = await hrDatabase.healthCheck();
    console.log('✅ Health check passed:', health.status);
    
    // Test 3: Get workforce data
    console.log('3️⃣ Testing workforce data retrieval...');
    const workforceData = await hrDatabase.getWorkforceData();
    console.log('✅ Workforce data retrieved, total headcount:', workforceData?.currentPeriod?.headcount?.total);
    
    // Test 4: Get turnover data
    console.log('4️⃣ Testing turnover data retrieval...');
    const turnoverData = await hrDatabase.getTurnoverData();
    console.log('✅ Turnover data retrieved, overall rate:', turnoverData?.currentFiscalYear?.overallTurnover?.annualizedTurnoverRate);
    
    // Test 5: Get database stats
    console.log('5️⃣ Testing database statistics...');
    const stats = await hrDatabase.getStats();
    console.log('✅ Database stats retrieved:', {
      workforceRecords: stats.workforceRecords,
      turnoverRecords: stats.turnoverRecords,
      size: `${Math.round(stats.totalSize / 1024)} KB`
    });
    
    // Test 6: Test migration runner
    console.log('6️⃣ Testing migration runner...');
    const migrationRunner = new MigrationRunner(hrDatabase);
    const migrationStatus = await migrationRunner.getStatus();
    console.log('✅ Migration runner working:', {
      totalMigrations: migrationStatus.totalMigrations,
      pendingMigrations: migrationStatus.pendingMigrations
    });
    
    console.log('🎉 All tests passed! Database setup is working correctly.');
    
    return {
      success: true,
      message: 'Database setup test completed successfully',
      details: {
        health,
        stats,
        migrationStatus,
        workforceDataAvailable: !!workforceData,
        turnoverDataAvailable: !!turnoverData
      }
    };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Database setup test failed'
    };
  }
}

/**
 * Quick database info for debugging
 */
export async function getDatabaseInfo() {
  try {
    await hrDatabase.initialize();
    
    const [health, stats, metadata] = await Promise.all([
      hrDatabase.healthCheck(),
      hrDatabase.getStats(),
      hrDatabase.getMetadata()
    ]);
    
    return {
      health,
      stats,
      metadata,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in components or console testing
export { hrDatabase };

const testDatabaseModule = {
  testDatabaseSetup,
  getDatabaseInfo,
  hrDatabase
};

export default testDatabaseModule; 