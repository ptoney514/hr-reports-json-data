/**
 * useRecruitingData Hook
 *
 * Fetches recruiting metrics from the Neon PostgreSQL database via API.
 * Provides all data needed by the RecruitingQ1FY26Dashboard.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useRecruitingData('FY2026', 1);
 *
 * Data Structure:
 *   - summary: Total hires, faculty/staff split, campus breakdown
 *   - hireRates: Hire rates by source/channel
 *   - pipelineStaff: myJobs/ORC pipeline metrics
 *   - pipelineFaculty: Interfolio pipeline metrics
 *   - newHires: Individual hire records
 *   - bySchool: Hires aggregated by school
 *   - applicationSources: LinkedIn, Indeed, etc.
 *   - topJobs: Top 10 jobs by applications
 *   - requisitionAging: Age distribution of open reqs
 *   - demographics: Gender, ethnicity, age band distributions
 *   - hiringTrends: Historical quarterly trends
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getRecruitingSummary,
  getHireRates,
  getPipelineStaff,
  getPipelineFaculty,
  getNewHires,
  getHiresBySchool,
  getApplicationSources,
  getTopJobs,
  getRequisitionAging,
  getNewHireDemographics,
  getHiringTrends,
  isAPIAvailable
} from '../services/apiService';

/**
 * Transform database demographics to dashboard format
 */
function transformDemographics(demographicsData) {
  if (!demographicsData || demographicsData.length === 0) {
    return {
      gender: { female: 0, male: 0, femalePercentage: 0, malePercentage: 0 },
      ethnicity: [],
      ageDistribution: []
    };
  }

  const gender = { female: 0, male: 0, femalePercentage: 0, malePercentage: 0 };
  const ethnicity = [];
  const ageDistribution = [];

  demographicsData.forEach(row => {
    if (row.demo_type === 'Gender') {
      if (row.demo_value === 'Female') {
        gender.female = row.count;
        gender.femalePercentage = row.percentage;
      } else if (row.demo_value === 'Male') {
        gender.male = row.count;
        gender.malePercentage = row.percentage;
      }
    } else if (row.demo_type === 'Ethnicity') {
      ethnicity.push({
        category: row.demo_value,
        count: row.count,
        percentage: row.percentage,
        color: row.display_color || '#9CA3AF'
      });
    } else if (row.demo_type === 'Age Band') {
      ageDistribution.push({
        band: row.demo_value,
        count: row.count,
        percentage: row.percentage,
        color: row.display_color || '#9CA3AF'
      });
    }
  });

  return { gender, ethnicity, ageDistribution };
}

/**
 * Transform database hires to dashboard format
 */
function transformNewHires(hiresData) {
  if (!hiresData || hiresData.length === 0) return [];

  return hiresData.map(hire => ({
    name: hire.employee_hash, // Using hash instead of real name
    position: hire.position_title,
    department: hire.department,
    school: hire.school,
    type: hire.employee_type,
    hireDate: hire.hire_date,
    assignmentCode: hire.assignment_code,
    assignmentType: hire.assignment_code?.startsWith('F') ? 'FT' : 'PT',
    inInterfolio: hire.in_interfolio,
    inORC: hire.in_orc_ats
  }));
}

/**
 * Transform database application sources to dashboard format
 */
function transformApplicationSources(sourcesData) {
  if (!sourcesData || sourcesData.length === 0) return [];

  // Color mapping
  const sourceColors = {
    'LinkedIn': '#0A66C2',
    'Creighton Careers': '#0054A6',
    'External Career Site': '#10B981',
    'jobright': '#F59E0B',
    'Internal Career Site': '#8B5CF6',
    'Other': '#9CA3AF'
  };

  return sourcesData.map(source => ({
    source: source.source_name,
    applications: source.application_count,
    percentage: source.percentage,
    color: sourceColors[source.source_name] || '#9CA3AF'
  }));
}

/**
 * Transform database requisition aging to dashboard format
 */
function transformRequisitionAging(agingData) {
  if (!agingData || agingData.length === 0) return [];

  return agingData.map(age => ({
    range: age.age_range,
    count: age.requisition_count,
    percentage: age.percentage,
    color: age.display_color || '#9CA3AF'
  }));
}

/**
 * Hook to fetch recruiting data from the API
 *
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2026')
 * @param {number} quarter - Quarter (1-4)
 * @returns {Object} { data, isLoading, error, refetch, apiAvailable }
 */
