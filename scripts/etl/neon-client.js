#!/usr/bin/env node

/**
 * Neon Database Client
 *
 * Connection wrapper for @neondatabase/serverless
 * Provides consistent database access for all ETL scripts
 *
 * Usage:
 *   const { sql, pool, endPool } = require('./neon-client');
 *   const result = await sql`SELECT * FROM dim_schools`;
 */

const { neon, neonConfig, Pool } = require('@neondatabase/serverless');

// Configure Neon for Node.js environment
neonConfig.fetchConnectionCache = true;

// Load environment variables
require('dotenv').config();

/**
 * Get the database URL from environment
 * @returns {string} Database connection URL
 * @throws {Error} If DATABASE_URL is not set
 */
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Set it in .env file or export it:\n' +
      '  export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"'
    );
  }

  return url;
}

/**
 * Create a SQL query function
 * Uses Neon's serverless driver for single queries
 *
 * @example
 * const result = await sql`SELECT * FROM dim_schools WHERE code = ${code}`;
 */
const sql = neon(getDatabaseUrl());

/**
 * Create a connection pool for batch operations
 * More efficient for multiple sequential queries
 */
let _pool = null;

function getPool() {
  if (!_pool) {
    _pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return _pool;
}

/**
 * End the pool connection
 * Call this when script is done to prevent hanging
 */
async function endPool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

/**
 * Execute a transaction
 *
 * @param {Function} callback - Async function receiving client
 * @returns {Promise<any>} Result of callback
 *
 * @example
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO table1 ...');
 *   await client.query('INSERT INTO table2 ...');
 * });
 */
async function transaction(callback) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run database migrations
 *
 * @param {string[]} migrationFiles - Array of migration file paths
 */
async function runMigrations(migrationFiles) {
  const fs = require('fs');
  const path = require('path');

  console.log('Running migrations...');

  for (const file of migrationFiles) {
    const filename = path.basename(file);
    console.log(`  Running: ${filename}`);

    const sqlContent = fs.readFileSync(file, 'utf-8');

    try {
      await sql(sqlContent);
      console.log(`  ✓ ${filename} completed`);
    } catch (error) {
      console.error(`  ✗ ${filename} failed: ${error.message}`);
      throw error;
    }
  }

  console.log('Migrations complete.');
}

/**
 * Run seed files
 *
 * @param {string[]} seedFiles - Array of seed file paths
 */
async function runSeeds(seedFiles) {
  const fs = require('fs');
  const path = require('path');

  console.log('Running seeds...');

  for (const file of seedFiles) {
    const filename = path.basename(file);
    console.log(`  Seeding: ${filename}`);

    const sqlContent = fs.readFileSync(file, 'utf-8');

    try {
      await sql(sqlContent);
      console.log(`  ✓ ${filename} completed`);
    } catch (error) {
      console.error(`  ✗ ${filename} failed: ${error.message}`);
      throw error;
    }
  }

  console.log('Seeding complete.');
}

/**
 * Start an audit log entry
 *
 * @param {Object} params
 * @param {string} params.loadType - Type of load (workforce, terminations, etc.)
 * @param {string} params.sourceFile - Source file name
 * @param {string} params.periodDate - Period date (YYYY-MM-DD)
 * @param {string} params.fiscalPeriod - Fiscal period label (FY25_Q1)
 * @returns {Promise<number>} Load ID for tracking
 */
async function startAuditLog({ loadType, sourceFile, periodDate, fiscalPeriod }) {
  const result = await sql`
    INSERT INTO audit_data_loads (load_type, source_file, period_date, fiscal_period, status)
    VALUES (${loadType}, ${sourceFile}, ${periodDate}, ${fiscalPeriod}, 'started')
    RETURNING load_id
  `;
  return result[0].load_id;
}

/**
 * Complete an audit log entry
 *
 * @param {number} loadId - Load ID from startAuditLog
 * @param {Object} stats - Load statistics
 */
async function completeAuditLog(loadId, { recordsRead, recordsInserted, recordsUpdated, recordsErrored, status = 'completed', errorMessage = null }) {
  await sql`
    UPDATE audit_data_loads
    SET
      records_read = ${recordsRead},
      records_inserted = ${recordsInserted},
      records_updated = ${recordsUpdated},
      records_errored = ${recordsErrored},
      status = ${status},
      error_message = ${errorMessage},
      completed_at = NOW()
    WHERE load_id = ${loadId}
  `;
}

/**
 * Check database connection
 * @returns {Promise<boolean>} True if connected
 */
async function checkConnection() {
  try {
    const result = await sql`SELECT 1 as connected`;
    return result[0]?.connected === 1;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * Get database info for debugging
 */
async function getDatabaseInfo() {
  const result = await sql`
    SELECT
      current_database() as database,
      current_user as user,
      version() as version
  `;
  return result[0];
}

module.exports = {
  sql,
  getPool,
  endPool,
  transaction,
  runMigrations,
  runSeeds,
  startAuditLog,
  completeAuditLog,
  checkConnection,
  getDatabaseInfo,
  getDatabaseUrl
};
