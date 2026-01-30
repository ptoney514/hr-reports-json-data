/**
 * API: Health Check
 *
 * GET /api/health
 *
 * Returns API health status and database connection info.
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const dbResult = await sql`
      SELECT
        current_database() as database,
        NOW() as server_time
    `;

    // Get table counts
    const counts = await sql`
      SELECT
        (SELECT COUNT(*) FROM dim_assignment_categories) as categories,
        (SELECT COUNT(*) FROM dim_schools) as schools,
        (SELECT COUNT(*) FROM dim_term_reasons) as term_reasons,
        (SELECT COUNT(*) FROM dim_fiscal_periods) as fiscal_periods,
        (SELECT COUNT(*) FROM fact_workforce_snapshots) as workforce_snapshots,
        (SELECT COUNT(*) FROM fact_terminations) as terminations,
        (SELECT COUNT(*) FROM fact_exit_surveys) as exit_surveys,
        (SELECT COUNT(*) FROM fact_mobility_events) as mobility_events
    `;

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        name: dbResult[0].database,
        serverTime: dbResult[0].server_time
      },
      data: {
        dimensionTables: {
          categories: Number(counts[0].categories),
          schools: Number(counts[0].schools),
          termReasons: Number(counts[0].term_reasons),
          fiscalPeriods: Number(counts[0].fiscal_periods)
        },
        factTables: {
          workforceSnapshots: Number(counts[0].workforce_snapshots),
          terminations: Number(counts[0].terminations),
          exitSurveys: Number(counts[0].exit_surveys),
          mobilityEvents: Number(counts[0].mobility_events)
        }
      }
    };

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Health Check Error:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
}
