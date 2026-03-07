/**
 * School Lookup - Shared school name-to-ID resolution
 *
 * Extracts the duplicated loadSchoolLookup() + findSchoolId() pattern
 * from workforce, terminations, and mobility ETL scripts.
 */

const { sql } = require('../etl/neon-client');
const { colors } = require('./formatting');

/**
 * Load school lookup map from dim_schools table
 *
 * Creates a lookup map keyed by lowercased school code and name.
 * Used for fuzzy matching school names from Excel to database IDs.
 *
 * @returns {Promise<Object>} Lookup map: { 'lowered_code_or_name': school_id }
 */
async function loadSchoolLookup() {
  const schools = await sql`SELECT school_id, code, name FROM dim_schools`;
  const lookup = {};

  schools.forEach(s => {
    lookup[s.code.toLowerCase()] = s.school_id;
    lookup[s.name.toLowerCase()] = s.school_id;
  });

  return lookup;
}

/**
 * Find school ID from a school name using the lookup map
 *
 * Tries exact match first, then partial (substring) match.
 * Logs a warning when no match is found to aid debugging.
 *
 * @param {string} schoolName - Raw school name from source data
 * @param {Object} lookup - Lookup map from loadSchoolLookup()
 * @returns {number|null} School ID or null if not found
 */
function findSchoolId(schoolName, lookup) {
  if (!schoolName) return null;

  const schoolLower = schoolName.toLowerCase();

  // Exact match on code or name
  let schoolId = lookup[schoolLower];
  if (schoolId) return schoolId;

  // Partial match (substring in either direction)
  for (const [key, id] of Object.entries(lookup)) {
    if (key.includes(schoolLower) || schoolLower.includes(key)) {
      return id;
    }
  }

  console.log(`${colors.yellow}Warning: No school match for "${schoolName}"${colors.reset}`);
  return null;
}

module.exports = {
  loadSchoolLookup,
  findSchoolId
};
