#!/usr/bin/env node

/**
 * Recruiting Positions ETL — CSV to JSON
 *
 * Reads staff (ORC) and faculty (Interfolio) CSV exports,
 * computes quarterly position activity metrics, and outputs JSON.
 *
 * Staff CSV:  source-metrics/recruiting/raw/orc-requisitions-details.csv
 * Faculty CSV: source-metrics/recruiting/raw/faculty_positions_interfolio.csv
 *
 * Usage:
 *   node scripts/etl/recruiting-positions-to-json.js
 *   node scripts/etl/recruiting-positions-to-json.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { getFiscalQuarterDates, getFiscalYear, getFiscalQuarter } = require('../utils/fiscal-calendar');
const { colors, printBanner, printComplete, success, info, warning } = require('../utils/formatting');

// --- Config ---
const STAFF_CSV = path.join(__dirname, '../../source-metrics/recruiting/raw/orc-requisitions-details.csv');
const FACULTY_CSV = path.join(__dirname, '../../source-metrics/recruiting/raw/faculty_positions_interfolio.csv');
const OUTPUT_JSON = path.join(__dirname, '../../source-metrics/recruiting/cleaned/recruiting_positions_activity.json');

const EXCLUDED_STATES = ['Canceled', 'Deleted'];

// Quarters to compute (add new quarters here)
const QUARTERS = [
  { fy: 2026, q: 1, key: '2025-09-30' },
  { fy: 2026, q: 2, key: '2025-12-31' },
];

const isDryRun = process.argv.includes('--dry-run');

// --- Helpers ---

/** Parse date from staff CSV: "YYYY-MM-DD HH:MM:SS" → Date (date portion only) */
function parseStaffDate(val) {
  if (!val || !val.trim()) return null;
  const datePart = val.trim().split(' ')[0]; // "YYYY-MM-DD"
  const d = new Date(datePart + 'T00:00:00');
  return isNaN(d) ? null : d;
}

/** Parse date from faculty CSV: "M/D/YYYY" → Date */
function parseFacultyDate(val) {
  if (!val || !val.trim()) return null;
  const parts = val.trim().split('/');
  if (parts.length !== 3) return null;
  const [m, d, y] = parts;
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return isNaN(date) ? null : date;
}

/** Format quarter label */
function quarterLabel(fy, q) {
  return `Q${q} FY${fy.toString().slice(-2)}`;
}

/** Format fiscal period string */
function fiscalPeriodLabel(fy, q) {
  const { start, end } = getFiscalQuarterDates(fy, q);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[start.getMonth()]} ${start.getFullYear()} - ${months[end.getMonth()]} ${end.getFullYear()}`;
}

/** Format reporting date */
function reportingDate(key) {
  const d = new Date(key + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
}

// --- Main ---
function main() {
  printBanner('Recruiting Positions ETL — CSV to JSON');

  if (isDryRun) {
    warning('[DRY RUN] No files will be written.\n');
  }

  // --- Read staff CSV ---
  info('Reading staff CSV...');
  const staffRaw = fs.readFileSync(STAFF_CSV, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
  const staffRows = parse(staffRaw, { columns: true, skip_empty_lines: true });
  success(`  ${staffRows.length} staff rows loaded`);

  // Filter out excluded states
  const staffFiltered = staffRows.filter(r => !EXCLUDED_STATES.includes(r['Current State']));
  info(`  ${staffFiltered.length} after excluding ${EXCLUDED_STATES.join(', ')}`);

  // --- Read faculty CSV ---
  info('Reading faculty CSV...');
  const facultyRaw = fs.readFileSync(FACULTY_CSV, 'utf-8').replace(/^\uFEFF/, '');
  const facultyRows = parse(facultyRaw, { columns: true, skip_empty_lines: true });
  success(`  ${facultyRows.length} faculty rows loaded\n`);

  // --- Compute per-quarter metrics ---
  const results = {};

  for (const { fy, q, key } of QUARTERS) {
    const { start, end } = getFiscalQuarterDates(fy, q);
    const label = quarterLabel(fy, q);

    // Staff: Opened (Creation Date in quarter)
    const staffOpened = staffFiltered.filter(r => {
      const d = parseStaffDate(r['Creation Date']);
      return d && d >= start && d <= end;
    });

    // Staff: Filled (Filled Date in quarter)
    const staffFilled = staffFiltered.filter(r => {
      const d = parseStaffDate(r['Filled Date']);
      return d && d >= start && d <= end;
    });

    // Staff: Still Open (created on/before quarter end AND not filled on/before quarter end)
    const staffStillOpen = staffFiltered.filter(r => {
      const created = parseStaffDate(r['Creation Date']);
      if (!created || created > end) return false;
      const filled = parseStaffDate(r['Filled Date']);
      if (filled && filled <= end) return false;
      return true;
    });

    const fillRate = staffOpened.length > 0
      ? parseFloat(((staffFilled.length / staffOpened.length) * 100).toFixed(1))
      : 0;

    // Faculty: Opened (Open date in quarter)
    const facultyOpened = facultyRows.filter(r => {
      const d = parseFacultyDate(r['Open date']);
      return d && d >= start && d <= end;
    });

    results[key] = {
      reportingDate: reportingDate(key),
      quarter: label,
      fiscalPeriod: fiscalPeriodLabel(fy, q),
      staff: {
        opened: staffOpened.length,
        filled: staffFilled.length,
        stillOpen: staffStillOpen.length,
        fillRate
      },
      faculty: {
        opened: facultyOpened.length
      }
    };

    // Print summary
    console.log(`${colors.cyan}--- ${label} (${key}) ---${colors.reset}`);
    console.log(`  Staff Opened:     ${staffOpened.length}`);
    console.log(`  Staff Filled:     ${staffFilled.length}`);
    console.log(`  Staff Still Open: ${staffStillOpen.length}`);
    console.log(`  Staff Fill Rate:  ${fillRate}%`);
    console.log(`  Faculty Opened:   ${facultyOpened.length}`);
    console.log('');
  }

  // --- Output JSON ---
  if (!isDryRun) {
    const outputDir = path.dirname(OUTPUT_JSON);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    success(`JSON written to ${path.relative(process.cwd(), OUTPUT_JSON)}`);
  }

  // --- Print staticData.js snippet ---
  console.log(`\n${colors.yellow}--- staticData.js snippet ---${colors.reset}`);
  console.log('export const QUARTERLY_RECRUITING_DETAILS = {');
  for (const key of Object.keys(results).reverse()) {
    const r = results[key];
    console.log(`  "${key}": {`);
    console.log(`    reportingDate: "${r.reportingDate}",`);
    console.log(`    quarter: "${r.quarter}",`);
    console.log(`    fiscalPeriod: "${r.fiscalPeriod}",`);
    console.log(`    staff: { opened: ${r.staff.opened}, filled: ${r.staff.filled}, stillOpen: ${r.staff.stillOpen}, fillRate: ${r.staff.fillRate} },`);
    console.log(`    faculty: { opened: ${r.faculty.opened} }`);
    console.log(`  },`);
  }
  console.log('};');

  printComplete('Recruiting Positions ETL complete');
}

main();
