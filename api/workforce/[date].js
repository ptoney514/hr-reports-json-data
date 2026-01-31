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

    // Calculate location breakdowns
    const omahaTotal = Number(data.omaha_total);
    const omahaFaculty = Number(data.omaha_faculty);
    const omahaStaff = Number(data.omaha_staff);
    const omahaHsp = Number(data.omaha_hsp);
    const omahaStudents = Number(data.omaha_students);
    // Temp = Total - (Faculty + Staff + HSP + Students)
    const omahaTemp = omahaTotal - (omahaFaculty + omahaStaff + omahaHsp + omahaStudents);

    const phoenixTotal = Number(data.phoenix_total);
    const phoenixFaculty = Number(data.phoenix_faculty);
    const phoenixStaff = Number(data.phoenix_staff);
    const phoenixHsp = Number(data.phoenix_hsp);
    const phoenixStudents = Number(data.phoenix_students);
    // Temp = Total - (Faculty + Staff + HSP + Students)
    const phoenixTemp = phoenixTotal - (phoenixFaculty + phoenixStaff + phoenixHsp + phoenixStudents);

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
        "Omaha Campus": omahaTotal,
        "Phoenix Campus": phoenixTotal
      },

      locationDetails: {
        omaha: {
          faculty: omahaFaculty,
          staff: omahaStaff,
          hsp: omahaHsp,
          students: omahaStudents,
          temp: omahaTemp,
          total: omahaTotal
        },
        phoenix: {
          faculty: phoenixFaculty,
          staff: phoenixStaff,
          hsp: phoenixHsp,
          students: phoenixStudents,
          temp: phoenixTemp,
          total: phoenixTotal
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
 * Uses UTC getters to prevent timezone-related off-by-one errors
 */
function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}
