/**
 * Fiscal Calendar Utilities
 *
 * Functions for:
 * - Converting dates to fiscal year/quarter
 * - Calculating fiscal periods
 * - Fiscal year date ranges
 *
 * Creighton University Fiscal Year: July 1 - June 30
 * - FY25 Q1: July 1, 2024 - September 30, 2024
 * - FY25 Q2: October 1, 2024 - December 31, 2024
 * - FY25 Q3: January 1, 2025 - March 31, 2025
 * - FY25 Q4: April 1, 2025 - June 30, 2025
 */

/**
 * Get fiscal year from a calendar date
 * Fiscal year starts July 1
 *
 * @param {Date|string} date - JavaScript Date or ISO date string
 * @returns {number} Fiscal year (e.g., 2025 for FY25)
 *
 * @example
 * getFiscalYear(new Date('2024-07-01')) // Returns: 2025 (FY25 starts)
 * getFiscalYear(new Date('2024-06-30')) // Returns: 2024 (FY24 ends)
 * getFiscalYear(new Date('2024-12-15')) // Returns: 2025 (in FY25 Q2)
 */
function getFiscalYear(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d)) {
    throw new Error('Invalid date provided to getFiscalYear');
  }

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11

  // If July (month 6) or later, it's the next fiscal year
  // Example: July 2024 = FY25
  return month >= 6 ? year + 1 : year;
}

/**
 * Get fiscal quarter from a calendar date
 *
 * @param {Date|string} date - JavaScript Date or ISO date string
 * @returns {number} Fiscal quarter (1-4)
 *
 * @example
 * getFiscalQuarter(new Date('2024-07-15')) // Returns: 1 (Q1: Jul-Sep)
 * getFiscalQuarter(new Date('2024-10-15')) // Returns: 2 (Q2: Oct-Dec)
 * getFiscalQuarter(new Date('2025-01-15')) // Returns: 3 (Q3: Jan-Mar)
 * getFiscalQuarter(new Date('2025-04-15')) // Returns: 4 (Q4: Apr-Jun)
 */
function getFiscalQuarter(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d)) {
    throw new Error('Invalid date provided to getFiscalQuarter');
  }

  const month = d.getMonth(); // 0-11

  // Fiscal quarters:
  // Q1: July (6), August (7), September (8)
  // Q2: October (9), November (10), December (11)
  // Q3: January (0), February (1), March (2)
  // Q4: April (3), May (4), June (5)

  if (month >= 6 && month <= 8) return 1;  // Jul-Sep
  if (month >= 9 && month <= 11) return 2; // Oct-Dec
  if (month >= 0 && month <= 2) return 3;  // Jan-Mar
  return 4; // Apr-Jun
}

/**
 * Get fiscal period key (e.g., "FY25_Q1")
 *
 * @param {Date|string} date - JavaScript Date or ISO date string
 * @returns {string} Fiscal period key
 *
 * @example
 * getFiscalPeriodKey(new Date('2024-08-15')) // Returns: "FY25_Q1"
 * getFiscalPeriodKey(new Date('2024-12-01')) // Returns: "FY25_Q2"
 */
function getFiscalPeriodKey(date) {
  const fy = getFiscalYear(date);
  const quarter = getFiscalQuarter(date);
  const fyShort = fy.toString().slice(-2); // Last 2 digits

  return `FY${fyShort}_Q${quarter}`;
}

/**
 * Get start date of fiscal year
 *
 * @param {number} fiscalYear - Fiscal year (e.g., 2025 for FY25)
 * @returns {Date} Start date (July 1 of prior calendar year)
 *
 * @example
 * getFiscalYearStart(2025) // Returns: Date('2024-07-01')
 */
function getFiscalYearStart(fiscalYear) {
  return new Date(fiscalYear - 1, 6, 1); // July 1 of prior year
}

/**
 * Get end date of fiscal year
 *
 * @param {number} fiscalYear - Fiscal year (e.g., 2025 for FY25)
 * @returns {Date} End date (June 30 of current calendar year)
 *
 * @example
 * getFiscalYearEnd(2025) // Returns: Date('2025-06-30')
 */
function getFiscalYearEnd(fiscalYear) {
  return new Date(fiscalYear, 5, 30); // June 30 of current year
}

