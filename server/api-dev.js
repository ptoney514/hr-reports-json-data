/**
 * Local Development API Server
 *
 * Runs the Neon API endpoints locally for development.
 * Start with: node server/api-dev.js
 *
 * This allows testing the API without needing Vercel CLI.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await sql`
      SELECT current_database() as database, NOW() as server_time
    `;

    const counts = await sql`
      SELECT
        (SELECT COUNT(*) FROM dim_fiscal_periods) as fiscal_periods,
        (SELECT COUNT(*) FROM fact_workforce_snapshots) as workforce_snapshots
    `;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: dbResult[0].database,
        serverTime: dbResult[0].server_time
      },
      data: {
        fiscalPeriods: Number(counts[0].fiscal_periods),
        workforceSnapshots: Number(counts[0].workforce_snapshots)
      }
    });
  } catch (error) {
    console.error('Health Check Error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: { connected: false, error: error.message }
    });
  }
});

// Workforce data endpoint
app.get('/api/workforce/:date', async (req, res) => {
  const { date } = req.params;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  try {
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

    // Transform to match staticData.js format
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

    res.json(response);
  } catch (error) {
    console.error('Workforce API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

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

/**
 * Convert value to number, preserving null for missing data
 * Unlike Number(), this returns null instead of 0 for null/undefined values
 * This ensures api_missing detection works correctly in validation
 */
