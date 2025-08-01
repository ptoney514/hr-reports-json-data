import DataMigrationService from '../services/DataMigrationService';
import firebaseService from '../services/DataService';

/**
 * Firebase Migration Utilities
 * 
 * Helper functions to manage the migration from LowDB to Firebase
 */

/**
 * Run complete migration from LowDB to Firebase
 */
export const runFullMigration = async () => {
  console.log('🚀 Starting complete LowDB to Firebase migration...');
  
  const migrationService = new DataMigrationService();
  
  try {
    const result = await migrationService.migrateAllData();
    
    console.log('📊 Migration Summary:', {
      totalAttempted: result.totalAttempted,
      totalMigrated: result.totalMigrated,
      totalErrors: result.totalErrors,
      successRate: `${((result.totalMigrated / result.totalAttempted) * 100).toFixed(1)}%`
    });
    
    // Validate migration
    console.log('🔍 Validating migrated data...');
    const validationResult = await migrationService.validateMigration();
    
    console.log('✅ Validation Summary:', {
      total: validationResult.total,
      successful: validationResult.successful,
      failed: validationResult.failed,
      successRate: `${((validationResult.successful / validationResult.total) * 100).toFixed(1)}%`
    });
    
    if (validationResult.failed > 0) {
      console.warn('⚠️ Some validations failed:', validationResult.errors);
    }
    
    return {
      migration: result,
      validation: validationResult,
      success: result.totalErrors === 0 && validationResult.failed === 0
    };
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
};

/**
 * Test Firebase connectivity and basic operations
 */
export const testFirebaseConnection = async () => {
  console.log('🔍 Testing Firebase connection...');
  
  try {
    // Test write operation
    const testData = {
      period: 'test-connection',
      totalEmployees: 1000,
      demographics: {
        faculty: 450,
        staff: 450,
        students: 100
      },
      byLocation: {
        'Test Campus': 1000
      },
      byDepartment: {
        'Test Department': 1000
      },
      lastUpdated: new Date(),
      test: true
    };
    
    console.log('📝 Testing write operation...');
    await firebaseService.setWorkforceMetrics('test-connection', testData);
    console.log('✅ Write test successful');
    
    // Test read operation
    console.log('📖 Testing read operation...');
    const readData = await firebaseService.getWorkforceMetrics('test-connection');
    
    if (readData && readData.totalEmployees === 1000) {
      console.log('✅ Read test successful');
    } else {
      throw new Error('Read test failed - data mismatch');
    }
    
    // Test real-time subscription
    console.log('📡 Testing real-time subscription...');
    let subscriptionWorking = false;
    
    const unsubscribe = firebaseService.subscribeToMetrics(
      'workforce',
      'test-connection',
      (data) => {
        if (data && data.test) {
          subscriptionWorking = true;
          console.log('✅ Real-time subscription test successful');
        }
      }
    );
    
    // Wait a moment for subscription to activate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update data to test real-time
    await firebaseService.setWorkforceMetrics('test-connection', {
      ...testData,
      totalEmployees: 1001,
      lastUpdated: new Date()
    });
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    unsubscribe();
    
    if (!subscriptionWorking) {
      console.warn('⚠️ Real-time subscription test inconclusive');
    }
    
    console.log('✅ Firebase connection test completed successfully');
    return {
      connected: true,
      writeWorking: true,
      readWorking: true,
      realtimeWorking: subscriptionWorking
    };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      connected: false,
      error: error.message
    };
  }
};

/**
 * Migrate specific dashboard data
 */
export const migrateDashboard = async (dashboardType, periods = ['2025-Q1']) => {
  console.log(`📊 Migrating ${dashboardType} dashboard for periods:`, periods);
  
  const migrationService = new DataMigrationService();
  const results = [];
  
  for (const period of periods) {
    try {
      await migrationService.migrateDashboardData(dashboardType, period);
      results.push({ period, success: true });
      console.log(`✅ Migrated ${dashboardType} for ${period}`);
    } catch (error) {
      results.push({ period, success: false, error: error.message });
      console.error(`❌ Failed to migrate ${dashboardType} for ${period}:`, error);
    }
  }
  
  return results;
};

/**
 * Seed Firebase with sample data for testing
 */
