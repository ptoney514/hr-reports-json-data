/**
 * API: Get Employee Residence by State
 *
 * GET /api/employee-locations/:date
 *
 * Returns benefit-eligible employee counts by state of residence
 * for a specific quarter-end date.
 *
 * Example: GET /api/employee-locations/2025-09-30
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-09-30)'
    });
  }

  try {
    // Get employee residence data from view
    const result = await sql`
      SELECT
        state_code,
        state_name,
        fips_code,
        employee_count,
        quarter_label,
        fiscal_year,
        fiscal_quarter
      FROM v_employee_state_residence
      WHERE period_date = ${date}
      ORDER BY employee_count DESC
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No employee residence data found for this date',
        date
      });
    }

    // Build states object keyed by state code
    const states = {};
    let totalEmployees = 0;

    for (const row of result) {
      const count = Number(row.employee_count);
      states[row.state_code.trim()] = {
        count,
        name: row.state_name,
        fips: row.fips_code.trim()
      };
      totalEmployees += count;
    }

    const response = {
      periodDate: date,
      quarterLabel: result[0].quarter_label,
      fiscalYear: Number(result[0].fiscal_year),
      fiscalQuarter: Number(result[0].fiscal_quarter),
      totalEmployees,
      stateCount: result.length,
      states
    };

    // Set cache headers (1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(response);

  } catch (error) {
    console.error('Employee Locations API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
