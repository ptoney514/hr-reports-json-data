/**
 * Workforce Summary Card Metrics Validation Tests
 *
 * Lightweight, targeted tests for the 6 summary card metrics
 * displayed on the Workforce Dashboard.
 *
 * Purpose:
 * - Validate JSON data against expected values from WORKFORCE_METHODOLOGY.md
 * - Ensure data integrity for quarterly updates
 * - Quick pass/fail checks for the stable summary metrics
 *
 * Metrics Tested:
 * 1. Benefit Eligible Staff
 * 2. Benefit Eligible Faculty
 * 3. Benefit Eligible HSP (House Staff Physicians)
 * 4. Student Workers
 * 5. Non-Benefit Eligible (Temp)
 * 6. Total Workforce
 *
 * Data Source: src/data/staticData.js (WORKFORCE_DATA)
 * Methodology: source-metrics/workforce/WORKFORCE_METHODOLOGY.md
 */

import { getWorkforceData, getTempTotal } from '../staticData';

/**
 * Expected values manifest for FY25 Q4 (6/30/2025)
 * Source: WORKFORCE_METHODOLOGY.md v2.0
 *
 * Update this manifest when new quarterly data is validated.
 */
const FY25_Q4_EXPECTED = {
  date: '2025-06-30',
  reportingDate: '6/30/25',
  metrics: {
    staff: { value: 1448, label: 'Benefit Eligible Staff', tolerance: 0 },
    faculty: { value: 689, label: 'Benefit Eligible Faculty', tolerance: 0 },
    hsp: { value: 612, label: 'Benefit Eligible HSP', tolerance: 0 },
    students: { value: 1714, label: 'Student Workers', tolerance: 0 },
    temp: { value: 574, label: 'Non-Benefit Eligible', tolerance: 0 },
    total: { value: 5037, label: 'Total Workforce', tolerance: 0 }
  },
  locations: {
    omaha: { value: 4287, label: 'Omaha Campus' },
    phoenix: { value: 750, label: 'Phoenix Campus' }
  }
};

/**
 * Expected values manifest for FY24 Q4 (6/30/2024)
 * Used for year-over-year comparison validation
 */
const FY24_Q4_EXPECTED = {
  date: '2024-06-30',
  reportingDate: '6/30/24',
  metrics: {
    staff: { value: 1431, label: 'Benefit Eligible Staff' },
    faculty: { value: 678, label: 'Benefit Eligible Faculty' },
    hsp: { value: 608, label: 'Benefit Eligible HSP' },
    students: { value: 1491, label: 'Student Workers' },
    temp: { value: 566, label: 'Non-Benefit Eligible' },
    total: { value: 4774, label: 'Total Workforce' }
  }
};

describe('Workforce Summary Card Metrics - FY25 Q4 (6/30/2025)', () => {
  const data = getWorkforceData('2025-06-30');

  describe('Data Structure', () => {
    it('should have all required fields for summary cards', () => {
      expect(data).toHaveProperty('staff');
      expect(data).toHaveProperty('faculty');
      expect(data).toHaveProperty('hsp');
      expect(data).toHaveProperty('studentCount');
      expect(data).toHaveProperty('temp');
      expect(data).toHaveProperty('totalEmployees');
    });

    it('should have correct reporting date', () => {
      expect(data.reportingDate).toBe(FY25_Q4_EXPECTED.reportingDate);
    });
  });

  describe('Summary Card Metrics (6 checks)', () => {
    it('Benefit Eligible Staff = 1,448', () => {
      expect(data.staff).toBe(FY25_Q4_EXPECTED.metrics.staff.value);
    });

    it('Benefit Eligible Faculty = 689', () => {
      expect(data.faculty).toBe(FY25_Q4_EXPECTED.metrics.faculty.value);
    });

    it('Benefit Eligible HSP = 612', () => {
      expect(data.hsp).toBe(FY25_Q4_EXPECTED.metrics.hsp.value);
    });

    it('Student Workers = 1,714', () => {
      expect(data.studentCount.total).toBe(FY25_Q4_EXPECTED.metrics.students.value);
    });

    it('Non-Benefit Eligible = 574', () => {
      // Using getTempTotal to match dashboard calculation (TEMP + NBE + PRN)
      const tempTotal = getTempTotal('2025-06-30');
      expect(tempTotal).toBe(FY25_Q4_EXPECTED.metrics.temp.value);
    });

    it('Total Workforce = 5,037', () => {
      expect(data.totalEmployees).toBe(FY25_Q4_EXPECTED.metrics.total.value);
    });
  });

  describe('Category Sum Validation', () => {
    it('all categories should sum to total workforce', () => {
      // Use getTempTotal() to match UI calculation (TEMP + NBE + PRN)
      const categorySum = data.staff + data.faculty + data.hsp +
        data.studentCount.total + getTempTotal('2025-06-30');
      expect(categorySum).toBe(data.totalEmployees);
    });
  });

  describe('Location Breakdown', () => {
    it('Omaha Campus = 4,287', () => {
      expect(data.locations['Omaha Campus']).toBe(FY25_Q4_EXPECTED.locations.omaha.value);
    });

    it('Phoenix Campus = 750', () => {
      expect(data.locations['Phoenix Campus']).toBe(FY25_Q4_EXPECTED.locations.phoenix.value);
    });

    it('campus totals should sum to total workforce', () => {
      const campusSum = data.locations['Omaha Campus'] + data.locations['Phoenix Campus'];
      expect(campusSum).toBe(data.totalEmployees);
    });
  });
});

