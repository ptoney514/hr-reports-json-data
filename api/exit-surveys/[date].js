/**
 * API: Get Exit Survey Metrics by Date
 *
 * GET /api/exit-surveys/:date
 *
 * Returns exit survey metrics for a specific period date.
 * Replaces getExitSurveyData() from staticData.js
 *
 * Example: GET /api/exit-surveys/2025-06-30
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
    const result = await sql`
      SELECT * FROM v_exit_survey_metrics
      WHERE period_date = ${date}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: 'No exit survey data found for this date',
        date
      });
    }

    const data = result[0];

    const response = {
      reportingDate: formatDateShort(data.period_date),
      quarterLabel: data.quarter_label,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,

      totalResponses: Number(data.total_responses),
      totalTerminations: Number(data.total_terminations),
      responseRate: Number(data.response_rate),

      scores: {
        careerDevelopment: Number(data.avg_career_development),
        managementSupport: Number(data.avg_management_support),
        workLifeBalance: Number(data.avg_work_life_balance),
        compensation: Number(data.avg_compensation),
        benefits: Number(data.avg_benefits),
        jobSatisfaction: Number(data.avg_job_satisfaction),
        overall: Number(data.avg_overall)
      },

      wouldRecommend: {
        count: Number(data.would_recommend_count),
        percentage: Number(data.would_recommend_pct)
      },

      conductConcernsCount: Number(data.conduct_concerns_count)
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(response);

  } catch (error) {
    console.error('Exit Surveys API Error:', error);
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
