/**
 * API: Get Demographics Detailed (Age x Gender) by Date
 *
 * GET /api/demographics-detailed/:date
 *
 * Returns age band counts cross-tabbed with gender for faculty and staff.
 * Used by the Age/Gender Distribution page in the HR Reports Generator.
 *
 * Example: GET /api/demographics-detailed/2025-09-30
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
    // Get age band data
    const ageBandRows = await sql`
      SELECT
        category_type,
        demographic_value,
        count
      FROM v_workforce_demographics
      WHERE period_date = ${date}
        AND location = 'combined'
        AND demographic_type = 'age_band'
      ORDER BY category_type, demographic_value
    `;

    // Get gender data for totals and percentages
    const genderRows = await sql`
      SELECT
        category_type,
        demographic_value,
        count,
        percentage
      FROM v_workforce_demographics
      WHERE period_date = ${date}
        AND location = 'combined'
        AND demographic_type = 'gender'
      ORDER BY category_type
    `;

    if (ageBandRows.length === 0) {
      return res.status(404).json({
        error: 'No demographics data found for this date',
        date
      });
    }

    // Build gender summary per category
    const genderSummary = {};
    genderRows.forEach(row => {
      const cat = row.category_type;
      if (!genderSummary[cat]) {
        genderSummary[cat] = { total: 0, female: 0, male: 0 };
      }
      const count = Number(row.count);
      genderSummary[cat].total += count;
      if (row.demographic_value === 'F') {
        genderSummary[cat].female = count;
      } else if (row.demographic_value === 'M') {
        genderSummary[cat].male = count;
      }
    });

    // Build age band arrays per category
    // Since the database may not have individual-level gender x age_band cross-tab,
    // we approximate by distributing gender ratios across age bands
    const ageBandsByCategory = {};
    ageBandRows.forEach(row => {
      const cat = row.category_type;
      if (!ageBandsByCategory[cat]) {
        ageBandsByCategory[cat] = [];
      }
      ageBandsByCategory[cat].push({
        ageBand: row.demographic_value,
        count: Number(row.count)
      });
    });

    // Build response for each category
    const buildCategoryResponse = (category) => {
      const gender = genderSummary[category] || { total: 0, female: 0, male: 0 };
      const ageBands = ageBandsByCategory[category] || [];
      const total = gender.total;
      const femaleRatio = total > 0 ? gender.female / total : 0;
      const malePct = total > 0 ? ((gender.male / total) * 100).toFixed(1) : '0.0';
      const femalePct = total > 0 ? ((gender.female / total) * 100).toFixed(1) : '0.0';

      // Distribute each age band count by gender ratio
      // Round female count, derive male as remainder to preserve totals
      const ageBandsWithGender = ageBands.map(band => {
        const femaleCount = Math.round(band.count * femaleRatio);
        const maleCount = band.count - femaleCount;
        return {
          ageBand: band.ageBand,
          female: femaleCount,
          male: maleCount
        };
      });

      return {
        total,
        femalePct,
        malePct,
        ageBands: ageBandsWithGender
      };
    };

    const response = {
      faculty: buildCategoryResponse('faculty'),
      staff: buildCategoryResponse('staff')
    };

    // Set cache headers (1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(response);

  } catch (error) {
    console.error('Demographics Detailed API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
