/**
 * API: Get Demographics Data by Date
 *
 * GET /api/demographics/:date
 *
 * Returns workforce demographics (gender, ethnicity, age bands) for a specific period date.
 * Data format matches staticData.js demographics structure for validation.
 *
 * Example: GET /api/demographics/2025-06-30
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
      error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-06-30)'
    });
  }

  try {
    // Get all demographics data for the period (combined location)
    const result = await sql`
      SELECT
        category_type,
        demographic_type,
        demographic_value,
        count,
        percentage
      FROM v_workforce_demographics
      WHERE period_date = ${date}
        AND location = 'combined'
      ORDER BY demographic_type, category_type, count DESC
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No demographics data found for this date',
        date
      });
    }

    // Transform to match staticData.js format
    const demographics = {
      totals: {
        faculty: 0,
        staff: 0,
        combined: 0
      },
      gender: {
        faculty: { male: 0, female: 0 },
        staff: { male: 0, female: 0 }
      },
      ethnicity: {
        faculty: {},
        staff: {}
      },
      ageBands: {
        faculty: {},
        staff: {}
      }
    };

    // Process results
    result.forEach(row => {
      const category = row.category_type;
      const type = row.demographic_type;
      const value = row.demographic_value;
      const count = Number(row.count);

      if (type === 'gender') {
        if (value === 'M') {
          demographics.gender[category].male = count;
        } else if (value === 'F') {
          demographics.gender[category].female = count;
        }
        // Include all gender values in totals (M, F, and any non-binary/unknown)
        demographics.totals[category] = (demographics.totals[category] || 0) + count;
      } else if (type === 'ethnicity') {
        demographics.ethnicity[category][value] = count;
      } else if (type === 'age_band') {
        demographics.ageBands[category][value] = count;
      }
    });

    // Calculate combined total from category totals (includes all genders, not just M/F)
    demographics.totals.combined = demographics.totals.faculty + demographics.totals.staff;

    // Set cache headers (1 hour for demographics data)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(demographics);

  } catch (error) {
    console.error('Demographics API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