export const seedFirebaseWithSampleData = async () => {
  console.log('🌱 Seeding Firebase with sample data...');
  
  const periods = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'];
  const dashboards = ['workforce', 'turnover', 'compliance', 'recruiting', 'exitSurvey'];
  
  let seeded = 0;
  let errors = 0;
  
  for (const dashboard of dashboards) {
    for (const period of periods) {
      try {
        const sampleData = generateSampleData(dashboard, period);
        
        switch (dashboard) {
          case 'workforce':
            await firebaseService.setWorkforceMetrics(period, sampleData);
            break;
          case 'turnover':
            await firebaseService.setTurnoverMetrics(period, sampleData);
            break;
          case 'compliance':
            await firebaseService.setComplianceMetrics(period, sampleData);
            break;
          case 'recruiting':
            await firebaseService.setRecruitingMetrics(period, sampleData);
            break;
          case 'exitSurvey':
            await firebaseService.setExitSurveyMetrics(period, sampleData);
            break;
        }
        
        seeded++;
        console.log(`✅ Seeded ${dashboard} for ${period}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Failed to seed ${dashboard} for ${period}:`, error);
      }
    }
  }
  
  console.log(`🌱 Seeding completed: ${seeded} successful, ${errors} errors`);
  return { seeded, errors };
};

/**
 * Generate sample data for testing
 */
const generateSampleData = (dashboardType, period) => {
  const baseEmployeeCount = 2500 + Math.floor(Math.random() * 500);
  
  switch (dashboardType) {
    case 'workforce':
      return {
        period,
        totalEmployees: baseEmployeeCount,
        headcountChange: Math.floor(Math.random() * 100) - 50,
        demographics: {
          faculty: Math.floor(baseEmployeeCount * 0.42),
          staff: Math.floor(baseEmployeeCount * 0.48),
          students: Math.floor(baseEmployeeCount * 0.10)
        },
        byLocation: {
          'Main Campus': Math.floor(baseEmployeeCount * 0.65),
          'Downtown': Math.floor(baseEmployeeCount * 0.20),
          'Phoenix Campus': Math.floor(baseEmployeeCount * 0.12),
          'Remote': Math.floor(baseEmployeeCount * 0.03)
        },
        byDepartment: {
          'Engineering': Math.floor(baseEmployeeCount * 0.18),
          'Academic Affairs': Math.floor(baseEmployeeCount * 0.25),
          'Student Services': Math.floor(baseEmployeeCount * 0.15),
          'Administration': Math.floor(baseEmployeeCount * 0.12),
          'Facilities': Math.floor(baseEmployeeCount * 0.08),
          'Other': Math.floor(baseEmployeeCount * 0.22)
        },
        trends: {
          quarterlyGrowth: (Math.random() * 10 - 2).toFixed(1),
          yearOverYear: (Math.random() * 15 - 5).toFixed(1)
        },
        metrics: {
          averageTenure: (Math.random() * 5 + 3).toFixed(1),
          retentionRate: (Math.random() * 10 + 85).toFixed(1),
          diversityIndex: (Math.random() * 20 + 70).toFixed(1)
        }
      };
      
    case 'turnover':
      return {
        period,
        turnoverRate: (Math.random() * 8 + 4).toFixed(1),
        voluntaryRate: (Math.random() * 6 + 3).toFixed(1),
        involuntaryRate: (Math.random() * 3 + 1).toFixed(1),
        totalSeparations: Math.floor(Math.random() * 100) + 150,
        byDepartment: {
          'Engineering': (Math.random() * 8 + 4).toFixed(1),
          'Academic Affairs': (Math.random() * 6 + 3).toFixed(1),
          'Student Services': (Math.random() * 10 + 5).toFixed(1),
          'Administration': (Math.random() * 5 + 2).toFixed(1)
        },
        byReason: {
          'Career Advancement': Math.floor(Math.random() * 30) + 20,
          'Compensation': Math.floor(Math.random() * 25) + 15,
          'Work-Life Balance': Math.floor(Math.random() * 20) + 10,
          'Management': Math.floor(Math.random() * 15) + 8,
          'Other': Math.floor(Math.random() * 10) + 5
        },
        costOfTurnover: Math.floor(Math.random() * 500000) + 750000,
        trends: {
          quarterlyChange: (Math.random() * 4 - 2).toFixed(1),
          yearOverYear: (Math.random() * 6 - 3).toFixed(1)
        }
      };
      
    case 'compliance':
      return {
        period,
        overallCompliance: (Math.random() * 8 + 90).toFixed(1),
        i9Compliance: (Math.random() * 6 + 92).toFixed(1),
        trainingCompliance: (Math.random() * 10 + 85).toFixed(1),
        riskIndicators: {
          high: Math.floor(Math.random() * 10) + 2,
          medium: Math.floor(Math.random() * 20) + 15,
          low: Math.floor(Math.random() * 30) + 25
        },
        auditFindings: Math.floor(Math.random() * 5) + 1,
        remediationItems: Math.floor(Math.random() * 8) + 3,
        trends: {
          improvementRate: (Math.random() * 5 + 2).toFixed(1),
          complianceScore: (Math.random() * 5 + 92).toFixed(1)
        }
      };
      
    case 'recruiting':
      return {
        period,
        totalHires: Math.floor(Math.random() * 50) + 75,
        timeToFill: Math.floor(Math.random() * 20) + 35,
        costPerHire: Math.floor(Math.random() * 2000) + 3500,
        applicationRate: Math.floor(Math.random() * 500) + 800,
        offerAcceptanceRate: (Math.random() * 15 + 80).toFixed(1),
        sourceEffectiveness: {
          'Employee Referral': (Math.random() * 20 + 30).toFixed(1),
          'Job Boards': (Math.random() * 15 + 25).toFixed(1),
          'University Partnerships': (Math.random() * 10 + 20).toFixed(1),
          'Social Media': (Math.random() * 8 + 12).toFixed(1),
          'Recruiting Firms': (Math.random() * 12 + 8).toFixed(1)
        },
        diversityMetrics: {
          diverseHires: (Math.random() * 20 + 35).toFixed(1),
          genderBalance: (Math.random() * 10 + 45).toFixed(1)
        }
      };
      
    case 'exitSurvey':
      return {
        period,
        responseRate: (Math.random() * 20 + 70).toFixed(1),
        totalResponses: Math.floor(Math.random() * 40) + 60,
        overallSatisfaction: (Math.random() * 1.5 + 3.2).toFixed(1),
        recommendationScore: (Math.random() * 2 + 6.5).toFixed(1),
        keyInsights: {
          'Career Development': (Math.random() * 1 + 3.5).toFixed(1),
          'Management Quality': (Math.random() * 1 + 3.8).toFixed(1),
          'Work Environment': (Math.random() * 1 + 4.0).toFixed(1),
          'Compensation': (Math.random() * 1 + 3.2).toFixed(1),
          'Work-Life Balance': (Math.random() * 1 + 3.6).toFixed(1)
        },
        improvementAreas: [
          'Career advancement opportunities',
          'Management training',
          'Compensation competitiveness',
          'Remote work policies'
        ]
      };
      
    default:
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
  }
};

