// Migration runner for HR Database

class MigrationRunner {
  constructor(database) {
    this.database = database;
    this.migrations = [];
    this.migrationHistory = [];
  }

  /**
   * Register a migration
   */
  addMigration(migration) {
    if (!migration.id || !migration.name || !migration.up) {
      throw new Error('Migration must have id, name, and up function');
    }
    
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get migration history from database
   */
  async getMigrationHistory() {
    try {
      await this.database.ensureInitialized();
      
      if (!this.database.db.data.migrations) {
        this.database.db.data.migrations = {
          history: [],
          lastRun: null
        };
        await this.database.db.write();
      }
      
      return this.database.db.data.migrations.history || [];
    } catch (error) {
      console.error('Error getting migration history:', error);
      return [];
    }
  }

  /**
   * Record migration execution
   */
  async recordMigration(migrationId, migrationName) {
    try {
      await this.database.ensureInitialized();
      
      if (!this.database.db.data.migrations) {
        this.database.db.data.migrations = {
          history: [],
          lastRun: null
        };
      }
      
      this.database.db.data.migrations.history.push({
        id: migrationId,
        name: migrationName,
        executedAt: new Date().toISOString(),
        version: this.database.db.data.metadata.version
      });
      
      this.database.db.data.migrations.lastRun = new Date().toISOString();
      await this.database.db.write();
      
      console.log(`Migration recorded: ${migrationId} - ${migrationName}`);
    } catch (error) {
      console.error('Error recording migration:', error);
      throw error;
    }
  }

  /**
   * Check if migration has been run
   */
  async hasMigrationRun(migrationId) {
    const history = await this.getMigrationHistory();
    return history.some(record => record.id === migrationId);
  }

  /**
   * Run pending migrations
   */
  async runPendingMigrations() {
    try {
      console.log('Checking for pending migrations...');
      
      const history = await this.getMigrationHistory();
      const pendingMigrations = this.migrations.filter(
        migration => !history.some(record => record.id === migration.id)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations found');
        return { success: true, migrationsRun: 0 };
      }

      console.log(`Found ${pendingMigrations.length} pending migrations`);
      
      const results = [];
      
      for (const migration of pendingMigrations) {
        try {
          console.log(`Running migration: ${migration.id} - ${migration.name}`);
          
          // Create backup before migration
          const backupPath = await this.database.createBackup();
          console.log(`Backup created: ${backupPath}`);
          
          // Run the migration
          await migration.up(this.database.db.data);
          
          // Record successful migration
          await this.recordMigration(migration.id, migration.name);
          
          results.push({
            id: migration.id,
            name: migration.name,
            success: true,
            backup: backupPath
          });
          
          console.log(`Migration completed: ${migration.id}`);
          
        } catch (error) {
          console.error(`Migration failed: ${migration.id}`, error);
          
          results.push({
            id: migration.id,
            name: migration.name,
            success: false,
            error: error.message
          });
          
          // Stop on first failure
          break;
        }
      }
      
      return {
        success: results.every(r => r.success),
        migrationsRun: results.filter(r => r.success).length,
        results
      };
      
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    try {
      const history = await this.getMigrationHistory();
      const pendingMigrations = this.migrations.filter(
        migration => !history.some(record => record.id === migration.id)
      );
      
      return {
        totalMigrations: this.migrations.length,
        completedMigrations: history.length,
        pendingMigrations: pendingMigrations.length,
        lastRun: history.length > 0 ? history[history.length - 1].executedAt : null,
        pending: pendingMigrations.map(m => ({ id: m.id, name: m.name })),
        completed: history.map(h => ({ id: h.id, name: h.name, executedAt: h.executedAt }))
      };
    } catch (error) {
      console.error('Error getting migration status:', error);
      throw error;
    }
  }
}

export default MigrationRunner; 