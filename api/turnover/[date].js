/**
 * API: Get Turnover Summary by Date
 *
 * GET /api/turnover/:date
 *
 * Returns turnover/termination summary for a specific period date.
 * Replaces getTurnoverData() from staticData.js
 *
 * Example: GET /api/turnover/2025-06-30
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-06-30)'
    });
  }

  try {
    // Get turnover summary from view
    const summaryResult = await sql`
      SELECT * FROM v_turnover_summary
      WHERE period_date = ${date}
    `;

    if (summaryResult.length === 0) {
      return res.status(404).json({
        error: 'No turnover data found for this date',
        date
      });
    }

    const summary = summaryResult[0];

    // Get top exit reasons
    const reasonsResult = await sql`
      SELECT reason_label, reason_category, count, percentage
      FROM v_top_exit_reasons
      WHERE period_date = ${date}
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get school turnover
    const schoolsResult = await sql`
      SELECT school_name, departures, voluntary, involuntary, retirement
      FROM v_school_turnover
      WHERE period_date = ${date}
      ORDER BY departures DESC
      LIMIT 15
    `;

    // Transform to match existing format
    const response = {
      reportingDate: formatDateShort(summary.period_date),
      quarterLabel: summary.quarter_label,
      fiscalYear: summary.fiscal_year,
      fiscalQuarter: summary.fiscal_quarter,

      totalTerminations: Number(summary.total_terminations),
      voluntaryCount: Number(summary.voluntary_count),
      involuntaryCount: Number(summary.involuntary_count),
      retirementCount: Number(summary.retirement_count),

      voluntaryPct: Number(summary.voluntary_pct),
      involuntaryPct: Number(summary.involuntary_pct),
      retirementPct: Number(summary.retirement_pct),

      locations: {
        omaha: Number(summary.omaha_count),
        phoenix: Number(summary.phoenix_count)
      },

      tenure: {
        avgYears: Number(summary.avg_tenure_years),
        under1yr: Number(summary.tenure_under_1yr),
        '1to3yr': Number(summary.tenure_1_3yr),
        '3to5yr': Number(summary.tenure_3_5yr),
        '5to10yr': Number(summary.tenure_5_10yr),
        '10plusYr': Number(summary.tenure_10plus_yr)
      },

      exitReasons: reasonsResult.map(r => ({
        reason: r.reason_label,
        category: r.reason_category,
        count: Number(r.count),
        percentage: Number(r.percentage)
      })),

      schoolTurnover: schoolsResult.map(s => ({
        school: s.school_name,
        departures: Number(s.departures),
        voluntary: Number(s.voluntary),
        involuntary: Number(s.involuntary),
        retirement: Number(s.retirement)
      }))
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Turnover API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}
