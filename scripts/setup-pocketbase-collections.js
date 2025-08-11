#!/usr/bin/env node

/**
 * Script to create PocketBase collections for HR Reports v2
 * Creates the necessary collections with proper schema
 */

const PocketBase = require('pocketbase/cjs');

// Use container name when running inside Docker, localhost otherwise
const pbUrl = process.env.DOCKER_ENV ? 'http://pocketbase:8090' : 'http://localhost:8091';
const pb = new PocketBase(pbUrl);

console.log(`🔗 Connecting to PocketBase at: ${pbUrl}`);

const COLLECTIONS = {
  workforce_data: {
    name: 'workforce_data',
    type: 'base',
    schema: [
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
    listRule: null, // Public read access
    viewRule: null, // Public read access  
    createRule: '', // Admin only create
    updateRule: '', // Admin only update
    deleteRule: ''  // Admin only delete
  },

  turnover_data: {
    name: 'turnover_data',
    type: 'base',
    schema: [
      {
        name: 'reporting_period',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'total_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'faculty_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'staff_exempt_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'staff_non_exempt_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'voluntary_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'involuntary_turnover_rate',
        type: 'number',
        required: false
      },
      {
        name: 'total_separations',
        type: 'number',
        required: false
      },
      {
        name: 'exit_reasons',
        type: 'json',
        required: false
      },
      {
        name: 'exit_survey_scores',
        type: 'json',
        required: false
      },
      {
        name: 'locations',
        type: 'json',
        required: false
      },
      {
        name: 'benchmarks',
        type: 'json',
        required: false
      },
      {
        name: 'historical_analysis',
        type: 'json',
        required: false
      },
      {
        name: 'additional_metrics',
        type: 'json',
        required: false
      }
    ],
    listRule: null, // Public read access
    viewRule: null, // Public read access  
    createRule: '', // Admin only create
    updateRule: '', // Admin only update
    deleteRule: ''  // Admin only delete
  },

  exit_survey_data: {
    name: 'exit_survey_data',
    type: 'base',
    schema: [
      {
        name: 'reporting_period',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'response_rate',
        type: 'number',
        required: false
      },
      {
        name: 'total_responses',
        type: 'number',
        required: false
      },
      {
        name: 'collection_period',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'overall_experience',
        type: 'json',
        required: false
      },
      {
        name: 'career_development',
        type: 'json',
        required: false
      },
      {
        name: 'leadership',
        type: 'json',
        required: false
      },
      {
        name: 'compensation',
        type: 'json',
        required: false
      },
      {
        name: 'work_environment',
        type: 'json',
        required: false
      },
      {
        name: 'key_themes',
        type: 'json',
        required: false
      },
      {
        name: 'positive_feedback',
        type: 'json',
        required: false
      },
      {
        name: 'areas_of_concern',
        type: 'json',
        required: false
      }
    ],
    listRule: null, // Public read access
    viewRule: null, // Public read access  
    createRule: '', // Admin only create
    updateRule: '', // Admin only update
    deleteRule: ''  // Admin only delete
  }
};

async function createCollection(collectionData) {
  try {
    // Check if collection already exists
    try {
      await pb.collections.getOne(collectionData.name);
      console.log(`   ⚠️  Collection '${collectionData.name}' already exists, skipping...`);
      return true;
    } catch (error) {
      // Collection doesn't exist, create it
    }

    const collection = await pb.collections.create(collectionData);
    console.log(`   ✅ Created collection '${collectionData.name}' with ${collectionData.schema.length} fields`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to create collection '${collectionData.name}':`, error.message);
    return false;
  }
}

async function setupCollections() {
  console.log('🚀 Setting up PocketBase collections for HR Reports v2...\n');

  try {
    // Test connection
    await pb.health.check();
    console.log('✅ PocketBase connection successful\n');

    // Authenticate as admin
    const adminEmail = process.env.PB_ADMIN_EMAIL || 'admin@admin.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'SecurePassword123!';
    
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('🔐 Authenticated as admin\n');
    } catch (authError) {
      console.error('❌ Failed to authenticate as admin:', authError.message);
      console.error('   Please ensure the admin user exists with the correct credentials');
      console.error('   Run: ./scripts/pocketbase-admin-manager.sh create admin@hr-reports.local admin123456');
      process.exit(1);
    }

    let successCount = 0;
    let totalCount = Object.keys(COLLECTIONS).length;

    for (const [key, collectionData] of Object.entries(COLLECTIONS)) {
      console.log(`📊 Creating ${collectionData.name} collection...`);
      const success = await createCollection(collectionData);
      if (success) successCount++;
    }

    console.log(`\n🎉 Setup complete! ${successCount}/${totalCount} collections ready`);
    console.log(`\n📱 Access PocketBase Admin UI: http://localhost:8090/_/`);
    console.log(`📊 View collections: http://localhost:8090/_/#/collections`);

    if (successCount === totalCount) {
      console.log(`\n✅ All collections created successfully!`);
      console.log(`Next steps:`);
      console.log(`  1. Run migration: npm run migrate:pocketbase`);
      console.log(`  2. Access admin UI to view data: http://localhost:8090/_/`);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('  1. PocketBase is running: docker-compose up pocketbase');
    console.error('  2. PocketBase is accessible: http://localhost:8090');
    process.exit(1);
  }
}

// Run setup
setupCollections().catch(console.error);