/**
 * Get start and end dates for a fiscal quarter
 *
 * @param {number} fiscalYear - Fiscal year (e.g., 2025)
 * @param {number} quarter - Quarter (1-4)
 * @returns {Object} Object with start and end Date objects
 *
 * @example
 * getFiscalQuarterDates(2025, 1)
 * // Returns: { start: Date('2024-07-01'), end: Date('2024-09-30') }
 */
function getFiscalQuarterDates(fiscalYear, quarter) {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4');
  }

  const baseYear = fiscalYear - 1;

  const quarterMap = {
    1: { start: new Date(baseYear, 6, 1), end: new Date(baseYear, 8, 30) },     // Jul-Sep
    2: { start: new Date(baseYear, 9, 1), end: new Date(baseYear, 11, 31) },    // Oct-Dec
    3: { start: new Date(fiscalYear, 0, 1), end: new Date(fiscalYear, 2, 31) }, // Jan-Mar
    4: { start: new Date(fiscalYear, 3, 1), end: new Date(fiscalYear, 5, 30) }  // Apr-Jun
  };

  return quarterMap[quarter];
}

/**
 * Parse fiscal period key to fiscal year and quarter
 *
 * @param {string} periodKey - Period key (e.g., "FY25_Q1")
 * @returns {Object} Object with fiscalYear and quarter
 *
 * @example
 * parseFiscalPeriodKey("FY25_Q1")
 * // Returns: { fiscalYear: 2025, quarter: 1 }
 */
function parseFiscalPeriodKey(periodKey) {
  const match = periodKey.match(/^FY(\d{2})_Q(\d)$/);

  if (!match) {
    throw new Error(`Invalid fiscal period key: ${periodKey}`);
  }

  const fyShort = parseInt(match[1], 10);
  const quarter = parseInt(match[2], 10);

  // Convert 2-digit year to 4-digit (assumes 2000s)
  const fiscalYear = 2000 + fyShort;

  return { fiscalYear, quarter };
}

/**
 * Get quarter dates from period key
 *
 * @param {string} periodKey - Period key (e.g., "FY25_Q1")
 * @returns {Object} Object with start and end Date objects
 *
 * @example
 * getQuarterDatesFromKey("FY25_Q1")
 * // Returns: { start: Date('2024-07-01'), end: Date('2024-09-30') }
 */
function getQuarterDatesFromKey(periodKey) {
  const { fiscalYear, quarter } = parseFiscalPeriodKey(periodKey);
  return getFiscalQuarterDates(fiscalYear, quarter);
}

/**
 * Check if date falls within fiscal year
 *
 * @param {Date|string} date - Date to check
 * @param {number} fiscalYear - Fiscal year
 * @returns {boolean} True if date is in fiscal year
 */
function isDateInFiscalYear(date, fiscalYear) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = getFiscalYearStart(fiscalYear);
  const end = getFiscalYearEnd(fiscalYear);

  return d >= start && d <= end;
}

/**
 * Check if date falls within fiscal quarter
 *
 * @param {Date|string} date - Date to check
 * @param {number} fiscalYear - Fiscal year
 * @param {number} quarter - Quarter (1-4)
 * @returns {boolean} True if date is in quarter
 */
function isDateInQuarter(date, fiscalYear, quarter) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { start, end } = getFiscalQuarterDates(fiscalYear, quarter);

  return d >= start && d <= end;
}

/**
 * Format fiscal period for display
 *
 * @param {string} periodKey - Period key (e.g., "FY25_Q1")
 * @returns {string} Display name (e.g., "Q1 FY25 (Jul-Sep 2024)")
 */
function formatFiscalPeriod(periodKey) {
  const { fiscalYear, quarter } = parseFiscalPeriodKey(periodKey);
  const { start, end } = getFiscalQuarterDates(fiscalYear, quarter);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = monthNames[start.getMonth()];
  const endMonth = monthNames[end.getMonth()];
  const year = start.getFullYear();

  return `Q${quarter} FY${fiscalYear.toString().slice(-2)} (${startMonth}-${endMonth} ${year})`;
}

module.exports = {
  getFiscalYear,
  getFiscalQuarter,
  getFiscalPeriodKey,
  getFiscalYearStart,
  getFiscalYearEnd,
  getFiscalQuarterDates,
  parseFiscalPeriodKey,
  getQuarterDatesFromKey,
  isDateInFiscalYear,
  isDateInQuarter,
  formatFiscalPeriod
};
