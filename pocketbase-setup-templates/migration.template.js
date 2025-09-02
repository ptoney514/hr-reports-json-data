// Pocketbase Admin Account Migration Template
// Copy this to: pb_migrations/TIMESTAMP_create_admin.js
// Replace TIMESTAMP with current Unix timestamp (e.g., 1736803200)

/**
 * CRITICAL: This migration-based approach prevents 400 errors
 * that occur when trying to create admin accounts via API.
 * 
 * This migration is IDEMPOTENT - safe to run multiple times
 * 
 * Usage:
 * 1. Create directory: mkdir -p pb_migrations
 * 2. Copy this file as: pb_migrations/1736803200_create_admin.js
 * 3. Customize admin credentials below
 * 4. Start Pocketbase - migration runs automatically
 */

migrate((app) => {
    console.log('🔧 Running admin account creation migration...');
    
    // Configuration - CHANGE THESE VALUES
    const ADMIN_EMAIL = "admin@admin.com";
    const ADMIN_PASSWORD = "SecurePassword123!";
    
    // Check if admin already exists (idempotent operation)
    try {
        const existingAdmin = app.findAuthRecordByEmail("_superusers", ADMIN_EMAIL);
        if (existingAdmin) {
            console.log(`✅ Superuser ${ADMIN_EMAIL} already exists, skipping creation`);
            return;
        }
    } catch (e) {
        // Admin doesn't exist, proceed with creation
        console.log(`🔨 Creating new admin account: ${ADMIN_EMAIL}`);
    }
    
    try {
        // Get the superusers collection
        const superusersCollection = app.findCollectionByNameOrId("_superusers");
        
        if (!superusersCollection) {
            console.error('❌ _superusers collection not found');
            return;
        }
        
        // Create new admin record
        const record = new Record(superusersCollection);
        
        // Set admin credentials
        record.set("email", ADMIN_EMAIL);
        record.set("password", ADMIN_PASSWORD);
        
        // Save the record
        app.save(record);
        
        console.log('✅ Admin account created successfully via migration');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Admin UI: http://localhost:8091/_/`);
        
    } catch (error) {
        console.error('❌ Failed to create admin account:', error);
        throw error;
    }
    
}, (app) => {
    // Rollback function - removes the admin account if needed
    console.log('🔄 Rolling back admin account creation...');
    
    const ADMIN_EMAIL = "admin@admin.com";
    
    try {
        const record = app.findAuthRecordByEmail("_superusers", ADMIN_EMAIL);
        if (record) {
            app.delete(record);
            console.log(`✅ Admin account ${ADMIN_EMAIL} removed (rollback)`);
        } else {
            console.log('ℹ️  Admin account not found for rollback');
        }
    } catch (e) {
        console.log('ℹ️  Admin account rollback completed (may not have existed)');
    }
});

/**
 * IMPORTANT NOTES:
 * 
 * 1. WHY MIGRATIONS WORK (vs API calls that fail):
 *    - Migrations run with full administrative privileges
 *    - API calls are subject to validation rules and permissions
 *    - Migrations bypass the 400 error that plagues API-based creation
 * 
 * 2. CUSTOMIZATION:
 *    - Change ADMIN_EMAIL and ADMIN_PASSWORD above
 *    - Use strong passwords in production
 *    - Consider using environment variables for credentials
 * 
 * 3. FILE NAMING:
 *    - Use format: TIMESTAMP_descriptive_name.js
 *    - Timestamp determines execution order
 *    - Example: 1736803200_create_admin.js
 * 
 * 4. TROUBLESHOOTING:
 *    - Check Pocketbase logs: docker logs CONTAINER_NAME
 *    - Verify pb_migrations directory is mounted correctly
 *    - Ensure file has .js extension
 *    - Check migration runs on container start
 * 
 * 5. VERIFICATION:
 *    - Visit http://localhost:8091/_/
 *    - Login with credentials specified above
 *    - Should NOT get 400 errors with this approach
 */