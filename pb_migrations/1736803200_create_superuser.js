migrate((app) => {
    // This migration creates a default superuser account
    // Only runs if no superuser with this email exists
    
    // Check if the admin already exists
    try {
        const existingAdmin = app.findAuthRecordByEmail("_superusers", "admin@admin.com");
        if (existingAdmin) {
            console.log("Superuser admin@admin.com already exists, skipping creation");
            return;
        }
    } catch (e) {
        // Admin doesn't exist, proceed with creation
    }
    
    // Create the superuser
    const superusersCollection = app.findCollectionByNameOrId("_superusers");
    const record = new Record(superusersCollection);
    
    // Set the admin credentials
    record.set("email", "admin@admin.com");
    record.set("password", "SecurePassword123!");
    
    // Save the record
    app.save(record);
    
    console.log("✅ Superuser admin@admin.com created via migration");
    console.log("   Email: admin@admin.com");
    console.log("   Password: SecurePassword123!");
}, (app) => {
    // Rollback: Remove the superuser if needed
    try {
        const record = app.findAuthRecordByEmail("_superusers", "admin@admin.com");
        if (record) {
            app.delete(record);
            console.log("Superuser admin@admin.com removed (rollback)");
        }
    } catch (e) {
        // Silent error - record might not exist
    }
});