function toNumberOrNull(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Demographics data endpoint
app.get('/api/demographics/:date', async (req, res) => {
  const { date } = req.params;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  try {
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
      totals: { faculty: 0, staff: 0, combined: 0 },
      gender: {
        faculty: { male: 0, female: 0 },
        staff: { male: 0, female: 0 }
      },
      ethnicity: { faculty: {}, staff: {} },
      ageBands: { faculty: {}, staff: {} }
    };

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

    res.json(demographics);
  } catch (error) {
    console.error('Demographics API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Turnover metrics endpoint (for validation dashboard)
app.get('/api/turnover-metrics/:fiscalYear', async (req, res) => {
  const { fiscalYear } = req.params;

  // Validate fiscal year format (e.g., FY2025)
  if (!fiscalYear || !/^FY\d{4}$/.test(fiscalYear)) {
    return res.status(400).json({
      error: 'Invalid fiscal year format. Use FY2025 format'
    });
  }

  const year = parseInt(fiscalYear.replace('FY', ''));

  try {
    // Fetch all turnover metrics from various tables
    const fyStr = `FY${year}`;
    const [
      summaryRates,
      turnoverRatesTable,
      turnoverBreakdown,
      staffDeviation,
      facultyDeviation,
      lengthOfService,
      retirementsByFY,
      facultyRetirementTrends,
      staffRetirementTrends,
      facultyAgeDistribution,
      staffAgeDistribution,
      facultyRetirementBySchool,
      historicalRates
    ] = await Promise.all([
      sql`SELECT * FROM fact_turnover_summary_rates WHERE fiscal_year = ${fyStr} ORDER BY category`,
      sql`SELECT * FROM fact_turnover_summary_rates ORDER BY fiscal_year, category`,
      sql`SELECT * FROM fact_turnover_breakdown WHERE fiscal_year = ${fyStr}`,
      sql`SELECT * FROM fact_staff_turnover_deviation WHERE fiscal_year = ${fyStr} ORDER BY turnover_rate DESC`,
      sql`SELECT * FROM fact_faculty_turnover_deviation WHERE fiscal_year = ${fyStr} ORDER BY turnover_rate DESC`,
      sql`SELECT * FROM fact_turnover_length_of_service WHERE fiscal_year = ${fyStr}`,
      sql`SELECT * FROM fact_retirements_by_fy ORDER BY fiscal_year`,
      sql`SELECT * FROM fact_retirement_trends WHERE employee_type = 'Faculty' ORDER BY year`,
      sql`SELECT * FROM fact_retirement_trends WHERE employee_type = 'Staff' ORDER BY year`,
      sql`SELECT * FROM fact_retirement_age_distribution WHERE employee_type = 'Faculty'`,
      sql`SELECT * FROM fact_retirement_age_distribution WHERE employee_type = 'Staff'`,
      sql`SELECT * FROM fact_faculty_retirement_by_school`,
      sql`SELECT * FROM fact_historical_turnover_rates ORDER BY fiscal_year`
    ]);

    // Build summary rates object
    const summaryRatesObj = {};
    summaryRates.forEach(row => {
      const key = row.category.toLowerCase().replace(/ /g, '').replace(/-/g, '');
      summaryRatesObj[key === 'total' ? 'total' :
                     key === 'faculty' ? 'faculty' :
                     key === 'staffexempt' ? 'staffExempt' :
                     key === 'staffnonexempt' ? 'staffNonExempt' : key] = {
        rate: Number(row.turnover_rate),
        priorYear: Number(row.prior_year_rate),
        change: Number(row.change),
        trend: row.trend
      };
    });

    // Build turnover rates table
    // Using toNumberOrNull to preserve null for missing data (enables api_missing detection)
    const categories = ['Faculty', 'Staff Exempt', 'Staff Non-Exempt', 'Total'];
    const turnoverRatesTableArr = categories.map(category => {
      const rows = turnoverRatesTable.filter(r => r.category === category);
      const fy23 = rows.find(r => r.fiscal_year === 'FY2023');
      const fy24 = rows.find(r => r.fiscal_year === 'FY2024');
      const fy25 = rows.find(r => r.fiscal_year === 'FY2025');
      return {
        category,
        fy2023: fy23 ? toNumberOrNull(fy23.turnover_rate) : null,
        heAvg2023: fy23 ? toNumberOrNull(fy23.higher_ed_avg) : null,
        fy2024: fy24 ? toNumberOrNull(fy24.turnover_rate) : null,
        heAvg2024: fy24 ? toNumberOrNull(fy24.higher_ed_avg) : null,
        fy2025: fy25 ? toNumberOrNull(fy25.turnover_rate) : null,
        change: fy25 ? toNumberOrNull(fy25.change) : null
      };
    });

    // Build turnover breakdown
    const turnoverBreakdownArr = turnoverBreakdown.map(row => ({
      category: row.category,
      voluntary: Number(row.voluntary),
      involuntary: Number(row.involuntary),
      retirement: Number(row.retirement),
      total: Number(row.total)
    }));

    // Calculate staff average rate
    const staffAvg = staffDeviation.find(r => r.is_average);
    const staffAverageRate = staffAvg ? Number(staffAvg.turnover_rate) : 13.6;

    // Build staff deviation array
    const staffDeviationArr = staffDeviation.map(row => ({
      department: row.department,
      rate: Number(row.turnover_rate),
      isAverage: row.is_average || false
    }));

    // Calculate faculty average rate
    const facultyAvg = facultyDeviation.find(r => r.is_average);
    const facultyAverageRate = facultyAvg ? Number(facultyAvg.turnover_rate) : 6.3;

    // Build faculty deviation array
    const facultyDeviationArr = facultyDeviation.map(row => ({
      school: row.school,
      rate: Number(row.turnover_rate),
      isAverage: row.is_average || false
    }));

    // Build length of service
    const facultyLOS = lengthOfService.filter(r => r.employee_type === 'Faculty').map(row => ({
      name: row.tenure_band,
      percentage: Number(row.percentage),
      count: Number(row.count)
    }));
    const staffLOS = lengthOfService.filter(r => r.employee_type === 'Staff').map(row => ({
      name: row.tenure_band,
      percentage: Number(row.percentage),
      count: Number(row.count)
    }));

    // Build retirements by FY
    const retirementsByFYArr = retirementsByFY.map(row => ({
      fiscalYear: row.fiscal_year.startsWith('FY') ? row.fiscal_year : `FY${row.fiscal_year}`,
      faculty: Number(row.faculty),
      staffNonExempt: Number(row.staff_non_exempt),
      staffExempt: Number(row.staff_exempt),
      total: Number(row.total)
    }));

    // Build faculty retirement data
    const facultyRetirement = {
      trends: facultyRetirementTrends.map(row => ({
        year: Number(row.year),
        avgAge: Number(row.avg_age),
        avgLOS: Number(row.avg_los)
      })),
      ageDistribution: facultyAgeDistribution.map(row => ({
        name: row.category,
        value: Number(row.percentage),
        color: row.color
      })),
      bySchool: facultyRetirementBySchool.map(row => ({
        school: row.school,
        count: Number(row.count)
      }))
    };

    // Build staff retirement data
    const staffRetirement = {
      trends: staffRetirementTrends.map(row => ({
        year: Number(row.year),
        avgAge: Number(row.avg_age),
        avgLOS: Number(row.avg_los)
      })),
      ageDistribution: staffAgeDistribution.map(row => ({
        name: row.category,
        value: Number(row.percentage),
        color: row.color
      }))
    };

    // Build historical rates
    const historicalRatesArr = historicalRates.map(row => ({
      fiscalYear: row.fiscal_year,
      rate: Number(row.total_turnover_rate)
    }));

    // Build response matching staticData.js structure
    const response = {
      summaryRates: summaryRatesObj,
      turnoverRatesTable: turnoverRatesTableArr,
      turnoverBreakdown: turnoverBreakdownArr,
      staffDeviation: staffDeviationArr,
      staffAverageRate,
      facultyDeviation: facultyDeviationArr,
      facultyAverageRate,
      lengthOfService: {
        faculty: facultyLOS,
        staff: staffLOS
      },
      facultyRetirement,
      staffRetirement,
      historicalRates: historicalRatesArr,
      retirementsByFY: retirementsByFYArr
    };

    res.json(response);
  } catch (error) {
    console.error('Turnover Metrics API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ==============================================
// RECRUITING METRICS API ENDPOINTS
// ==============================================

// Recruiting summary endpoint
app.get('/api/recruiting/summary/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_recruiting_summary
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No recruiting summary found',
        fiscalYear,
        quarter
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Recruiting Summary API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Hire rates endpoint
app.get('/api/recruiting/hire-rates/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_hire_rates
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY source_system, channel
    `;

    res.json(result);
  } catch (error) {
    console.error('Hire Rates API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Pipeline staff (myJobs) endpoint
app.get('/api/recruiting/pipeline-staff/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_pipeline_metrics_staff
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No staff pipeline data found',
        fiscalYear,
        quarter
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Pipeline Staff API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Pipeline faculty (Interfolio) endpoint
app.get('/api/recruiting/pipeline-faculty/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_pipeline_metrics_faculty
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No faculty pipeline data found',
        fiscalYear,
        quarter
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Pipeline Faculty API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// New hires endpoint
app.get('/api/recruiting/new-hires/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_new_hires
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY hire_date, employee_hash
    `;

    res.json(result);
  } catch (error) {
    console.error('New Hires API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Hires by school endpoint
app.get('/api/recruiting/by-school/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_hires_by_school
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY total_hires DESC
    `;

    res.json(result);
  } catch (error) {
    console.error('Hires By School API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Application sources endpoint
app.get('/api/recruiting/application-sources/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_application_sources
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY application_count DESC
    `;

    res.json(result);
  } catch (error) {
    console.error('Application Sources API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Top jobs endpoint
app.get('/api/recruiting/top-jobs/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_top_jobs
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY rank
    `;

    res.json(result);
  } catch (error) {
    console.error('Top Jobs API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Requisition aging endpoint
app.get('/api/recruiting/requisition-aging/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_requisition_aging
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY aging_id
    `;

    res.json(result);
  } catch (error) {
    console.error('Requisition Aging API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// New hire demographics endpoint
app.get('/api/recruiting/demographics/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;

  try {
    const result = await sql`
      SELECT * FROM fact_new_hire_demographics
      WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${parseInt(quarter)}
      ORDER BY demo_type, count DESC
    `;

    res.json(result);
  } catch (error) {
    console.error('New Hire Demographics API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Hiring trends endpoint
app.get('/api/recruiting/hiring-trends', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM fact_hiring_trends
      ORDER BY trend_id
    `;

    res.json(result);
  } catch (error) {
    console.error('Hiring Trends API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Combined recruiting metrics endpoint
app.get('/api/recruiting/metrics/:fiscalYear/:quarter', async (req, res) => {
  const { fiscalYear, quarter } = req.params;
  const q = parseInt(quarter);

  try {
    const [
      summary,
      hireRates,
      pipelineStaff,
      pipelineFaculty,
      newHires,
      bySchool,
      appSources,
      topJobs,
      reqAging,
      demographics,
      trends
    ] = await Promise.all([
      sql`SELECT * FROM fact_recruiting_summary WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_hire_rates WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_pipeline_metrics_staff WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_pipeline_metrics_faculty WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_new_hires WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q} ORDER BY hire_date`,
      sql`SELECT * FROM fact_hires_by_school WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q} ORDER BY total_hires DESC`,
      sql`SELECT * FROM fact_application_sources WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q} ORDER BY application_count DESC`,
      sql`SELECT * FROM fact_top_jobs WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q} ORDER BY rank`,
      sql`SELECT * FROM fact_requisition_aging WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_new_hire_demographics WHERE fiscal_year = ${fiscalYear} AND fiscal_quarter = ${q}`,
      sql`SELECT * FROM fact_hiring_trends ORDER BY trend_id`
    ]);

    res.json({
      summary: summary[0] || null,
      hireRates,
      pipelineStaff: pipelineStaff[0] || null,
      pipelineFaculty: pipelineFaculty[0] || null,
      newHires,
      bySchool,
      applicationSources: appSources,
      topJobs,
      requisitionAging: reqAging,
      demographics,
      hiringTrends: trends
    });
  } catch (error) {
    console.error('Recruiting Metrics API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Available quarters endpoint
app.get('/api/available-quarters', async (req, res) => {
  try {
    const result = await sql`
      SELECT
        fp.period_date, fp.fiscal_year, fp.fiscal_quarter,
        fp.quarter_label, fp.quarter_start, fp.quarter_end,
        CASE WHEN COUNT(ws.snapshot_id) > 0 THEN true ELSE false END AS has_data
      FROM dim_fiscal_periods fp
      LEFT JOIN fact_workforce_snapshots ws ON ws.period_date = fp.period_date
      WHERE fp.is_quarter_end = true
        AND fp.period_date <= CURRENT_DATE + INTERVAL '6 months'
      GROUP BY fp.period_date, fp.fiscal_year, fp.fiscal_quarter,
               fp.quarter_label, fp.quarter_start, fp.quarter_end
      ORDER BY fp.period_date DESC
      LIMIT 8
    `;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const quarters = result.map(row => {
      const startDate = new Date(row.quarter_start);
      const endDate = new Date(row.quarter_end);
      const startMonth = monthNames[startDate.getUTCMonth()];
      const endMonth = monthNames[endDate.getUTCMonth()];
      const endYear = endDate.getUTCFullYear();

      const periodDate = new Date(row.period_date);
      const value = periodDate.toISOString().split('T')[0];

      // Transform DB format "FY26_Q1" → "Q1 FY26" for display
      const qLabel = row.quarter_label;
      const displayLabel = qLabel.includes('_')
        ? `${qLabel.split('_')[1]} ${qLabel.split('_')[0]}`
        : qLabel;

      // Transform fiscal_year (number 2026) → "FY26" string
      const fy = typeof row.fiscal_year === 'number'
        ? `FY${String(row.fiscal_year).slice(-2)}`
        : row.fiscal_year;

      return {
        value,
        label: displayLabel,
        period: `${startMonth} - ${endMonth} ${endYear}`,
        fiscalYear: fy,
        hasData: row.has_data
      };
    });

    res.json(quarters);
  } catch (error) {
    console.error('Available Quarters API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check:       http://localhost:${PORT}/api/health`);
  console.log(`Workforce:          http://localhost:${PORT}/api/workforce/2025-06-30`);
  console.log(`Turnover Metrics:   http://localhost:${PORT}/api/turnover-metrics/FY2025`);
  console.log(`Recruiting Summary: http://localhost:${PORT}/api/recruiting/summary/FY2026/1`);
  console.log(`Recruiting Metrics: http://localhost:${PORT}/api/recruiting/metrics/FY2026/1`);
  console.log(`Available Quarters: http://localhost:${PORT}/api/available-quarters`);
});
