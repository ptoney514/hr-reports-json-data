/**
 * API: Get School/Org Headcount by Date
 *
 * GET /api/schools/:date
 * GET /api/schools/:date?limit=15
 *
 * Returns school/organization headcount breakdown for a specific period.
 * Replaces getTop15SchoolOrgData() from staticData.js
 *
 * Example: GET /api/schools/2025-03-31?limit=15
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date, limit = 15 } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-03-31)'
    });
  }

  const limitNum = Math.min(Math.max(parseInt(limit) || 15, 1), 50);

  try {
    const result = await sql`
      SELECT
        school_code,
        school_name,
        short_name,
        primary_location,
        total,
        faculty,
        staff,
        hsp,
        headcount_rank
      FROM v_school_org_headcount
      WHERE period_date = ${date}
      ORDER BY total DESC
      LIMIT ${limitNum}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No school data found for this date',
        date
      });
    }

    const response = {
      periodDate: date,
      limit: limitNum,
      schools: result.map(row => ({
        code: row.school_code,
        name: row.school_name,
        shortName: row.short_name,
        location: row.primary_location,
        total: Number(row.total),
        faculty: Number(row.faculty),
        staff: Number(row.staff),
        hsp: Number(row.hsp),
        rank: Number(row.headcount_rank)
      }))
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Schools API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
