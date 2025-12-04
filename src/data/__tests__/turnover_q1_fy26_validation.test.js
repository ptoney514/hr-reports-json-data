/**
 * Q1 FY26 Turnover Data Validation Test Suite
 *
 * Validates Q1 FY26 turnover data against TERMINATION_METHODOLOGY.md
 * Ensures data integrity, categorization accuracy, and business rule compliance
 *
 * Data Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
 * Processing: scripts/extract_q1_fy26_details.py
 *
 * METHODOLOGY UPDATE (Nov 19, 2025):
 * - Grade R (Residents/Fellows) excluded from benefit-eligible staff counts
 * - Staff Exempt: 39 → 24 (15 Grade R excluded)
 * - Staff Non-Exempt: 30 (unchanged)
 * - Total Staff: 69 → 54 (15 Grade R excluded)
 * - Total Terminations: 73 → 58 (15 Grade R excluded)
 */

import {
  getQuarterlyTurnoverData,
  QUARTERLY_TURNOVER_DATA
} from '../staticData';

describe('Q1 FY26 Turnover Data Validation', () => {
  const q1fy26Data = getQuarterlyTurnoverData("2025-09-30");

  describe('Data Structure Validation', () => {
    it('should have all required top-level properties', () => {
      expect(q1fy26Data).toHaveProperty('reportingDate');
      expect(q1fy26Data).toHaveProperty('quarter');
      expect(q1fy26Data).toHaveProperty('fiscalPeriod');
      expect(q1fy26Data).toHaveProperty('summary');
      expect(q1fy26Data).toHaveProperty('terminationTypesByGroup');
      expect(q1fy26Data).toHaveProperty('yearsOfService');
      expect(q1fy26Data).toHaveProperty('ageGroups');
      expect(q1fy26Data).toHaveProperty('earlyTurnover');
      expect(q1fy26Data).toHaveProperty('staffTurnoverBySchool');
      expect(q1fy26Data).toHaveProperty('facultyTurnoverBySchool');
      expect(q1fy26Data).toHaveProperty('turnoverBySchool');
    });

    it('should have correct metadata', () => {
      expect(q1fy26Data.reportingDate).toBe("9/30/25");
      expect(q1fy26Data.quarter).toBe("Q1 FY26");
      expect(q1fy26Data.fiscalPeriod).toBe("July 2025 - September 2025");
    });

    it('should have all summary categories', () => {
      expect(q1fy26Data.summary).toHaveProperty('total');
      expect(q1fy26Data.summary).toHaveProperty('faculty');
      expect(q1fy26Data.summary).toHaveProperty('staffExempt');
      expect(q1fy26Data.summary).toHaveProperty('staffNonExempt');
      expect(q1fy26Data.summary).toHaveProperty('staff');
    });

    it('should have campus breakdown for each category', () => {
      Object.values(q1fy26Data.summary).forEach(category => {
        expect(category).toHaveProperty('count');
        expect(category).toHaveProperty('oma');
        expect(category).toHaveProperty('phx');
      });
    });
  });

  describe('Total Terminations Validation', () => {
    it('should have correct total terminations count', () => {
      // Updated Nov 2025: Grade R excluded (73 → 58)
      expect(q1fy26Data.summary.total.count).toBe(58);
    });

    it('should match campus totals', () => {
      expect(q1fy26Data.summary.total.oma).toBe(53);
      expect(q1fy26Data.summary.total.phx).toBe(5);
      expect(q1fy26Data.summary.total.oma + q1fy26Data.summary.total.phx).toBe(58);
    });

    it('should equal sum of faculty + staff', () => {
      const categorySum = q1fy26Data.summary.faculty.count + q1fy26Data.summary.staff.count;
      expect(categorySum).toBe(q1fy26Data.summary.total.count);
      expect(categorySum).toBe(58);
    });
  });

  describe('Faculty Terminations Validation', () => {
    it('should have correct faculty termination count', () => {
      expect(q1fy26Data.summary.faculty.count).toBe(4);
    });

    it('should have correct campus distribution', () => {
      expect(q1fy26Data.summary.faculty.oma).toBe(4);
      expect(q1fy26Data.summary.faculty.phx).toBe(0);
      expect(q1fy26Data.summary.faculty.oma + q1fy26Data.summary.faculty.phx).toBe(4);
    });
  });

  describe('Staff Terminations Validation', () => {
    it('should have correct staff termination count', () => {
      // Updated Nov 2025: Grade R excluded (69 → 54)
      expect(q1fy26Data.summary.staff.count).toBe(54);
    });

    it('should have correct campus distribution', () => {
      expect(q1fy26Data.summary.staff.oma).toBe(49);
      expect(q1fy26Data.summary.staff.phx).toBe(5);
      expect(q1fy26Data.summary.staff.oma + q1fy26Data.summary.staff.phx).toBe(54);
    });

    it('should equal staffExempt + staffNonExempt', () => {
      const staffSum = q1fy26Data.summary.staffExempt.count + q1fy26Data.summary.staffNonExempt.count;
      expect(staffSum).toBe(q1fy26Data.summary.staff.count);
      expect(staffSum).toBe(54);
    });

    it('should have correct staff exempt count', () => {
      // Updated Nov 2025: Grade R excluded (39 → 24)
      expect(q1fy26Data.summary.staffExempt.count).toBe(24);
    });

    it('should have correct staff non-exempt count', () => {
      expect(q1fy26Data.summary.staffNonExempt.count).toBe(30);
    });
  });

  describe('Termination Types by Group Validation', () => {
    it('should have exactly 2 employee groups', () => {
      expect(q1fy26Data.terminationTypesByGroup).toHaveLength(2);
    });

    it('should validate faculty termination types', () => {
      const facultyGroup = q1fy26Data.terminationTypesByGroup.find(
        g => g.group === "Benefit Eligible Faculty"
      );
      expect(facultyGroup).toBeDefined();
      expect(facultyGroup.total).toBe(4);
      expect(facultyGroup.voluntary).toBe(2);
      expect(facultyGroup.involuntary).toBe(0);
      expect(facultyGroup.retirement).toBe(2);
      expect(facultyGroup.endOfAssignment).toBe(0);
    });

    it('should validate staff termination types', () => {
      const staffGroup = q1fy26Data.terminationTypesByGroup.find(
        g => g.group === "Benefit Eligible Staff"
      );
      expect(staffGroup).toBeDefined();
      // Updated Nov 2025: Grade R excluded
      expect(staffGroup.total).toBe(54);
      expect(staffGroup.voluntary).toBe(44);
      expect(staffGroup.involuntary).toBe(3);
      expect(staffGroup.retirement).toBe(7);
      expect(staffGroup.endOfAssignment).toBe(0);
    });

    it('should validate termination types sum to total for each group', () => {
      q1fy26Data.terminationTypesByGroup.forEach(group => {
        const typesSum = group.voluntary + group.involuntary + group.retirement + group.endOfAssignment;
        expect(typesSum).toBe(group.total);
      });
    });
  });

  describe('Staff Turnover by School Validation', () => {
    it('should have staffTurnoverBySchool data', () => {
      expect(q1fy26Data.staffTurnoverBySchool).toBeDefined();
      expect(Array.isArray(q1fy26Data.staffTurnoverBySchool)).toBe(true);
    });

    it('should have 8 school/area entries', () => {
      expect(q1fy26Data.staffTurnoverBySchool).toHaveLength(8);
    });

    it('should have correct structure for each school entry', () => {
      q1fy26Data.staffTurnoverBySchool.forEach(entry => {
        expect(entry).toHaveProperty('school');
        expect(entry).toHaveProperty('count');
        expect(entry).toHaveProperty('percentage');
        expect(entry).toHaveProperty('color');
        expect(typeof entry.school).toBe('string');
        expect(typeof entry.count).toBe('number');
        expect(typeof entry.percentage).toBe('number');
        expect(typeof entry.color).toBe('string');
      });
    });

    it('should sum to total staff terminations', () => {
      const schoolSum = q1fy26Data.staffTurnoverBySchool.reduce(
        (sum, entry) => sum + entry.count, 0
      );
      expect(schoolSum).toBe(q1fy26Data.summary.staff.count);
      expect(schoolSum).toBe(54);
    });

    it('should have percentages that sum to approximately 100%', () => {
      const percentageSum = q1fy26Data.staffTurnoverBySchool.reduce(
        (sum, entry) => sum + entry.percentage, 0
      );
      // Allow for rounding (should be between 99.5% and 100.5%)
      expect(percentageSum).toBeGreaterThan(99.5);
      expect(percentageSum).toBeLessThan(100.5);
    });

    it('should have Medicine as highest departure count', () => {
      const medicine = q1fy26Data.staffTurnoverBySchool.find(s => s.school === "Medicine");
      expect(medicine).toBeDefined();
      expect(medicine.count).toBe(10);

      const maxCount = Math.max(...q1fy26Data.staffTurnoverBySchool.map(s => s.count));
      // Note: "Other" has 17 which is highest, but Medicine is highest individual school
      const nonOtherMax = Math.max(...q1fy26Data.staffTurnoverBySchool
        .filter(s => s.school !== "Other")
        .map(s => s.count));
      expect(medicine.count).toBe(nonOtherMax);
    });

    it('should have valid "Other" category aggregation', () => {
      const other = q1fy26Data.staffTurnoverBySchool.find(s => s.school === "Other");
      expect(other).toBeDefined();
      expect(other.count).toBe(17);
      expect(other.percentage).toBe(31.5);
    });

    it('should validate individual school counts', () => {
      const expectedSchools = [
        { school: "Medicine", count: 10 },
        { school: "Pharmacy & Health Professions", count: 5 },
        { school: "Student Life", count: 5 },
        { school: "Dentistry", count: 5 },
        { school: "Facilities", count: 5 },
        { school: "Athletics", count: 4 },
        { school: "Public Safety", count: 3 },
        { school: "Other", count: 17 }
      ];

      expectedSchools.forEach(expected => {
        const actual = q1fy26Data.staffTurnoverBySchool.find(s => s.school === expected.school);
        expect(actual).toBeDefined();
        expect(actual.count).toBe(expected.count);
      });
    });
  });

  describe('Faculty Turnover by School Validation', () => {
    it('should have facultyTurnoverBySchool data', () => {
      expect(q1fy26Data.facultyTurnoverBySchool).toBeDefined();
      expect(Array.isArray(q1fy26Data.facultyTurnoverBySchool)).toBe(true);
    });

    it('should have 3 school entries', () => {
      expect(q1fy26Data.facultyTurnoverBySchool).toHaveLength(3);
    });

    it('should have correct structure for each school entry', () => {
      q1fy26Data.facultyTurnoverBySchool.forEach(entry => {
        expect(entry).toHaveProperty('school');
        expect(entry).toHaveProperty('count');
        expect(entry).toHaveProperty('percentage');
        expect(entry).toHaveProperty('color');
        expect(typeof entry.school).toBe('string');
        expect(typeof entry.count).toBe('number');
        expect(typeof entry.percentage).toBe('number');
        expect(typeof entry.color).toBe('string');
      });
    });

    it('should sum to total faculty terminations', () => {
      const schoolSum = q1fy26Data.facultyTurnoverBySchool.reduce(
        (sum, entry) => sum + entry.count, 0
      );
      expect(schoolSum).toBe(q1fy26Data.summary.faculty.count);
      expect(schoolSum).toBe(4);
    });

    it('should have percentages that sum to 100%', () => {
      const percentageSum = q1fy26Data.facultyTurnoverBySchool.reduce(
        (sum, entry) => sum + entry.percentage, 0
      );
      expect(percentageSum).toBe(100);
    });

    it('should have Pharmacy & Health Professions as highest departure count', () => {
      const pharmacy = q1fy26Data.facultyTurnoverBySchool.find(
        s => s.school === "Pharmacy & Health Professions"
      );
      expect(pharmacy).toBeDefined();
      expect(pharmacy.count).toBe(2);
      expect(pharmacy.percentage).toBe(50.0);
    });

    it('should validate individual faculty school counts', () => {
      const expectedSchools = [
        { school: "Pharmacy & Health Professions", count: 2, percentage: 50.0 },
        { school: "Law School", count: 1, percentage: 25.0 },
        { school: "Arts & Sciences", count: 1, percentage: 25.0 }
      ];

      expectedSchools.forEach(expected => {
        const actual = q1fy26Data.facultyTurnoverBySchool.find(s => s.school === expected.school);
        expect(actual).toBeDefined();
        expect(actual.count).toBe(expected.count);
        expect(actual.percentage).toBe(expected.percentage);
      });
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      q1fy26Data.facultyTurnoverBySchool.forEach(entry => {
        expect(entry.color).toMatch(hexColorRegex);
      });
    });
  });

  describe('Combined Turnover by School Validation', () => {
    it('should have turnoverBySchool data', () => {
      expect(q1fy26Data.turnoverBySchool).toBeDefined();
      expect(Array.isArray(q1fy26Data.turnoverBySchool)).toBe(true);
    });

    it('should have 10 school entries', () => {
      expect(q1fy26Data.turnoverBySchool).toHaveLength(10);
    });

    it('should have correct structure for each entry', () => {
      q1fy26Data.turnoverBySchool.forEach(entry => {
        expect(entry).toHaveProperty('school');
        expect(entry).toHaveProperty('faculty');
        expect(entry).toHaveProperty('staff');
        expect(entry).toHaveProperty('total');
        expect(typeof entry.school).toBe('string');
        expect(typeof entry.faculty).toBe('number');
        expect(typeof entry.staff).toBe('number');
        expect(typeof entry.total).toBe('number');
      });
    });

    it('should have faculty + staff equal total for each row', () => {
      q1fy26Data.turnoverBySchool.forEach(entry => {
        expect(entry.faculty + entry.staff).toBe(entry.total);
      });
    });

    it('should have faculty sum matching summary', () => {
      const facultySum = q1fy26Data.turnoverBySchool.reduce((sum, s) => sum + s.faculty, 0);
      expect(facultySum).toBe(q1fy26Data.summary.faculty.count);
      expect(facultySum).toBe(4);
    });

    it('should have staff sum matching summary', () => {
      const staffSum = q1fy26Data.turnoverBySchool.reduce((sum, s) => sum + s.staff, 0);
      expect(staffSum).toBe(q1fy26Data.summary.staff.count);
      expect(staffSum).toBe(54);
    });

    it('should have total sum matching overall terminations', () => {
      const totalSum = q1fy26Data.turnoverBySchool.reduce((sum, s) => sum + s.total, 0);
      expect(totalSum).toBe(q1fy26Data.summary.total.count);
      expect(totalSum).toBe(58);
    });

    it('should have Medicine as highest total', () => {
      const medicine = q1fy26Data.turnoverBySchool.find(s => s.school === "Medicine");
      expect(medicine).toBeDefined();
      expect(medicine.total).toBe(10);
      expect(medicine.faculty).toBe(0);
      expect(medicine.staff).toBe(10);
    });

    it('should have Pharmacy & Health Professions with both faculty and staff', () => {
      const pharmacy = q1fy26Data.turnoverBySchool.find(s => s.school === "Pharmacy & Health Professions");
      expect(pharmacy).toBeDefined();
      expect(pharmacy.faculty).toBe(2);
      expect(pharmacy.staff).toBe(5);
      expect(pharmacy.total).toBe(7);
    });

    it('should be sorted by total descending (excluding Other)', () => {
      const nonOtherSchools = q1fy26Data.turnoverBySchool.filter(s => s.school !== "Other");
      for (let i = 0; i < nonOtherSchools.length - 1; i++) {
        expect(nonOtherSchools[i].total).toBeGreaterThanOrEqual(nonOtherSchools[i + 1].total);
      }
    });
  });

  describe('Years of Service Validation', () => {
    it('should have 7 tenure bands', () => {
      expect(q1fy26Data.yearsOfService).toHaveLength(7);
    });

    it('should validate years of service sum to totals', () => {
      const facultySum = q1fy26Data.yearsOfService.reduce((sum, y) => sum + y.faculty, 0);
      const staffSum = q1fy26Data.yearsOfService.reduce((sum, y) => sum + y.staff, 0);

      expect(facultySum).toBe(q1fy26Data.summary.faculty.count);
      expect(staffSum).toBe(q1fy26Data.summary.staff.count);
    });

    it('should have correct early turnover count (<1 year)', () => {
      const earlyTenure = q1fy26Data.yearsOfService.find(y => y.range === "<1 Year");
      expect(earlyTenure).toBeDefined();
      expect(earlyTenure.faculty).toBe(0);
      expect(earlyTenure.staff).toBe(13);
    });
  });

  describe('Early Turnover Validation', () => {
    it('should have correct early turnover total', () => {
      expect(q1fy26Data.earlyTurnover.total).toBe(13);
    });

    it('should have correct termination type breakdown', () => {
      expect(q1fy26Data.earlyTurnover.byTerminationType).toHaveLength(2);

      const voluntary = q1fy26Data.earlyTurnover.byTerminationType.find(t => t.name === "Voluntary");
      const involuntary = q1fy26Data.earlyTurnover.byTerminationType.find(t => t.name === "Involuntary");

      expect(voluntary.value).toBe(11);
      expect(involuntary.value).toBe(2);
      expect(voluntary.value + involuntary.value).toBe(13);
    });

    it('should have correct employee category breakdown', () => {
      expect(q1fy26Data.earlyTurnover.byEmployeeCategory).toHaveLength(1);

      const staff = q1fy26Data.earlyTurnover.byEmployeeCategory.find(
        c => c.name === "Benefit Eligible Staff"
      );
      expect(staff).toBeDefined();
      expect(staff.value).toBe(13);
      expect(staff.percentage).toBe(100.0);
    });

    it('should have bySchool data for early turnover', () => {
      expect(q1fy26Data.earlyTurnover.bySchool).toBeDefined();
      expect(Array.isArray(q1fy26Data.earlyTurnover.bySchool)).toBe(true);
      expect(q1fy26Data.earlyTurnover.bySchool).toHaveLength(4);
    });

    it('should have bySchool sum to early turnover total', () => {
      const schoolSum = q1fy26Data.earlyTurnover.bySchool.reduce(
        (sum, entry) => sum + entry.count, 0
      );
      expect(schoolSum).toBe(q1fy26Data.earlyTurnover.total);
      expect(schoolSum).toBe(13);
    });

    it('should have correct bySchool breakdown', () => {
      const expectedSchools = [
        { school: "Medicine", count: 4, percentage: 30.8 },
        { school: "Public Safety", count: 2, percentage: 15.4 },
        { school: "Facilities", count: 2, percentage: 15.4 },
        { school: "Other", count: 5, percentage: 38.5 }
      ];

      expectedSchools.forEach(expected => {
        const actual = q1fy26Data.earlyTurnover.bySchool.find(s => s.school === expected.school);
        expect(actual).toBeDefined();
        expect(actual.count).toBe(expected.count);
        expect(actual.percentage).toBe(expected.percentage);
      });
    });

    it('should have Medicine as top early turnover school', () => {
      const medicine = q1fy26Data.earlyTurnover.bySchool.find(s => s.school === "Medicine");
      expect(medicine).toBeDefined();
      expect(medicine.count).toBe(4);

      // Should be highest individual school (Other is aggregated)
      const nonOtherMax = Math.max(...q1fy26Data.earlyTurnover.bySchool
        .filter(s => s.school !== "Other")
        .map(s => s.count));
      expect(medicine.count).toBe(nonOtherMax);
    });

    it('should have bySchoolDetailed data for early turnover', () => {
      expect(q1fy26Data.earlyTurnover.bySchoolDetailed).toBeDefined();
      expect(Array.isArray(q1fy26Data.earlyTurnover.bySchoolDetailed)).toBe(true);
    });

    it('should have 8 detailed school entries', () => {
      expect(q1fy26Data.earlyTurnover.bySchoolDetailed).toHaveLength(8);
    });

    it('should have bySchoolDetailed sum to early turnover total', () => {
      const schoolSum = q1fy26Data.earlyTurnover.bySchoolDetailed.reduce(
        (sum, entry) => sum + entry.count, 0
      );
      expect(schoolSum).toBe(q1fy26Data.earlyTurnover.total);
      expect(schoolSum).toBe(13);
    });

    it('should have correct bySchoolDetailed breakdown', () => {
      const expectedSchools = [
        { school: "Medicine", count: 4, percentage: 30.8 },
        { school: "Facilities", count: 2, percentage: 15.4 },
        { school: "Public Safety", count: 2, percentage: 15.4 },
        { school: "Pharmacy & Health Professions", count: 1, percentage: 7.7 },
        { school: "Provost", count: 1, percentage: 7.7 },
        { school: "Student Success", count: 1, percentage: 7.7 },
        { school: "Enrollment Management", count: 1, percentage: 7.7 },
        { school: "Student Life", count: 1, percentage: 7.7 }
      ];

      expectedSchools.forEach(expected => {
        const actual = q1fy26Data.earlyTurnover.bySchoolDetailed.find(s => s.school === expected.school);
        expect(actual).toBeDefined();
        expect(actual.count).toBe(expected.count);
        expect(actual.percentage).toBe(expected.percentage);
      });
    });

    it('should be sorted by count descending in bySchoolDetailed', () => {
      const detailed = q1fy26Data.earlyTurnover.bySchoolDetailed;
      for (let i = 0; i < detailed.length - 1; i++) {
        expect(detailed[i].count).toBeGreaterThanOrEqual(detailed[i + 1].count);
      }
    });
  });

  describe('Age Groups Validation', () => {
    it('should have 6 age groups', () => {
      expect(q1fy26Data.ageGroups).toHaveLength(6);
    });

    it('should validate age groups sum to totals', () => {
      const facultySum = q1fy26Data.ageGroups.reduce((sum, a) => sum + a.faculty, 0);
      const staffSum = q1fy26Data.ageGroups.reduce((sum, a) => sum + a.staff, 0);

      expect(facultySum).toBe(q1fy26Data.summary.faculty.count);
      expect(staffSum).toBe(q1fy26Data.summary.staff.count);
    });
  });

  describe('Cross-Validation Checks', () => {
    it('should validate terminationTypesByGroup totals match summary', () => {
      const facultyGroup = q1fy26Data.terminationTypesByGroup.find(
        g => g.group === "Benefit Eligible Faculty"
      );
      const staffGroup = q1fy26Data.terminationTypesByGroup.find(
        g => g.group === "Benefit Eligible Staff"
      );

      expect(facultyGroup.total).toBe(q1fy26Data.summary.faculty.count);
      expect(staffGroup.total).toBe(q1fy26Data.summary.staff.count);
    });

    it('should validate early turnover matches <1 year tenure data', () => {
      const earlyTenure = q1fy26Data.yearsOfService.find(y => y.range === "<1 Year");
      const earlyTenureTotal = earlyTenure.faculty + earlyTenure.staff;

      expect(q1fy26Data.earlyTurnover.total).toBe(earlyTenureTotal);
    });

    it('should validate staffTurnoverBySchool matches staff summary', () => {
      const schoolSum = q1fy26Data.staffTurnoverBySchool.reduce((sum, s) => sum + s.count, 0);
      expect(schoolSum).toBe(q1fy26Data.summary.staff.count);
    });

    it('should validate facultyTurnoverBySchool matches faculty summary', () => {
      const schoolSum = q1fy26Data.facultyTurnoverBySchool.reduce((sum, s) => sum + s.count, 0);
      expect(schoolSum).toBe(q1fy26Data.summary.faculty.count);
    });
  });

  describe('Data Quality Checks', () => {
    it('should have no null or undefined values in summary', () => {
      Object.values(q1fy26Data.summary).forEach(category => {
        expect(category.count).toBeDefined();
        expect(category.count).not.toBeNull();
        expect(category.oma).toBeDefined();
        expect(category.oma).not.toBeNull();
        expect(category.phx).toBeDefined();
        expect(category.phx).not.toBeNull();
      });
    });

    it('should have valid hex color codes in staffTurnoverBySchool', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      q1fy26Data.staffTurnoverBySchool.forEach(entry => {
        expect(entry.color).toMatch(hexColorRegex);
      });
    });

    it('should have positive counts for main categories', () => {
      expect(q1fy26Data.summary.total.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.faculty.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.staff.count).toBeGreaterThan(0);
    });
  });

  describe('Data Traceability', () => {
    it('should validate Q1 FY26 data is accessible via date key', () => {
      expect(QUARTERLY_TURNOVER_DATA).toHaveProperty("2025-09-30");
      expect(QUARTERLY_TURNOVER_DATA["2025-09-30"]).toBeDefined();
    });

    it('should validate data matches extraction script output', () => {
      // These values should match scripts/extract_q1_fy26_details.py output
      // Updated Nov 2025: Grade R methodology change
      expect(q1fy26Data.summary.total.count).toBe(58);
      expect(q1fy26Data.summary.faculty.count).toBe(4);
      expect(q1fy26Data.summary.staff.count).toBe(54);
      expect(q1fy26Data.earlyTurnover.total).toBe(13);
    });
  });
});
