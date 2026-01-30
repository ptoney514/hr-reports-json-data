/**
 * API: Get Internal Mobility Summary by Date
 *
 * GET /api/mobility/:date
 *
 * Returns internal mobility metrics for a specific period.
 *
 * Example: GET /api/mobility/2025-03-31
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
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-03-31)'
    });
  }

  try {
    const result = await sql`
      SELECT * FROM v_mobility_summary
      WHERE period_date = ${date}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No mobility data found for this date',
        date
      });
    }

    const data = result[0];

    const response = {
      periodDate: date,
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,

      totalEvents: Number(data.total_events),
      promotions: Number(data.promotions),
      transfers: Number(data.transfers),
      demotions: Number(data.demotions),
      reclassifications: Number(data.reclassifications),
      lateralMoves: Number(data.lateral_moves),

      crossSchoolMoves: Number(data.cross_school_moves),
      crossDepartmentMoves: Number(data.cross_department_moves)
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Mobility API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