describe('Workforce Summary Card Metrics - FY24 Q4 (6/30/2024)', () => {
  const data = getWorkforceData('2024-06-30');

  describe('Prior Year Data for YoY Comparison', () => {
    it('should have correct FY24 total for YoY calculation', () => {
      expect(data.totalEmployees).toBe(FY24_Q4_EXPECTED.metrics.total.value);
    });

    it('should have correct FY24 staff count', () => {
      expect(data.staff).toBe(FY24_Q4_EXPECTED.metrics.staff.value);
    });

    it('should have correct FY24 faculty count', () => {
      expect(data.faculty).toBe(FY24_Q4_EXPECTED.metrics.faculty.value);
    });
  });
});

describe('Year-over-Year Change Validation', () => {
  const fy25 = getWorkforceData('2025-06-30');
  const fy24 = getWorkforceData('2024-06-30');

  it('should show positive total headcount growth FY24 to FY25', () => {
    const change = fy25.totalEmployees - fy24.totalEmployees;
    expect(change).toBe(263); // 5037 - 4774 = +263
    expect(change).toBeGreaterThan(0);
  });

  it('should calculate correct YoY percentage change', () => {
    const yoyPercent = ((fy25.totalEmployees - fy24.totalEmployees) / fy24.totalEmployees) * 100;
    expect(Math.round(yoyPercent * 10) / 10).toBe(5.5); // +5.5%
  });

  it('staff count should show positive growth', () => {
    const change = fy25.staff - fy24.staff;
    expect(change).toBe(17); // 1448 - 1431 = +17
  });

  it('faculty count should show positive growth', () => {
    const change = fy25.faculty - fy24.faculty;
    expect(change).toBe(11); // 689 - 678 = +11
  });
});

describe('Methodology Compliance Checks', () => {
  const data = getWorkforceData('2025-06-30');

  describe('WORKFORCE_METHODOLOGY.md v2.0 Rules', () => {
    it('benefit-eligible (Faculty + Staff) should be ~42% of total', () => {
      const benefitEligible = data.faculty + data.staff;
      const percentage = (benefitEligible / data.totalEmployees) * 100;
      expect(percentage).toBeGreaterThan(40);
      expect(percentage).toBeLessThan(45);
    });

    it('student workers should be ~34% of total', () => {
      const percentage = (data.studentCount.total / data.totalEmployees) * 100;
      expect(percentage).toBeGreaterThan(30);
      expect(percentage).toBeLessThan(38);
    });

    it('HSP should be ~12% of total', () => {
      const percentage = (data.hsp / data.totalEmployees) * 100;
      expect(percentage).toBeGreaterThan(10);
      expect(percentage).toBeLessThan(15);
    });

    it('Phoenix should have higher HSP concentration than Omaha', () => {
      // Per methodology: Phoenix medical center operations have higher HSP proportion
      const phoenixHspConcentration = data.locationDetails.phoenix.hsp / data.locations['Phoenix Campus'];
      const omahaHspConcentration = data.locationDetails.omaha.hsp / data.locations['Omaha Campus'];
      expect(phoenixHspConcentration).toBeGreaterThan(omahaHspConcentration);
      // Phoenix: 344/750 = 45.9% vs Omaha: 268/4287 = 6.3%
    });

    it('Omaha should be the larger campus (~85% of total)', () => {
      const omahaPercent = (data.locations['Omaha Campus'] / data.totalEmployees) * 100;
      expect(omahaPercent).toBeGreaterThan(80);
      expect(omahaPercent).toBeLessThan(90);
    });
  });
});

describe('Data Quality Checks', () => {
  const data = getWorkforceData('2025-06-30');

  it('no negative counts', () => {
    expect(data.staff).toBeGreaterThanOrEqual(0);
    expect(data.faculty).toBeGreaterThanOrEqual(0);
    expect(data.hsp).toBeGreaterThanOrEqual(0);
    expect(data.studentCount.total).toBeGreaterThanOrEqual(0);
    expect(data.temp).toBeGreaterThanOrEqual(0);
    expect(data.totalEmployees).toBeGreaterThan(0);
  });

  it('all values should be integers', () => {
    expect(Number.isInteger(data.staff)).toBe(true);
    expect(Number.isInteger(data.faculty)).toBe(true);
    expect(Number.isInteger(data.hsp)).toBe(true);
    expect(Number.isInteger(data.studentCount.total)).toBe(true);
    expect(Number.isInteger(data.temp)).toBe(true);
    expect(Number.isInteger(data.totalEmployees)).toBe(true);
  });

  it('total should be within expected range for Creighton', () => {
    // Creighton typically has 4,500-6,000 total employees
    expect(data.totalEmployees).toBeGreaterThan(4500);
    expect(data.totalEmployees).toBeLessThan(6000);
  });
});

