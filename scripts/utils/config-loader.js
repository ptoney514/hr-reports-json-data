/**
 * Config Loader Utility
 *
 * Loads and validates ETL configuration files from scripts/config/.
 * Provides cached access to etl-config.json, column-mappings.json,
 * and etl-validation.json.
 *
 * Usage:
 *   const { loadConfig, getColumnMappings, getValidation } = require('./config-loader');
 *   const config = loadConfig();
 *   const mappings = getColumnMappings();
 *   const validation = getValidation();
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');

// Cache loaded configs
let _configCache = null;
let _mappingsCache = null;
let _validationCache = null;

const REQUIRED_CONFIG_SECTIONS = [
  'categories',
  'person_types',
  'locations',
  'termination_reasons',
  'tenure_buckets',
  'mobility_actions',
  'ethnicity_normalization',
  'expected_sheets',
  'deviation_defaults',
  'defaults'
];

const REQUIRED_CATEGORY_KEYS = [
  'benefit_eligible',
  'student',
  'house_staff',
  'temp'
];

/**
 * Load and validate etl-config.json
 * @param {Object} options
 * @param {boolean} options.reload - Force reload from disk (bypass cache)
 * @returns {Object} Parsed and validated config
 * @throws {Error} If config file is missing or invalid
 */
function loadConfig({ reload = false } = {}) {
  if (_configCache && !reload) return _configCache;

  const configPath = path.join(CONFIG_DIR, 'etl-config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `ETL config not found: ${configPath}\n` +
      'Run the config extraction step first.'
    );
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to parse etl-config.json: ${err.message}`);
  }

  // Validate required sections
  const missing = REQUIRED_CONFIG_SECTIONS.filter(s => !config[s]);
  if (missing.length > 0) {
    throw new Error(
      `etl-config.json missing required sections: ${missing.join(', ')}`
    );
  }

  // Validate category keys
  const missingCats = REQUIRED_CATEGORY_KEYS.filter(k => !config.categories[k]);
  if (missingCats.length > 0) {
    throw new Error(
      `etl-config.json categories missing required keys: ${missingCats.join(', ')}`
    );
  }

  // Validate HSP/HSR are in house_staff
  const houseStaff = config.categories.house_staff;
  if (!houseStaff.includes('HSP') || !houseStaff.includes('HSR')) {
    throw new Error(
      'etl-config.json: house_staff must include both HSP and HSR'
    );
  }

  // Validate benefit_eligible has expected codes
  const be = config.categories.benefit_eligible;
  if (be.length === 0) {
    throw new Error('etl-config.json: benefit_eligible cannot be empty');
  }

  _configCache = config;
  return config;
}

/**
 * Load column-mappings.json
 * @param {Object} options
 * @param {boolean} options.reload - Force reload from disk
 * @returns {Object} Parsed column mappings
 * @throws {Error} If mappings file is missing or invalid
 */
function getColumnMappings({ reload = false } = {}) {
  if (_mappingsCache && !reload) return _mappingsCache;

  const mappingsPath = path.join(CONFIG_DIR, 'column-mappings.json');

  if (!fs.existsSync(mappingsPath)) {
    throw new Error(
      `Column mappings not found: ${mappingsPath}\n` +
      'Run the config extraction step first.'
    );
  }

  let mappings;
  try {
    mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to parse column-mappings.json: ${err.message}`);
  }

  if (!mappings.fields) {
    throw new Error('column-mappings.json missing required "fields" section');
  }

  // Check for duplicate aliases across fields within the same script context
  const duplicates = detectDuplicateAliases(mappings.fields);
  if (duplicates.length > 0) {
    console.warn(
      'Warning: Duplicate column aliases detected (may be intentional cross-script):\n' +
      duplicates.map(d => `  "${d.alias}" used by: ${d.fields.join(', ')}`).join('\n')
    );
  }

  _mappingsCache = mappings;
  return mappings;
}

/**
 * Detect duplicate aliases across field definitions
 * @param {Object} fields - The fields object from column-mappings.json
 * @returns {Array<{alias: string, fields: string[]}>} Duplicates found
 */
function detectDuplicateAliases(fields) {
  const aliasMap = {};

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (!fieldDef.aliases) continue;

    for (const alias of fieldDef.aliases) {
      if (!aliasMap[alias]) {
        aliasMap[alias] = [];
      }
      aliasMap[alias].push(fieldName);
    }
  }

  return Object.entries(aliasMap)
    .filter(([, fieldNames]) => fieldNames.length > 1)
    .map(([alias, fieldNames]) => ({ alias, fields: fieldNames }));
}

/**
 * Load etl-validation.json
 * @param {Object} options
 * @param {boolean} options.reload - Force reload from disk
 * @returns {Object} Parsed validation thresholds
 * @throws {Error} If validation file is missing or invalid
 */
function getValidation({ reload = false } = {}) {
  if (_validationCache && !reload) return _validationCache;

  const validationPath = path.join(CONFIG_DIR, 'etl-validation.json');

  if (!fs.existsSync(validationPath)) {
    throw new Error(
      `Validation config not found: ${validationPath}\n` +
      'Run the config extraction step first.'
    );
  }

  let validation;
  try {
    validation = JSON.parse(fs.readFileSync(validationPath, 'utf-8'));
  } catch (err) {
    throw new Error(`Failed to parse etl-validation.json: ${err.message}`);
  }

  _validationCache = validation;
  return validation;
}

/**
 * Clear all cached configs (useful for testing)
 */
function clearCache() {
  _configCache = null;
  _mappingsCache = null;
  _validationCache = null;
}

module.exports = {
  loadConfig,
  getColumnMappings,
  getValidation,
  clearCache
};
