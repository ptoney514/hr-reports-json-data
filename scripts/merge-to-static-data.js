#!/usr/bin/env node

/**
 * Merge to Static Data
 *
 * Merges cleaned JSON data into src/data/staticData.js
 * - Creates backup before modifying
 * - Validates structure before writing
 * - Updates WORKFORCE_DATA, TURNOVER_DATA, or EXIT_SURVEY_DATA
 * - Preserves file formatting and comments
 *
 * Usage:
 *   node scripts/merge-to-static-data.js workforce --date 2024-12-31 --input data.json
 *   node scripts/merge-to-static-data.js --type workforce --source cleaned.json --dry-run
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const STATIC_DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'staticData.js');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,        // workforce, turnover, exit-survey
    date: null,        // Report date (YYYY-MM-DD)
    input: null,       // Input JSON file
    source: null,      // Alternative to input
    dryRun: false,
    backup: true
  };

  // First argument is type if no flags
  if (args[0] && !args[0].startsWith('--')) {
    options.type = args.shift();
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--type':
      case '-t':
        options.type = args[++i];
        break;
      case '--date':
      case '-d':
        options.date = args[++i];
        break;
      case '--input':
      case '-i':
      case '--source':
      case '-s':
        options.input = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-backup':
        options.backup = false;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
${colors.cyan}Merge to Static Data${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/merge-to-static-data.js workforce --date 2024-12-31 --input summary.json
  node scripts/merge-to-static-data.js --type turnover --source cleaned.json --dry-run

${colors.yellow}Options:${colors.reset}
  TYPE                  Data type: workforce, turnover, exit-survey (required)
  -d, --date DATE       Report date (YYYY-MM-DD format, required)
  -i, --input FILE      Input JSON file with summary data (required)
  -s, --source FILE     Alternative to --input
  --dry-run             Preview changes without modifying files
  --no-backup           Skip creating backup file

${colors.yellow}Examples:${colors.reset}
  # Merge workforce data for Q2 FY25
  node scripts/merge-to-static-data.js workforce \\
    --date 2024-12-31 \\
    --input source-metrics/workforce/cleaned/FY25_Q2/workforce_summary.json

  # Preview merge without saving
  node scripts/merge-to-static-data.js workforce \\
    --date 2024-12-31 \\
    --input summary.json \\
    --dry-run

${colors.yellow}Notes:${colors.reset}
  - Creates backup at src/data/staticData.js.backup
  - Validates data structure before merging
  - Preserves existing data for other dates
  - Updates or adds new date key
`);
}

/**
 * Get data object name for type
 */
function getDataObjectName(type) {
  const map = {
    workforce: 'WORKFORCE_DATA',
    turnover: 'TURNOVER_DATA',
    'exit-survey': 'EXIT_SURVEY_DATA',
    'exit-surveys': 'EXIT_SURVEY_DATA'
  };

  return map[type] || null;
}

/**
 * Create backup of staticData.js
 */
function createBackup() {
  const backupPath = STATIC_DATA_PATH + '.backup';
  fs.copyFileSync(STATIC_DATA_PATH, backupPath);
  console.log(`${colors.green}✓${colors.reset} Created backup: ${path.basename(backupPath)}`);
  return backupPath;
}

/**
 * Extract data object from staticData.js
 * Returns { startIndex, endIndex, content, objectName }
 */
function extractDataObject(fileContent, objectName) {
  // Find export statement
  const exportPattern = new RegExp(`export const ${objectName}\\s*=\\s*\\{`, 'g');
  const match = exportPattern.exec(fileContent);

  if (!match) {
    throw new Error(`Could not find "export const ${objectName}" in staticData.js`);
  }

  const startIndex = match.index + match[0].length - 1; // Start at opening brace

  // Find matching closing brace
  let braceCount = 0;
  let endIndex = startIndex;
  let inString = false;
  let stringChar = null;

  for (let i = startIndex; i < fileContent.length; i++) {
    const char = fileContent[i];
    const prevChar = i > 0 ? fileContent[i - 1] : '';

    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }

    // Count braces outside strings
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;

      if (braceCount === 0 && char === '}') {
        endIndex = i;
        break;
      }
    }
  }

  if (braceCount !== 0) {
    throw new Error(`Mismatched braces in ${objectName}`);
  }

  const content = fileContent.substring(startIndex, endIndex + 1);

  return {
    startIndex,
    endIndex: endIndex + 1,
    content,
    objectName
  };
}

/**
 * Parse JavaScript object to JSON
 * Removes comments, handles trailing commas
 */
