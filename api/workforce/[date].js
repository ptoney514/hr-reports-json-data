/**
 * API: Get Workforce Summary by Date
 *
 * GET /api/workforce/:date
 *
 * Returns workforce headcount summary for a specific period date.
 * Replaces getWorkforceData() from staticData.js
 *
 * Example: GET /api/workforce/2025-03-31
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
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-03-31)'
    });
  }

  try {
    // Get workforce summary from view
    const result = await sql`
      SELECT * FROM v_workforce_summary
      WHERE period_date = ${date}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No workforce data found for this date',
        date
      });
    }

    const data = result[0];

    // Transform to match existing staticData.js format
    const response = {
      reportingDate: formatDateShort(data.period_date),
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,

      totalEmployees: Number(data.total_employees),
      faculty: Number(data.faculty),
      staff: Number(data.staff),
      hsp: Number(data.hsp),
      students: Number(data.students),
      temp: Number(data.temp),

      locations: {
        "Omaha Campus": Number(data.omaha_total),
        "Phoenix Campus": Number(data.phoenix_total)
      },

      locationDetails: {
        omaha: {
          faculty: Number(data.omaha_faculty),
          staff: Number(data.omaha_staff),
          hsp: Number(data.omaha_hsp),
          students: Number(data.omaha_students)
        },
        phoenix: {
          faculty: Number(data.phoenix_faculty),
          staff: Number(data.phoenix_staff),
          hsp: Number(data.phoenix_hsp),
          students: Number(data.phoenix_students)
        }
      }
    };

    // Set cache headers (1 hour for workforce data)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(response);

  } catch (error) {
    console.error('Workforce API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Format date as short string (M/D/YY)
 */
function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}