export function useRecruitingData(fiscalYear = 'FY2026', quarter = 1) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if API is available
      const available = await isAPIAvailable();
      setApiAvailable(available);

      if (!available) {
        setError('API is not available. Data may be stale.');
        setIsLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [
        summaryResult,
        hireRatesResult,
        pipelineStaffResult,
        pipelineFacultyResult,
        newHiresResult,
        bySchoolResult,
        appSourcesResult,
        topJobsResult,
        requisitionAgingResult,
        demographicsResult,
        hiringTrendsResult
      ] = await Promise.allSettled([
        getRecruitingSummary(fiscalYear, quarter),
        getHireRates(fiscalYear, quarter),
        getPipelineStaff(fiscalYear, quarter),
        getPipelineFaculty(fiscalYear, quarter),
        getNewHires(fiscalYear, quarter),
        getHiresBySchool(fiscalYear, quarter),
        getApplicationSources(fiscalYear, quarter),
        getTopJobs(fiscalYear, quarter),
        getRequisitionAging(fiscalYear, quarter),
        getNewHireDemographics(fiscalYear, quarter),
        getHiringTrends()
      ]);

      // Extract values, using nulls for failed requests
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const hireRates = hireRatesResult.status === 'fulfilled' ? hireRatesResult.value : [];
      const pipelineStaff = pipelineStaffResult.status === 'fulfilled' ? pipelineStaffResult.value : null;
      const pipelineFaculty = pipelineFacultyResult.status === 'fulfilled' ? pipelineFacultyResult.value : null;
      const newHires = newHiresResult.status === 'fulfilled' ? newHiresResult.value : [];
      const bySchool = bySchoolResult.status === 'fulfilled' ? bySchoolResult.value : [];
      const appSources = appSourcesResult.status === 'fulfilled' ? appSourcesResult.value : [];
      const topJobs = topJobsResult.status === 'fulfilled' ? topJobsResult.value : [];
      const requisitionAging = requisitionAgingResult.status === 'fulfilled' ? requisitionAgingResult.value : [];
      const demographics = demographicsResult.status === 'fulfilled' ? demographicsResult.value : [];
      const hiringTrends = hiringTrendsResult.status === 'fulfilled' ? hiringTrendsResult.value : [];

      // Build the transformed data object
      const transformedData = {
        // Report metadata
        fiscalYear,
        quarter,
        fiscalPeriod: `Q${quarter} ${fiscalYear.replace('FY', 'FY')}`,
        dataAsOf: summary?.loaded_at || new Date().toISOString(),

        // Summary metrics
        summary: summary ? {
          total: { count: summary.total_hires, oma: summary.omaha_hires, phx: summary.phoenix_hires },
          faculty: { count: summary.faculty_hires, oma: summary.faculty_hires, phx: 0 },
          staff: { count: summary.staff_hires, oma: summary.omaha_hires - (summary.faculty_hires || 0), phx: summary.phoenix_hires }
        } : null,

        // Pipeline data
        pipelineStaff: pipelineStaff ? {
          requisitions: {
            open: pipelineStaff.open_requisitions,
            perRecruiter: pipelineStaff.reqs_per_recruiter,
            avgDaysOpen: pipelineStaff.avg_days_open,
            avgTimeToFill: pipelineStaff.avg_time_to_fill
          },
          applications: {
            active: pipelineStaff.active_applications,
            new: pipelineStaff.new_applications,
            perRequisition: pipelineStaff.apps_per_requisition,
            internalPercentage: pipelineStaff.internal_app_percentage,
            referrals: pipelineStaff.referrals
          },
          hires: {
            total: pipelineStaff.total_hires,
            internal: pipelineStaff.internal_hires,
            internalRate: pipelineStaff.internal_hire_rate,
            avgDaysToHire: pipelineStaff.avg_days_to_hire,
            hrProcessing: pipelineStaff.hr_processing_time
          },
          offerAcceptance: pipelineStaff.offer_acceptance_rate
        } : null,

        pipelineFaculty: pipelineFaculty ? {
          activeSearches: pipelineFaculty.active_searches,
          completedSearches: pipelineFaculty.completed_searches,
          summary: {
            total: pipelineFaculty.total_hires,
            tenureTrack: pipelineFaculty.tenure_track_hires,
            nonTenure: pipelineFaculty.non_tenure_hires,
            instructor: pipelineFaculty.instructor_hires,
            specialFaculty: pipelineFaculty.special_faculty_hires
          }
        } : null,

        // Hire rates
        hireRates: hireRates || [],

        // School breakdown
        bySchool: bySchool.map(school => ({
          school: school.school_name,
          faculty: school.faculty_hires,
          staff: school.staff_hires,
          total: school.total_hires
        })),

        // Application sources
        applicationSources: transformApplicationSources(appSources),

        // Top jobs
        topJobs: topJobs.map(job => ({
          title: job.job_title,
          applications: job.application_count
        })),

        // Requisition aging
        requisitionAging: transformRequisitionAging(requisitionAging),

        // Demographics
        demographics: transformDemographics(demographics),

        // New hires detail
        newHires: transformNewHires(newHires),
        oracleHiresSummary: {
          total: newHires.length,
          faculty: newHires.filter(h => h.employee_type === 'FACULTY').length,
          staff: newHires.filter(h => h.employee_type === 'STAFF').length,
          inInterfolio: newHires.filter(h => h.in_interfolio).length,
          inORC: newHires.filter(h => h.in_orc_ats).length,
          notInEitherSystem: newHires.filter(h => !h.in_interfolio && !h.in_orc_ats).length
        },

        // Historical trends
        hiringTrends: hiringTrends.map(trend => ({
          quarter: trend.quarter,
          faculty: trend.faculty_hires,
          staff: trend.staff_hires,
          total: trend.total_hires
        }))
      };

      setData(transformedData);
    } catch (err) {
      console.error('Failed to fetch recruiting data:', err);
      setError(err.message || 'Failed to fetch recruiting data');
    } finally {
      setIsLoading(false);
    }
  }, [fiscalYear, quarter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    apiAvailable
  };
}

export default useRecruitingData;
