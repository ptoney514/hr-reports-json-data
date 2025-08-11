import PocketBase from 'pocketbase';

/**
 * Enhanced PocketBase Data Service with caching and real-time subscriptions
 * Provides comprehensive data operations for HR Reports v2
 */
class PocketBaseDataService {
  constructor() {
    this.pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8091');
    
    // Disable auto-cancellation of duplicate requests
    this.pb.autoCancellation(false);
    
    // Configure request timeout
    this.pb.beforeSend = (url, options) => {
      options.timeout = 10000; // 10 second timeout
      return { url, options };
    };
    
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.subscriptions = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.pb.health.check();
      this.isInitialized = true;
      console.log('🔗 PocketBaseDataService initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize PocketBaseDataService:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Main workforce data fetching with caching
   */
  async getWorkforceData(period, filters = {}) {
    const cacheKey = `workforce_${period}_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Build filter string for PocketBase (moved outside try block)
    let filter = this.buildPeriodFilter(period);
    
    if (filters.location && filters.location !== 'All') {
      filter += ` && location = '${filters.location}'`;
    }
    if (filters.division && filters.division !== 'All') {
      filter += ` && division = '${filters.division}'`;
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Fetch data with pagination
      const records = await this.pb.collection('workforce_data').getList(1, 100, {
        filter,
        sort: '-reporting_period'
      });

      // Transform to component format
      const transformedData = this.transformWorkforceData(records.items);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;
    } catch (error) {
      // Handle autocancellation errors with retry
      if (error.message && error.message.includes('autocancelled')) {
        console.warn('🔄 Request autocancelled, retrying workforce data fetch...');
        // Wait a moment and retry once
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryRecords = await this.pb.collection('workforce_data').getList(1, 100, {
            filter,
            sort: '-reporting_period'
          });
          const retryData = this.transformWorkforceData(retryRecords.items);
          // Cache successful retry
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });
          return retryData;
        } catch (retryError) {
          console.error('❌ PocketBase workforce fetch retry failed:', retryError);
          throw retryError;
        }
      }
      
      console.error('❌ PocketBase workforce fetch error:', error);
      throw error;
    }
  }

  /**
   * Get turnover data with enhanced filtering
   */
  async getTurnoverData(period, filters = {}) {
    const cacheKey = `turnover_${period}_${JSON.stringify(filters)}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Build filter string (moved outside try block)
    const filter = this.buildPeriodFilter(period);

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const records = await this.pb.collection('turnover_data').getList(1, 100, {
        filter,
        sort: '-reporting_period'
      });

      const transformedData = this.transformTurnoverData(records.items);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;
    } catch (error) {
      // Handle autocancellation errors with retry
      if (error.message && error.message.includes('autocancelled')) {
        console.warn('🔄 Request autocancelled, retrying turnover data fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryRecords = await this.pb.collection('turnover_data').getList(1, 100, {
            filter,
            sort: '-reporting_period'
          });
          const retryData = this.transformTurnoverData(retryRecords.items);
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });
          return retryData;
        } catch (retryError) {
          console.error('❌ PocketBase turnover fetch retry failed:', retryError);
          throw retryError;
        }
      }
      
      console.error('❌ PocketBase turnover fetch error:', error);
      throw error;
    }
  }

  /**
   * Get exit survey data
   */
  async getExitSurveyData(period, filters = {}) {
    const cacheKey = `exit_survey_${period}_${JSON.stringify(filters)}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Build filter string (moved outside try block)
    const filter = this.buildPeriodFilter(period);

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const records = await this.pb.collection('exit_survey_data').getList(1, 100, {
        filter,
        sort: '-reporting_period'
      });

      const transformedData = this.transformExitSurveyData(records.items);
      
      // Cache result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;
    } catch (error) {
      // Handle autocancellation errors with retry
      if (error.message && error.message.includes('autocancelled')) {
        console.warn('🔄 Request autocancelled, retrying exit survey data fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryRecords = await this.pb.collection('exit_survey_data').getList(1, 100, {
            filter,
            sort: '-reporting_period'
          });
          const retryData = this.transformExitSurveyData(retryRecords.items);
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });
          return retryData;
        } catch (retryError) {
          console.error('❌ PocketBase exit survey fetch retry failed:', retryError);
          throw retryError;
        }
      }
      
      console.error('❌ PocketBase exit survey fetch error:', error);
      throw error;
    }
  }

  /**
   * Get trend data for charts
   */
  async getWorkforceTrends(periods = 6) {
    const cacheKey = `workforce_trends_${periods}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get the most recent records for trending
      const records = await this.pb.collection('workforce_data').getList(1, periods, {
        sort: '-reporting_period'
      });

      const trendData = records.items.map(item => ({
        period: this.formatPeriodLabel(item.reporting_period),
        totalEmployees: item.total_employees || 0,
        vacancyRate: item.vacancy_rate || 0,
        newHires: item.new_hires || 0,
        terminations: item.terminations || 0,
        netChange: (item.new_hires || 0) - (item.terminations || 0)
      })).reverse(); // Reverse to show chronological order

      // Cache result
      this.cache.set(cacheKey, {
        data: trendData,
        timestamp: Date.now()
      });

      return trendData;
    } catch (error) {
      // Handle autocancellation errors with retry
      if (error.message && error.message.includes('autocancelled')) {
        console.warn('🔄 Request autocancelled, retrying workforce trends fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryRecords = await this.pb.collection('workforce_data').getList(1, periods, {
            sort: '-reporting_period'
          });
          const retryData = retryRecords.items.map(item => ({
            period: this.formatPeriodLabel(item.reporting_period),
            totalEmployees: item.total_employees || 0,
            vacancyRate: item.vacancy_rate || 0,
            newHires: item.new_hires || 0,
            terminations: item.terminations || 0,
            netChange: (item.new_hires || 0) - (item.terminations || 0)
          })).reverse();
          
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });
          return retryData;
        } catch (retryError) {
          console.error('❌ PocketBase workforce trends retry failed:', retryError);
          throw retryError;
        }
      }
      
      console.error('❌ PocketBase trends fetch error:', error);
      throw error;
    }
  }

  /**
   * Get turnover trends
   */
  async getTurnoverTrends(periods = 6) {
    const cacheKey = `turnover_trends_${periods}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const records = await this.pb.collection('turnover_data').getList(1, periods, {
        sort: '-reporting_period'
      });

      const trendData = records.items.map(item => ({
        period: this.formatPeriodLabel(item.reporting_period),
        totalTurnoverRate: item.total_turnover_rate || 0,
        facultyTurnoverRate: item.faculty_turnover_rate || 0,
        staffTurnoverRate: item.staff_exempt_turnover_rate || 0,
        totalSeparations: item.total_separations || 0
      })).reverse();

      // Cache result
      this.cache.set(cacheKey, {
        data: trendData,
        timestamp: Date.now()
      });

      return trendData;
    } catch (error) {
      // Handle autocancellation errors with retry
      if (error.message && error.message.includes('autocancelled')) {
        console.warn('🔄 Request autocancelled, retrying turnover trends fetch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const retryRecords = await this.pb.collection('turnover_data').getList(1, periods, {
            sort: '-reporting_period'
          });
          const retryData = retryRecords.items.map(item => ({
            period: this.formatPeriodLabel(item.reporting_period),
            totalTurnoverRate: item.total_turnover_rate || 0,
            facultyTurnoverRate: item.faculty_turnover_rate || 0,
            staffTurnoverRate: item.staff_exempt_turnover_rate || 0,
            totalSeparations: item.total_separations || 0
          })).reverse();
          
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });
          return retryData;
        } catch (retryError) {
          console.error('❌ PocketBase turnover trends retry failed:', retryError);
          throw retryError;
        }
      }
      
      console.error('❌ PocketBase turnover trends fetch error:', error);
      throw error;
    }
  }

  /**
   * Real-time subscriptions for live updates
   */
  subscribeToWorkforce(callback) {
    // DISABLED: Real-time subscriptions causing connection errors
    console.warn('⚠️ Real-time subscriptions are temporarily disabled');
    return () => {}; // Return empty unsubscribe function
    
    /*
    if (this.subscriptions.has('workforce')) {
      this.unsubscribeFromWorkforce();
    }

    const subscription = this.pb.collection('workforce_data').subscribe('*', (e) => {
      console.log('🔄 Real-time workforce update received:', e.action);
      
      // Clear workforce-related cache
      this.clearCacheByPrefix('workforce_');
      
      // Notify callback
      callback({
        action: e.action, // 'create', 'update', 'delete'
        record: e.record
      });
    });

    this.subscriptions.set('workforce', subscription);
    return subscription;
    */
  }

  /**
   * Subscribe to turnover updates
   */
  subscribeToTurnover(callback) {
    // DISABLED: Real-time subscriptions causing connection errors
    console.warn('⚠️ Real-time subscriptions are temporarily disabled');
    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Subscribe to exit survey updates
   */
  subscribeToExitSurveys(callback) {
    // DISABLED: Real-time subscriptions causing connection errors
    console.warn('⚠️ Real-time subscriptions are temporarily disabled');
    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Unsubscribe from workforce updates
   */
  unsubscribeFromWorkforce() {
    // DISABLED: Real-time subscriptions
    return;
  }

  /**
   * Unsubscribe from turnover updates
   */
  unsubscribeFromTurnover() {
    // DISABLED: Real-time subscriptions
    return;
  }

  /**
   * Unsubscribe from exit survey updates
   */
  unsubscribeFromExitSurveys() {
    // DISABLED: Real-time subscriptions
    return;
  }

  /**
   * Unsubscribe from all updates
   */
  unsubscribeAll() {
    // DISABLED: Real-time subscriptions
    return;
  }

  /**
   * Transform PocketBase workforce data to component format
   */
  transformWorkforceData(records) {
    if (!records || records.length === 0) return null;

    const latest = records[0];
    const previous = records[1];

    return {
      current: {
        totalEmployees: latest.total_employees || 0,
        benefitEligibleFaculty: latest.benefit_eligible_faculty || 0,
        benefitEligibleStaff: latest.benefit_eligible_staff || 0,
        nonBenefitEligibleFaculty: latest.non_benefit_eligible_faculty || 0,
        nonBenefitEligibleStaff: latest.non_benefit_eligible_staff || 0,
        totalStudents: latest.total_students || 0,
        vacancyRate: latest.vacancy_rate || 0,
        newHires: latest.new_hires || 0,
        terminations: latest.terminations || 0,
        netChange: (latest.new_hires || 0) - (latest.terminations || 0),
        
        // Add calculated fields for compatibility
        faculty: (latest.benefit_eligible_faculty || 0) + (latest.non_benefit_eligible_faculty || 0),
        staff: (latest.benefit_eligible_staff || 0) + (latest.non_benefit_eligible_staff || 0),
        totalBE: (latest.benefit_eligible_faculty || 0) + (latest.benefit_eligible_staff || 0),
        totalNBE: (latest.non_benefit_eligible_faculty || 0) + (latest.non_benefit_eligible_staff || 0),
        
        // BE-specific fields for WorkforceDashboard
        beFaculty: latest.benefit_eligible_faculty || 0,
        beStaff: latest.benefit_eligible_staff || 0,
        newHiresBE: latest.new_hires_be || 0,
        terminationsBE: latest.terminations_be || 0,
        
        // Location breakdown (set to 0 for now as not in PocketBase data)
        beFacultyOmaha: 0,
        beFacultyPhoenix: 0,
        beStaffOmaha: 0,
        beStaffPhoenix: 0,
        nbeFacultyOmaha: 0,
        nbeFacultyPhoenix: 0,
        nbeStaffOmaha: 0,
        nbeStaffPhoenix: 0,
        hspOmaha: 0,
        hspPhoenix: 0,
        studentsOmaha: 0,
        studentsPhoenix: 0,
        
        // Additional BE fields
        newHiresBEFaculty: 0,
        newHiresBEStaff: 0,
        terminationsBEFaculty: 0,
        terminationsBEStaff: 0
      },
      
      previous: previous ? {
        totalEmployees: previous.total_employees || 0,
        vacancyRate: previous.vacancy_rate || 0,
        newHires: previous.new_hires || 0,
        terminations: previous.terminations || 0,
        totalBE: (previous.benefit_eligible_faculty || 0) + (previous.benefit_eligible_staff || 0),
        beFaculty: previous.benefit_eligible_faculty || 0,
        beStaff: previous.benefit_eligible_staff || 0,
        newHiresBE: previous.new_hires_be || 0,
        terminationsBE: previous.terminations_be || 0
      } : null,
      
      trends: {
        employeeChange: this.calculateChange(latest.total_employees, previous?.total_employees),
        vacancyChange: this.calculateChange(latest.vacancy_rate, previous?.vacancy_rate),
        hiresChange: this.calculateChange(latest.new_hires, previous?.new_hires)
      },
      
      locationBreakdown: latest.location_breakdown || {},
      demographics: latest.demographics || {},
      additionalMetrics: latest.additional_metrics || {},
      
      period: this.formatPeriodLabel(latest.reporting_period),
      lastUpdated: latest.updated
    };
  }

  /**
   * Transform turnover data to component format
   */
  transformTurnoverData(records) {
    if (!records || records.length === 0) return null;

    const latest = records[0];
    
    return {
      current: {
        totalTurnoverRate: latest.total_turnover_rate || 0,
        facultyTurnoverRate: latest.faculty_turnover_rate || 0,
        staffExemptTurnoverRate: latest.staff_exempt_turnover_rate || 0,
        staffNonExemptTurnoverRate: latest.staff_non_exempt_turnover_rate || 0,
        voluntaryTurnoverRate: latest.voluntary_turnover_rate || 0,
        involuntaryTurnoverRate: latest.involuntary_turnover_rate || 0,
        totalSeparations: latest.total_separations || 0
      },
      
      exitReasons: latest.exit_reasons || {},
      exitSurveyScores: latest.exit_survey_scores || {},
      locations: latest.locations || {},
      benchmarks: latest.benchmarks || {},
      historicalAnalysis: latest.historical_analysis || [],
      additionalMetrics: latest.additional_metrics || {},
      
      period: this.formatPeriodLabel(latest.reporting_period),
      lastUpdated: latest.updated
    };
  }

  /**
   * Transform exit survey data to component format
   */
  transformExitSurveyData(records) {
    if (!records || records.length === 0) return null;

    const latest = records[0];
    
    return {
      responseRate: latest.response_rate || 0,
      totalResponses: latest.total_responses || 0,
      collectionPeriod: latest.collection_period || '',
      
      satisfactionScores: {
        overallExperience: latest.overall_experience || {},
        careerDevelopment: latest.career_development || {},
        leadership: latest.leadership || {},
        compensation: latest.compensation || {},
        workEnvironment: latest.work_environment || {}
      },
      
      qualitativeData: {
        keyThemes: latest.key_themes || [],
        positiveFeedback: latest.positive_feedback || [],
        areasOfConcern: latest.areas_of_concern || []
      },
      
      period: this.formatPeriodLabel(latest.reporting_period),
      lastUpdated: latest.updated
    };
  }

  /**
   * Build filter string for period matching
   */
  buildPeriodFilter(period) {
    // Handle different period formats
    if (typeof period === 'string') {
      if (period.includes('Q')) {
        // Quarter format: "Q2 2025" - find records in that quarter
        const [q, year] = period.split(' ');
        const quarter = parseInt(q.substring(1));
        
        // Map quarters to end-of-quarter dates (using slash format to match PocketBase data)
        const quarterMonths = {
          1: '3/31',
          2: '6/30',
          3: '9/30',
          4: '12/31'
        };
        
        const endMonth = quarterMonths[quarter] || '6/30';
        // Use contains operator (~) to match the period
        return `reporting_period ~ '${endMonth}/${year}'`;
      } else if (period.includes('-')) {
        // Convert date format from YYYY-MM-DD to M/D/YYYY
        const [year, month, day] = period.split('-');
        const convertedPeriod = `${parseInt(month)}/${parseInt(day)}/${year}`;
        return `reporting_period = '${convertedPeriod}'`;
      } else {
        // Direct period match (already in correct format)
        return `reporting_period = '${period}'`;
      }
    }
    
    return `reporting_period != ''`; // Match all if period not specified
  }

  /**
   * Format period for display
   */
  formatPeriodLabel(periodStr) {
    if (!periodStr) return '';
    
    // If already formatted (like "Q2 2025"), return as-is
    if (periodStr.includes('Q')) return periodStr;
    
    // Handle both slash and dash formats
    try {
      let month, day, year;
      
      if (periodStr.includes('/')) {
        // Format: "6/30/2025"
        [month, day, year] = periodStr.split('/');
      } else if (periodStr.includes('-')) {
        // Format: "6-30-2025" or "2025-06-30"
        const parts = periodStr.split('-');
        if (parts[0].length === 4) {
          // ISO format: "2025-06-30"
          [year, month, day] = parts;
        } else {
          // US format: "6-30-2025"
          [month, day, year] = parts;
        }
      } else {
        return periodStr; // Unknown format
      }
      
      const monthNum = parseInt(month);
      const quarter = Math.ceil(monthNum / 3);
      return `Q${quarter} ${year}`;
    } catch {
      return periodStr; // Return original if parsing fails
    }
  }

  /**
   * Calculate percentage change
   */
  calculateChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }

  /**
   * Clear cache by prefix
   */
  clearCacheByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      await this.pb.health.check();
      return {
        status: 'healthy',
        initialized: this.isInitialized,
        cacheSize: this.cache.size,
        subscriptions: Array.from(this.subscriptions.keys())
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        initialized: this.isInitialized
      };
    }
  }
}

// Export singleton instance
export const pocketBaseDataService = new PocketBaseDataService();
export default pocketBaseDataService;