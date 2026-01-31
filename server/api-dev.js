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

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Workforce:    http://localhost:${PORT}/api/workforce/2025-06-30`);
});