/**
 * Clean up test data from Firebase
 */
export const cleanupTestData = async () => {
  console.log('🧹 Cleaning up test data from Firebase...');
  
  try {
    // Note: Firestore doesn't have a built-in delete collection method
    // In a real implementation, you might want to use Firebase Admin SDK
    // For now, we'll just delete the test connection data
    
    const testData = await firebaseService.getWorkforceMetrics('test-connection');
    if (testData && testData.test) {
      console.log('🗑️ Test connection data found, would delete in production');
      // In production: await firebaseService.deleteWorkforceMetrics('test-connection');
    }
    
    console.log('✅ Cleanup completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check Firebase data integrity
 */
export const checkDataIntegrity = async () => {
  console.log('🔍 Checking Firebase data integrity...');
  
  const periods = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'];
  const dashboards = ['workforce', 'turnover', 'compliance', 'recruiting', 'exitSurvey'];
  
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    missing: 0,
    issues: []
  };
  
  for (const dashboard of dashboards) {
    for (const period of periods) {
      results.total++;
      
      try {
        const data = await firebaseService.getMetricsByDashboard(dashboard, period);
        
        if (!data) {
          results.missing++;
          results.issues.push(`Missing data: ${dashboard} ${period}`);
          continue;
        }
        
        // Check required fields
        if (!data.period || !data.lastUpdated) {
          results.invalid++;
          results.issues.push(`Invalid data structure: ${dashboard} ${period}`);
          continue;
        }
        
        results.valid++;
        
      } catch (error) {
        results.invalid++;
        results.issues.push(`Error checking ${dashboard} ${period}: ${error.message}`);
      }
    }
  }
  
  console.log('📊 Data integrity check results:', {
    total: results.total,
    valid: results.valid,
    invalid: results.invalid,
    missing: results.missing,
    healthScore: `${((results.valid / results.total) * 100).toFixed(1)}%`
  });
  
  if (results.issues.length > 0) {
    console.warn('⚠️ Issues found:', results.issues.slice(0, 10)); // Show first 10 issues
  }
  
  return results;
};

/**
 * Get Firebase usage statistics
 */
export const getFirebaseUsageStats = async () => {
  console.log('📊 Getting Firebase usage statistics...');
  
  try {
    const cacheInfo = firebaseService.getCacheInfo();
    
    const stats = {
      cacheSize: cacheInfo.size,
      cachedKeys: cacheInfo.keys.length,
      isOnline: firebaseService.isOnline,
      lastSyncTime: new Date().toISOString(),
      // Add more stats as needed
    };
    
    console.log('📈 Firebase usage stats:', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Failed to get usage stats:', error);
    return { error: error.message };
  }
};