/**
 * Location Details Validation Tests
 *
 * 12 validation tests for location-specific metrics:
 * - 6 Omaha metrics (total, faculty, staff, hsp, students, temp)
 * - 6 Phoenix metrics (total, faculty, staff, hsp, students, temp)
 *
 * Data Lineage: Excel → Neon DB → API → React Screen
 * Reference: docs/DATA_MAPPING.md
 */

const FY25_Q4_LOCATION_EXPECTED = {
  omaha: {
    total: 4287,
    faculty: 649,
    staff: 1344,
    hsp: 268,
    students: 1604,
    temp: 422
  },
  phoenix: {
    total: 750,
    faculty: 40,
    staff: 104,
    hsp: 344,
    students: 110,
    temp: 152
  }
};

describe('Location Details - Omaha Campus (6 checks)', () => {
  const data = getWorkforceData('2025-06-30');

  it('Omaha Total = 4,287', () => {
    expect(data.locations['Omaha Campus']).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.total);
  });

  it('Omaha Faculty = 649', () => {
    expect(data.locationDetails.omaha.faculty).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.faculty);
  });

  it('Omaha Staff = 1,344', () => {
    expect(data.locationDetails.omaha.staff).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.staff);
  });

  it('Omaha HSP = 268', () => {
    expect(data.locationDetails.omaha.hsp).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.hsp);
  });

  it('Omaha Students = 1,604', () => {
    expect(data.locationDetails.omaha.students).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.students);
  });

  it('Omaha Temp = 422', () => {
    expect(data.locationDetails.omaha.temp).toBe(FY25_Q4_LOCATION_EXPECTED.omaha.temp);
  });
});

describe('Location Details - Phoenix Campus (6 checks)', () => {
  const data = getWorkforceData('2025-06-30');

  it('Phoenix Total = 750', () => {
    expect(data.locations['Phoenix Campus']).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.total);
  });

  it('Phoenix Faculty = 40', () => {
    expect(data.locationDetails.phoenix.faculty).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.faculty);
  });

  it('Phoenix Staff = 104', () => {
    expect(data.locationDetails.phoenix.staff).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.staff);
  });

  it('Phoenix HSP = 344', () => {
    expect(data.locationDetails.phoenix.hsp).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.hsp);
  });

  it('Phoenix Students = 110', () => {
    expect(data.locationDetails.phoenix.students).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.students);
  });

  it('Phoenix Temp = 152', () => {
    expect(data.locationDetails.phoenix.temp).toBe(FY25_Q4_LOCATION_EXPECTED.phoenix.temp);
  });
});

describe('Location Details - Cross-Check Validations', () => {
  const data = getWorkforceData('2025-06-30');

  it('Omaha category sum equals Omaha total', () => {
    const omahaSum = data.locationDetails.omaha.faculty +
                     data.locationDetails.omaha.staff +
                     data.locationDetails.omaha.hsp +
                     data.locationDetails.omaha.students +
                     data.locationDetails.omaha.temp;
    expect(omahaSum).toBe(data.locations['Omaha Campus']);
  });

  it('Phoenix category sum equals Phoenix total', () => {
    const phoenixSum = data.locationDetails.phoenix.faculty +
                       data.locationDetails.phoenix.staff +
                       data.locationDetails.phoenix.hsp +
                       data.locationDetails.phoenix.students +
                       data.locationDetails.phoenix.temp;
    expect(phoenixSum).toBe(data.locations['Phoenix Campus']);
  });

  it('combined campus totals equal total workforce', () => {
    const combinedTotal = data.locations['Omaha Campus'] + data.locations['Phoenix Campus'];
    expect(combinedTotal).toBe(data.totalEmployees);
  });

  it('category totals across locations equal summary card totals', () => {
    // Faculty: Omaha + Phoenix = Total
    const totalFaculty = data.locationDetails.omaha.faculty + data.locationDetails.phoenix.faculty;
    expect(totalFaculty).toBe(data.faculty);

    // Staff: Omaha + Phoenix = Total
    const totalStaff = data.locationDetails.omaha.staff + data.locationDetails.phoenix.staff;
    expect(totalStaff).toBe(data.staff);

    // HSP: Omaha + Phoenix = Total
    const totalHsp = data.locationDetails.omaha.hsp + data.locationDetails.phoenix.hsp;
    expect(totalHsp).toBe(data.hsp);

    // Students: Omaha + Phoenix = Total
    const totalStudents = data.locationDetails.omaha.students + data.locationDetails.phoenix.students;
    expect(totalStudents).toBe(data.studentCount.total);

    // Temp: Omaha + Phoenix = Total
    const totalTemp = data.locationDetails.omaha.temp + data.locationDetails.phoenix.temp;
    expect(totalTemp).toBe(data.temp);
  });
});
