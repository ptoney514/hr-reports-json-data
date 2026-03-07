/**
 * CLI Parser - Shared command-line argument parsing for ETL scripts
 *
 * Extracts the duplicated parseArgs() and printHelp() patterns from 9 ETL scripts.
 * Merges common flags (--dry-run, --help, --verbose) with script-specific options.
 */

const { colors } = require('./formatting');

/**
 * Parse command line arguments with common + script-specific options
 *
 * Common flags handled automatically:
 *   --dry-run          Preview without database writes
 *   --verbose, -v      Show detailed output
 *   --help, -h         Show help message
 *
 * @param {string} scriptName - Name of the script (for help display)
 * @param {Object[]} scriptOptions - Script-specific option definitions
 * @param {string} scriptOptions[].flags - Comma-separated flags (e.g., '--input,-i')
 * @param {string} scriptOptions[].key - Key name in returned options object
 * @param {string} scriptOptions[].type - 'string' (takes next arg) or 'boolean' (flag only)
 * @param {*} [scriptOptions[].default] - Default value (string: null, boolean: false)
 * @param {string} scriptOptions[].description - Help text for this option
 * @param {Object} [helpConfig] - Configuration for help display
 * @param {string} helpConfig.title - Help title
 * @param {string[]} helpConfig.usage - Usage example lines
 * @param {string[]} [helpConfig.examples] - Example lines
 * @param {string[]} [helpConfig.notes] - Additional notes
 * @returns {Object} Parsed options object with common + script-specific keys
 */
function parseArgs(scriptName, scriptOptions = [], helpConfig = {}) {
  const args = process.argv.slice(2);

  // Build defaults
  const options = {
    dryRun: false,
    verbose: false
  };

  for (const opt of scriptOptions) {
    options[opt.key] = opt.default !== undefined ? opt.default : (opt.type === 'boolean' ? false : null);
  }

  // Build flag-to-option lookup
  const flagMap = {};
  for (const opt of scriptOptions) {
    const flags = opt.flags.split(',').map(f => f.trim());
    for (const flag of flags) {
      flagMap[flag] = opt;
    }
  }

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Common flags
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      printHelp(scriptName, scriptOptions, helpConfig);
      process.exit(0);
    }

    // Script-specific flags
    const opt = flagMap[arg];
    if (opt) {
      if (opt.type === 'boolean') {
        options[opt.key] = true;
      } else {
        options[opt.key] = args[++i];
      }
    }
  }

  return options;
}

/**
 * Print help message using consistent formatting
 *
 * @param {string} scriptName - Script name for title
 * @param {Object[]} scriptOptions - Script-specific option definitions
 * @param {Object} helpConfig - Help display configuration
 */
function printHelp(scriptName, scriptOptions, helpConfig) {
  const title = helpConfig.title || scriptName;
  const usage = helpConfig.usage || [];
  const examples = helpConfig.examples || [];
  const notes = helpConfig.notes || [];

  let output = `\n${colors.cyan}${title}${colors.reset}\n`;

  if (usage.length > 0) {
    output += `\n${colors.yellow}Usage:${colors.reset}\n`;
    usage.forEach(line => { output += `  ${line}\n`; });
  }

  output += `\n${colors.yellow}Options:${colors.reset}\n`;

  // Script-specific options first
  for (const opt of scriptOptions) {
    const flags = opt.flags.split(',').map(f => f.trim());
    const flagStr = flags.join(', ');
    const typeHint = opt.type === 'string' ? ' VALUE' : '';
    output += `  ${(flagStr + typeHint).padEnd(24)} ${opt.description}\n`;
  }

  // Common options
  output += `  ${'--dry-run'.padEnd(24)} Preview without database writes\n`;
  output += `  ${'-v, --verbose'.padEnd(24)} Show detailed output\n`;
  output += `  ${'-h, --help'.padEnd(24)} Show this help message\n`;

  if (examples.length > 0) {
    output += `\n${colors.yellow}Examples:${colors.reset}\n`;
    examples.forEach(line => { output += `  ${line}\n`; });
  }

  if (notes.length > 0) {
    output += `\n${colors.yellow}Notes:${colors.reset}\n`;
    notes.forEach(line => { output += `  ${line}\n`; });
  }

  console.log(output);
}

module.exports = {
  parseArgs,
  printHelp
};