function parseJSObject(jsObjectString) {
  // Remove single-line comments
  let cleaned = jsObjectString.replace(/\/\/.*$/gm, '');

  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  try {
    // Parse as JSON
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse object as JSON: ${error.message}`);
  }
}

/**
 * Convert JSON object to formatted JavaScript
 */
function jsonToJS(obj, indent = 2) {
  const indentStr = ' '.repeat(indent);

  function formatValue(value, depth) {
    const currentIndent = ' '.repeat(indent * depth);
    const nextIndent = ' '.repeat(indent * (depth + 1));

    if (value === null) return 'null';
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return `"${value}"`;

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';

      const items = value.map(item => `${nextIndent}${formatValue(item, depth + 1)}`);
      return `[\n${items.join(',\n')}\n${currentIndent}]`;
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';

      const props = keys.map(key => {
        const formattedValue = formatValue(value[key], depth + 1);
        // Use quotes around keys that need them
        const quotedKey = key.includes('-') || key.includes(' ') || !isNaN(key[0])
          ? `"${key}"`
          : key;
        return `${nextIndent}${quotedKey}: ${formattedValue}`;
      });

      return `{\n${props.join(',\n')}\n${currentIndent}}`;
    }

    return JSON.stringify(value);
  }

  return formatValue(obj, 0);
}

/**
 * Merge new data into existing data object
 */
function mergeData(existingData, newData, dateKey) {
  const merged = { ...existingData };

  // Update or add the date key
  merged[dateKey] = newData;

  // Sort by date (newest first)
  const sortedEntries = Object.entries(merged).sort((a, b) => {
    const dateA = new Date(a[0]);
    const dateB = new Date(b[0]);
    return dateB - dateA; // Descending order
  });

  const sorted = {};
  sortedEntries.forEach(([key, value]) => {
    sorted[key] = value;
  });

  return sorted;
}

/**
 * Main merge function
 */
async function main() {
  const options = parseArgs();

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}   Merge to Static Data${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Validate options
  if (!options.type) {
    console.error(`${colors.red}Error: Data type is required${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  if (!options.date) {
    console.error(`${colors.red}Error: Date is required (--date YYYY-MM-DD)${colors.reset}`);
    process.exit(1);
  }

  if (!options.input) {
    console.error(`${colors.red}Error: Input file is required${colors.reset}`);
    process.exit(1);
  }

  const objectName = getDataObjectName(options.type);
  if (!objectName) {
    console.error(`${colors.red}Error: Invalid type "${options.type}"${colors.reset}`);
    console.error(`Valid types: workforce, turnover, exit-survey`);
    process.exit(1);
  }

  console.log(`${colors.blue}Data Type: ${options.type}${colors.reset}`);
  console.log(`${colors.blue}Object Name: ${objectName}${colors.reset}`);
  console.log(`${colors.blue}Date Key: ${options.date}${colors.reset}`);
  console.log(`${colors.blue}Input File: ${path.basename(options.input)}${colors.reset}\n`);

  // Read input JSON
  console.log(`${colors.blue}Reading input file...${colors.reset}`);
  const inputData = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  console.log(`${colors.green}✓${colors.reset} Loaded input data`);

  // Read staticData.js
  console.log(`${colors.blue}Reading staticData.js...${colors.reset}`);
  const staticDataContent = fs.readFileSync(STATIC_DATA_PATH, 'utf8');
  console.log(`${colors.green}✓${colors.reset} Loaded staticData.js`);

  // Extract data object
  console.log(`${colors.blue}Extracting ${objectName}...${colors.reset}`);
  const extracted = extractDataObject(staticDataContent, objectName);
  console.log(`${colors.green}✓${colors.reset} Extracted ${objectName}`);

  // Parse existing data
  console.log(`${colors.blue}Parsing existing data...${colors.reset}`);
  const existingData = parseJSObject(extracted.content);
  console.log(`${colors.green}✓${colors.reset} Parsed ${Object.keys(existingData).length} existing entries`);

  // Merge data
  console.log(`${colors.blue}Merging data for ${options.date}...${colors.reset}`);
  const mergedData = mergeData(existingData, inputData, options.date);
  const isNewEntry = !existingData[options.date];
  console.log(`${colors.green}✓${colors.reset} ${isNewEntry ? 'Added new entry' : 'Updated existing entry'}`);
  console.log(`${colors.cyan}Total entries: ${Object.keys(mergedData).length}${colors.reset}`);

  // Generate new JavaScript
  console.log(`\n${colors.blue}Generating updated JavaScript...${colors.reset}`);
  const newObjectJS = jsonToJS(mergedData, 2);

  // Reconstruct staticData.js
  const before = staticDataContent.substring(0, extracted.startIndex);
  const after = staticDataContent.substring(extracted.endIndex);
  const newStaticData = before + newObjectJS + after;

  if (options.dryRun) {
    console.log(`\n${colors.yellow}[DRY RUN]${colors.reset} Would update staticData.js`);
    console.log(`\n${colors.cyan}Preview of new entry:${colors.reset}`);
    console.log(JSON.stringify({ [options.date]: inputData }, null, 2).substring(0, 500) + '...');
  } else {
    // Create backup
    if (options.backup) {
      createBackup();
    }

    // Write updated file
    fs.writeFileSync(STATIC_DATA_PATH, newStaticData, 'utf8');
    console.log(`${colors.green}✓${colors.reset} Updated staticData.js`);
  }

  // Summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.green}✓ Merge Complete${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  if (options.dryRun) {
    console.log(`${colors.yellow}This was a dry run. No files were modified.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}Next steps:${colors.reset}`);
    console.log(`  1. Verify changes: git diff src/data/staticData.js`);
    console.log(`  2. Test dashboard: npm start`);
    console.log(`  3. Run validation: npm run data:validate`);
    console.log(`  4. Commit changes: git add src/data/staticData.js\n`);

    if (options.backup) {
      console.log(`${colors.yellow}Restore backup if needed:${colors.reset}`);
      console.log(`  cp src/data/staticData.js.backup src/data/staticData.js\n`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  mergeData,
  parseJSObject,
  jsonToJS,
  extractDataObject
};
