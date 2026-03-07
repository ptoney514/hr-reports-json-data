/**
 * Formatting Utilities - ANSI colors and console output helpers
 *
 * Shared color definitions and formatting functions used across all ETL scripts.
 * Extracted to eliminate 9x duplication of color constants.
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Print a banner header for an ETL script
 *
 * @param {string} title - Banner title text
 */
function printBanner(title) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   ${title}${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

/**
 * Print a completion footer for an ETL script
 *
 * @param {string} title - Completion message text
 */
function printComplete(title) {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ ${title}${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);
}

/**
 * Format a success message with green checkmark
 *
 * @param {string} message - Success message
 */
function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

/**
 * Format an error message in red
 *
 * @param {string} message - Error message
 */
function error(message) {
  console.error(`${colors.red}${message}${colors.reset}`);
}

/**
 * Format a warning message in yellow
 *
 * @param {string} message - Warning message
 */
function warning(message) {
  console.log(`${colors.yellow}${message}${colors.reset}`);
}

/**
 * Format an info message in blue
 *
 * @param {string} message - Info message
 */
function info(message) {
  console.log(`${colors.blue}${message}${colors.reset}`);
}

/**
 * Get dry-run prefix string for console output
 *
 * @param {boolean} isDryRun - Whether dry-run mode is active
 * @returns {string} '[DRY RUN] ' or ''
 */
function dryRunPrefix(isDryRun) {
  return isDryRun ? '[DRY RUN] ' : '';
}

module.exports = {
  colors,
  printBanner,
  printComplete,
  success,
  error,
  warning,
  info,
  dryRunPrefix
};
