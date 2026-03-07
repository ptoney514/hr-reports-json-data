/**
 * ETL Runner - Shared main() boilerplate for ETL scripts
 *
 * Extracts the duplicated main() lifecycle from 9 ETL scripts (~405 lines total).
 * Handles connection check, audit log lifecycle, banner, error handling, and cleanup.
 *
 * FIX: The dead ternary bug `errored > 0 ? 'completed' : 'completed'` has been
 * corrected to use 'completed_with_errors' vs 'completed'.
 */

const path = require('path');
const { endPool, startAuditLog, completeAuditLog, checkConnection } = require('../etl/neon-client');
const { colors, printBanner, printComplete, error } = require('./formatting');

/**
 * Run an ETL pipeline with standard lifecycle
 *
 * Handles:
 * 1. Print banner
 * 2. Check database connection
 * 3. Start audit log (unless dry-run)
 * 4. Execute the ETL logic callback
 * 5. Complete audit log with correct status
 * 6. Print completion footer
 * 7. Clean up connection pool
 * 8. Catch and report fatal errors
 *
 * @param {Object} config - ETL configuration
 * @param {string} config.title - Banner/completion title (e.g., 'Demographics ETL to Postgres')
 * @param {string} config.loadType - Audit log load type (e.g., 'demographics')
 * @param {boolean} [config.dryRun=false] - Whether this is a dry-run
 * @param {Function} config.run - Async callback containing ETL logic
 *   Called with: ({ loadId }) => Promise<{ recordsRead, inserted, updated, errored, sourceFile, periodDate, fiscalPeriod }>
 *   The callback should return an object with at least { inserted, updated, errored }.
 *   Optional fields: recordsRead, sourceFile, periodDate, fiscalPeriod.
 */
async function runETL(config) {
  const { title, loadType, dryRun = false, run } = config;

  const execute = async () => {
    printBanner(title);

    if (dryRun) {
      console.log(`${colors.yellow}[DRY RUN MODE] No database writes will be made${colors.reset}\n`);
    }

    // Check connection
    console.log(`${colors.blue}Checking database connection...${colors.reset}`);
    const connected = await checkConnection();

    if (!connected) {
      error('Failed to connect to database.');
      process.exit(1);
    }
    console.log(`${colors.green}✓${colors.reset} Connected\n`);

    // Execute ETL logic - callback may start its own audit log or let us handle it
    const result = await run({});

    // Start audit log if the callback provided enough info and we're not in dry-run
    if (!dryRun && result.sourceFile && result.periodDate) {
      const loadId = await startAuditLog({
        loadType,
        sourceFile: path.basename(result.sourceFile),
        periodDate: result.periodDate,
        fiscalPeriod: result.fiscalPeriod || null
      });

      const errored = result.errored || 0;

      await completeAuditLog(loadId, {
        recordsRead: result.recordsRead || (result.inserted + result.updated + errored),
        recordsInserted: result.inserted || 0,
        recordsUpdated: result.updated || 0,
        recordsErrored: errored,
        status: errored > 0 ? 'completed_with_errors' : 'completed',
        errorMessage: errored > 0 ? `${errored} records failed` : null
      });
    }

    printComplete(`${title} Complete`);
    await endPool();
  };

  execute().catch(async (err) => {
    console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
    console.error(err.stack);
    await endPool();
    process.exit(1);
  });
}

/**
 * Start an audit log for manual lifecycle management
 *
 * Use this when your ETL script needs to start/complete the audit log
 * at specific points (e.g., after loading data but before processing).
 *
 * @param {Object} params - Audit log parameters
 * @param {string} params.loadType - ETL type identifier
 * @param {string} params.sourceFile - Source file name
 * @param {string} params.periodDate - Period date
 * @param {string} params.fiscalPeriod - Fiscal period key
 * @param {boolean} params.dryRun - Skip if dry-run
 * @returns {Promise<number|null>} Load ID or null if dry-run
 */
async function startAudit({ loadType, sourceFile, periodDate, fiscalPeriod, dryRun }) {
  if (dryRun) return null;

  const loadId = await startAuditLog({
    loadType,
    sourceFile: path.basename(sourceFile),
    periodDate,
    fiscalPeriod
  });

  console.log(`${colors.blue}Audit log started (ID: ${loadId})${colors.reset}\n`);
  return loadId;
}

/**
 * Complete an audit log with correct status derivation
 *
 * FIX: Uses 'completed_with_errors' when errored > 0, not the dead ternary
 * that was duplicated across scripts.
 *
 * @param {number|null} loadId - Audit log ID (null = skip)
 * @param {Object} counts - Record counts
 * @param {number} counts.recordsRead - Total records read
 * @param {number} counts.inserted - Records inserted
 * @param {number} counts.updated - Records updated
 * @param {number} counts.errored - Records with errors
 */
async function completeAudit(loadId, { recordsRead, inserted, updated, errored }) {
  if (!loadId) return;

  await completeAuditLog(loadId, {
    recordsRead: recordsRead || (inserted + updated + errored),
    recordsInserted: inserted || 0,
    recordsUpdated: updated || 0,
    recordsErrored: errored || 0,
    status: errored > 0 ? 'completed_with_errors' : 'completed',
    errorMessage: errored > 0 ? `${errored} records failed` : null
  });
}

module.exports = {
  runETL,
  startAudit,
  completeAudit
};
