/**
 * API: Get Annual Turnover Rates
 *
 * GET /api/turnover-rates
 * GET /api/turnover-rates?year=2025
 *
 * Returns annual voluntary turnover rates.
 * Replaces getAnnualTurnoverRatesByCategory() from staticData.js
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// CUPA-HR benchmark data by year
const BENCHMARKS = {
  2024: {
    allStaff: 16.5,
    professionals: 14.2,
    clerical: 18.8,
    crafts: 12.4
  },
  2025: {
    allStaff: 16.2,
    professionals: 14.0,
    clerical: 18.5,
    crafts: 12.1
  },
  2026: {
    allStaff: 15.9,
    professionals: 13.8,
    clerical: 18.2,
    crafts: 11.9
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year } = req.query;

  try {
    let result;

    if (year) {
      // Get specific year
      result = await sql`
        SELECT * FROM v_turnover_rates
        WHERE fiscal_year = ${parseInt(year)}
      `;
    } else {
      // Get all years
      result = await sql`
        SELECT * FROM v_turnover_rates
        ORDER BY fiscal_year DESC
      `;
    }

    const response = result.map(row => ({
      fiscalYear: row.fiscal_year,
      voluntaryTerminations: Number(row.voluntary_terminations) || 0,
      avgBenefitEligibleHeadcount: Number(row.avg_benefit_eligible_headcount) || 0,
      voluntaryTurnoverRate: Number(row.voluntary_turnover_rate) || 0,
      benchmark: BENCHMARKS[row.fiscal_year] || BENCHMARKS[2025]
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Turnover Rates API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
