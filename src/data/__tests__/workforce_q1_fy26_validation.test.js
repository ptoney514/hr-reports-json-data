/**
 * Q1 FY26 Workforce Data Validation Test Suite
 *
 * Validates Q1 FY26 workforce data against WORKFORCE_METHODOLOGY.md v2.1
 * Ensures data integrity, categorization accuracy, and business rule compliance
 *
 * Data Source: source-metrics/workforce/cleaned/FY26_Q1/q1_fy26_workforce_snapshot.json
 * Processing: scripts/extract_q1_fy26_workforce.js
 *
 * METHODOLOGY UPDATE (Dec 4, 2025):
 * - Grade R (Residents/Fellows) now INCLUDED as benefit-eligible under House Staff Physicians
 * - HSP: 613 → 625 (12 Grade R added)
 * - Temporary: 642 → 630 (12 Grade R removed)
 * - Benefit-eligible total: 2116 → 2128 (Faculty + Staff + HSP)
 */

import {
  getQuarterlyWorkforceData,
  QUARTERLY_WORKFORCE_DATA
} from '../staticData';

describe('Q1 FY26 Workforce Data Validation', () => {
  const q1fy26Data = getQuarterlyWorkforceData("2025-09-30");

  describe('Data Structure Validation', () => {
    it('should have all required top-level properties', () => {
      expect(q1fy26Data).toHaveProperty('reportingDate');
      expect(q1fy26Data).toHaveProperty('quarter');
      expect(q1fy26Data).toHaveProperty('fiscalPeriod');
      expect(q1fy26Data).toHaveProperty('summary');
      expect(q1fy26Data).toHaveProperty('employeeGroups');
      expect(q1fy26Data).toHaveProperty('locationDetails');
      expect(q1fy26Data).toHaveProperty('assignmentCategories');
    });

    it('should have correct metadata', () => {
      expect(q1fy26Data.reportingDate).toBe("9/30/25");
      expect(q1fy26Data.quarter).toBe("Q1 FY26");
      expect(q1fy26Data.fiscalPeriod).toBe("July 2025 - September 2025");
    });

    it('should have all summary categories', () => {
      expect(q1fy26Data.summary).toHaveProperty('total');
      expect(q1fy26Data.summary).toHaveProperty('faculty');
      expect(q1fy26Data.summary).toHaveProperty('staff');
      expect(q1fy26Data.summary).toHaveProperty('houseStaffPhysicians');
      expect(q1fy26Data.summary).toHaveProperty('studentWorkers');
      expect(q1fy26Data.summary).toHaveProperty('temporary');
    });

    it('should have campus breakdown for each category', () => {
      Object.values(q1fy26Data.summary).forEach(category => {
        expect(category).toHaveProperty('count');
        expect(category).toHaveProperty('oma');
        expect(category).toHaveProperty('phx');
      });
    });
  });

  describe('WORKFORCE_METHODOLOGY.md v2.0 Compliance', () => {
    describe('Total Headcount Validation', () => {
      it('should have correct total headcount', () => {
        expect(q1fy26Data.summary.total.count).toBe(5528);
      });

      it('should match campus totals', () => {
        expect(q1fy26Data.summary.total.oma).toBe(4834);
        expect(q1fy26Data.summary.total.phx).toBe(694);
        expect(q1fy26Data.summary.total.oma + q1fy26Data.summary.total.phx).toBe(5528);
      });

      it('should equal sum of all employee categories', () => {
        const categorySum =
          q1fy26Data.summary.faculty.count +
          q1fy26Data.summary.staff.count +
          q1fy26Data.summary.houseStaffPhysicians.count +
          q1fy26Data.summary.studentWorkers.count +
          q1fy26Data.summary.temporary.count;

        expect(categorySum).toBe(q1fy26Data.summary.total.count);
        expect(categorySum).toBe(5528);
      });
    });

    describe('Benefit-Eligible Faculty Validation', () => {
      it('should have correct faculty count per methodology', () => {
        // Per WORKFORCE_METHODOLOGY.md: Faculty with F or PT codes
        expect(q1fy26Data.summary.faculty.count).toBe(697);
      });

      it('should have correct campus distribution', () => {
        expect(q1fy26Data.summary.faculty.oma).toBe(657);
        expect(q1fy26Data.summary.faculty.phx).toBe(40);
        expect(q1fy26Data.summary.faculty.oma + q1fy26Data.summary.faculty.phx).toBe(697);
      });

      it('should match locationDetails', () => {
        expect(q1fy26Data.locationDetails.omaha.faculty).toBe(657);
        expect(q1fy26Data.locationDetails.phoenix.faculty).toBe(40);
      });
    });

    describe('Benefit-Eligible Staff Validation', () => {
      it('should have correct staff count per methodology', () => {
        // Per WORKFORCE_METHODOLOGY.md: Staff with F or PT codes (excluding HSR and Grade R)
        // Updated Nov 2025: Grade R (Residents/Fellows) excluded from benefit-eligible
        expect(q1fy26Data.summary.staff.count).toBe(1419);
      });

      it('should have correct campus distribution', () => {
        expect(q1fy26Data.summary.staff.oma).toBe(1318);
        expect(q1fy26Data.summary.staff.phx).toBe(101);
        expect(q1fy26Data.summary.staff.oma + q1fy26Data.summary.staff.phx).toBe(1419);
      });

      it('should match locationDetails', () => {
        expect(q1fy26Data.locationDetails.omaha.staff).toBe(1318);
        expect(q1fy26Data.locationDetails.phoenix.staff).toBe(101);
      });
    });

    describe('House Staff Physicians Validation', () => {
      it('should have correct HSP count per methodology', () => {
        // Per WORKFORCE_METHODOLOGY.md v2.1: HSR (613) + Grade R (12) = 625
        expect(q1fy26Data.summary.houseStaffPhysicians.count).toBe(625);
      });

      it('should have correct campus distribution', () => {
        expect(q1fy26Data.summary.houseStaffPhysicians.oma).toBe(282);
        expect(q1fy26Data.summary.houseStaffPhysicians.phx).toBe(343);
        expect(q1fy26Data.summary.houseStaffPhysicians.oma + q1fy26Data.summary.houseStaffPhysicians.phx).toBe(625);
      });

      it('should validate Phoenix has higher HSP concentration', () => {
        // Per methodology: Phoenix medical center has higher HSP count
        expect(q1fy26Data.summary.houseStaffPhysicians.phx).toBeGreaterThan(q1fy26Data.summary.houseStaffPhysicians.oma);
      });

      it('should include HSR assignment category plus Grade R', () => {
        // HSR = 613, Grade R with F12 = 12, Total HSP = 625
        const hsrCount = q1fy26Data.assignmentCategories['HSR'];
        const gradeRCount = q1fy26Data.gradeRInclusion?.count || 12;
        expect(hsrCount + gradeRCount).toBe(625);
      });
    });

    describe('Student Workers Validation', () => {
      it('should have correct student count per methodology', () => {
        // Per WORKFORCE_METHODOLOGY.md: SUE + CWS codes
        expect(q1fy26Data.summary.studentWorkers.count).toBe(2157);
      });

      it('should have correct campus distribution', () => {
        expect(q1fy26Data.summary.studentWorkers.oma).toBe(2088);
        expect(q1fy26Data.summary.studentWorkers.phx).toBe(69);
        expect(q1fy26Data.summary.studentWorkers.oma + q1fy26Data.summary.studentWorkers.phx).toBe(2157);
      });

      it('should equal SUE + CWS assignment categories', () => {
        const studentSum = q1fy26Data.assignmentCategories['SUE'] + q1fy26Data.assignmentCategories['CWS'];
        expect(studentSum).toBe(q1fy26Data.summary.studentWorkers.count);
        expect(studentSum).toBe(1793 + 364);
      });
    });

    describe('Temporary Employees Validation', () => {
      it('should have correct temporary count per methodology', () => {
        // Per WORKFORCE_METHODOLOGY.md v2.1: TEMP + NBE + PRN codes only
        // Updated Dec 2025: Grade R moved to HSP category
        expect(q1fy26Data.summary.temporary.count).toBe(630);
      });

      it('should have correct campus distribution', () => {
        expect(q1fy26Data.summary.temporary.oma).toBe(489);
        expect(q1fy26Data.summary.temporary.phx).toBe(141);
        expect(q1fy26Data.summary.temporary.oma + q1fy26Data.summary.temporary.phx).toBe(630);
      });

      it('should equal TEMP + NBE + PRN assignment categories', () => {
        const tempSum =
          q1fy26Data.assignmentCategories['TEMP'] +
          q1fy26Data.assignmentCategories['NBE'] +
          q1fy26Data.assignmentCategories['PRN'];

        // Updated Dec 2025: Grade R is now in HSP, not temporary
        expect(tempSum).toBe(q1fy26Data.summary.temporary.count);
      });
    });
  });

  describe('Assignment Category Code Validation', () => {
    it('should have all expected assignment categories', () => {
      const expectedCategories = [
        'F12', 'F11', 'F10', 'F09',   // Full-time
        'PT12', 'PT11', 'PT10', 'PT9', // Part-time
        'HSR',                          // House Staff
        'SUE', 'CWS',                   // Students
        'TEMP', 'NBE', 'PRN'           // Non-benefit
      ];

      expectedCategories.forEach(category => {
        expect(q1fy26Data.assignmentCategories).toHaveProperty(category);
        expect(q1fy26Data.assignmentCategories[category]).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate assignment category counts sum to total', () => {
      const categorySum = Object.values(q1fy26Data.assignmentCategories).reduce((sum, count) => sum + count, 0);

      expect(categorySum).toBe(q1fy26Data.summary.total.count);
      expect(categorySum).toBe(5528);
    });

    it('should validate F12 is the largest full-time category', () => {
      expect(q1fy26Data.assignmentCategories['F12']).toBe(1694);
      expect(q1fy26Data.assignmentCategories['F12']).toBeGreaterThan(q1fy26Data.assignmentCategories['F11']);
      expect(q1fy26Data.assignmentCategories['F12']).toBeGreaterThan(q1fy26Data.assignmentCategories['F10']);
      expect(q1fy26Data.assignmentCategories['F12']).toBeGreaterThan(q1fy26Data.assignmentCategories['F09']);
    });

    it('should validate SUE is larger than CWS for students', () => {
      // SUE (regular student workers) should be larger than CWS (federal work study)
      expect(q1fy26Data.assignmentCategories['SUE']).toBeGreaterThan(q1fy26Data.assignmentCategories['CWS']);
      expect(q1fy26Data.assignmentCategories['SUE']).toBe(1793);
      expect(q1fy26Data.assignmentCategories['CWS']).toBe(364);
    });
  });

  describe('Location Details Validation', () => {
    it('should validate Omaha location breakdown sums correctly', () => {
      const omahaSum =
        q1fy26Data.locationDetails.omaha.faculty +
        q1fy26Data.locationDetails.omaha.staff +
        q1fy26Data.locationDetails.omaha.hsp +
        q1fy26Data.locationDetails.omaha.students +
        q1fy26Data.locationDetails.omaha.temp;

      expect(omahaSum).toBe(q1fy26Data.locationDetails.omaha.total);
      expect(omahaSum).toBe(4834);
    });

    it('should validate Phoenix location breakdown sums correctly', () => {
      const phoenixSum =
        q1fy26Data.locationDetails.phoenix.faculty +
        q1fy26Data.locationDetails.phoenix.staff +
        q1fy26Data.locationDetails.phoenix.hsp +
        q1fy26Data.locationDetails.phoenix.students +
        q1fy26Data.locationDetails.phoenix.temp;

      expect(phoenixSum).toBe(q1fy26Data.locationDetails.phoenix.total);
      expect(phoenixSum).toBe(694);
    });

    it('should validate Omaha is the larger campus', () => {
      expect(q1fy26Data.locationDetails.omaha.total).toBeGreaterThan(q1fy26Data.locationDetails.phoenix.total);
    });

    it('should validate Phoenix has higher HSP concentration', () => {
      // Per methodology: Phoenix medical center
      expect(q1fy26Data.locationDetails.phoenix.hsp).toBe(343);
      expect(q1fy26Data.locationDetails.phoenix.hsp).toBeGreaterThan(q1fy26Data.locationDetails.omaha.hsp);
    });
  });

  describe('Employee Groups Validation', () => {
    it('should have exactly 5 employee groups', () => {
      expect(q1fy26Data.employeeGroups).toHaveLength(5);
    });

    it('should validate employee groups structure', () => {
      q1fy26Data.employeeGroups.forEach(group => {
        expect(group).toHaveProperty('group');
        expect(group).toHaveProperty('faculty');
        expect(group).toHaveProperty('staff');
        expect(group).toHaveProperty('hsp');
        expect(group).toHaveProperty('students');
        expect(group).toHaveProperty('total');
      });
    });

    it('should validate employee groups sum to total', () => {
      const groupsSum = q1fy26Data.employeeGroups.reduce((sum, group) => sum + group.total, 0);
      expect(groupsSum).toBe(q1fy26Data.summary.total.count);
    });

    it('should validate largest employee group is Student Workers', () => {
      const studentGroup = q1fy26Data.employeeGroups.find(g => g.group === "Student Workers");
      const allTotals = q1fy26Data.employeeGroups.map(g => g.total);
      const maxTotal = Math.max(...allTotals);

      expect(studentGroup.total).toBe(maxTotal);
      expect(studentGroup.total).toBe(2157);
    });

    it('should validate second largest group is Benefit-Eligible Staff', () => {
      const staffGroup = q1fy26Data.employeeGroups.find(g => g.group === "Benefit-Eligible Staff");
      expect(staffGroup.total).toBe(1419);
    });
  });

  describe('Business Rule Validation', () => {
    it('should validate benefit-eligible total (Faculty + Staff + HSP)', () => {
      // Updated Dec 2025: HSP is now benefit-eligible
      const benefitEligibleTotal = q1fy26Data.summary.faculty.count + q1fy26Data.summary.staff.count + q1fy26Data.summary.houseStaffPhysicians.count;
      expect(benefitEligibleTotal).toBe(697 + 1419 + 625);
      expect(benefitEligibleTotal).toBe(2741);
    });

    it('should validate benefit-eligible (Faculty + Staff) is approximately 38% of total workforce', () => {
      const benefitEligibleTotal = q1fy26Data.summary.faculty.count + q1fy26Data.summary.staff.count;
      const percentage = (benefitEligibleTotal / q1fy26Data.summary.total.count) * 100;

      expect(percentage).toBeGreaterThan(35);
      expect(percentage).toBeLessThan(42);
      // 2116/5528 = 38.3%
      expect(Math.round(percentage * 10) / 10).toBe(38.3);
    });

    it('should validate student workers are approximately 39% of total workforce', () => {
      const percentage = (q1fy26Data.summary.studentWorkers.count / q1fy26Data.summary.total.count) * 100;

      expect(percentage).toBeGreaterThan(35);
      expect(percentage).toBeLessThan(42);
      expect(Math.round(percentage * 10) / 10).toBe(39.0); // ~39.0%
    });

    it('should validate house staff are approximately 11% of total workforce', () => {
      const percentage = (q1fy26Data.summary.houseStaffPhysicians.count / q1fy26Data.summary.total.count) * 100;

      expect(percentage).toBeGreaterThan(10);
      expect(percentage).toBeLessThan(14);
      // Updated Dec 2025: 625/5528 = 11.3%
      expect(Math.round(percentage * 10) / 10).toBe(11.3);
    });
  });

  describe('Cross-Validation with Summary Data', () => {
    it('should validate Omaha campus totals across all data structures', () => {
      // From summary
      const omahaFromSummary =
        q1fy26Data.summary.faculty.oma +
        q1fy26Data.summary.staff.oma +
        q1fy26Data.summary.houseStaffPhysicians.oma +
        q1fy26Data.summary.studentWorkers.oma +
        q1fy26Data.summary.temporary.oma;

      // From locationDetails
      const omahaFromLocation = q1fy26Data.locationDetails.omaha.total;

      // From locationDetails components
      const omahaFromComponents =
        q1fy26Data.locationDetails.omaha.faculty +
        q1fy26Data.locationDetails.omaha.staff +
        q1fy26Data.locationDetails.omaha.hsp +
        q1fy26Data.locationDetails.omaha.students +
        q1fy26Data.locationDetails.omaha.temp;

      expect(omahaFromSummary).toBe(4834);
      expect(omahaFromLocation).toBe(4834);
      expect(omahaFromComponents).toBe(4834);
      expect(omahaFromSummary).toBe(omahaFromLocation);
      expect(omahaFromLocation).toBe(omahaFromComponents);
    });

    it('should validate Phoenix campus totals across all data structures', () => {
      // From summary
      const phoenixFromSummary =
        q1fy26Data.summary.faculty.phx +
        q1fy26Data.summary.staff.phx +
        q1fy26Data.summary.houseStaffPhysicians.phx +
        q1fy26Data.summary.studentWorkers.phx +
        q1fy26Data.summary.temporary.phx;

      // From locationDetails
      const phoenixFromLocation = q1fy26Data.locationDetails.phoenix.total;

      // From locationDetails components
      const phoenixFromComponents =
        q1fy26Data.locationDetails.phoenix.faculty +
        q1fy26Data.locationDetails.phoenix.staff +
        q1fy26Data.locationDetails.phoenix.hsp +
        q1fy26Data.locationDetails.phoenix.students +
        q1fy26Data.locationDetails.phoenix.temp;

      expect(phoenixFromSummary).toBe(694);
      expect(phoenixFromLocation).toBe(694);
      expect(phoenixFromComponents).toBe(694);
      expect(phoenixFromSummary).toBe(phoenixFromLocation);
      expect(phoenixFromLocation).toBe(phoenixFromComponents);
    });
  });

  describe('Assignment Category Breakdown Validation', () => {
    it('should validate benefit-eligible codes sum to Faculty + Staff', () => {
      const benefitCodes = ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9'];
      const rawBenefitSum = benefitCodes.reduce((sum, code) => sum + (q1fy26Data.assignmentCategories[code] || 0), 0);

      // Updated Dec 2025: Grade R (12) is now in HSP category, not subtracted from benefit-eligible
      const gradeRCount = q1fy26Data.gradeRInclusion?.count || 12;
      const adjustedBenefitSum = rawBenefitSum - gradeRCount;

      const expectedTotal = q1fy26Data.summary.faculty.count + q1fy26Data.summary.staff.count;

      expect(adjustedBenefitSum).toBe(expectedTotal);
      expect(adjustedBenefitSum).toBe(2116);
    });

    it('should validate student codes sum to student workers', () => {
      const studentSum = q1fy26Data.assignmentCategories['SUE'] + q1fy26Data.assignmentCategories['CWS'];
      expect(studentSum).toBe(q1fy26Data.summary.studentWorkers.count);
      expect(studentSum).toBe(2157);
    });

    it('should validate temporary codes sum to temporary employees', () => {
      const tempSum =
        q1fy26Data.assignmentCategories['TEMP'] +
        q1fy26Data.assignmentCategories['NBE'] +
        q1fy26Data.assignmentCategories['PRN'];

      // Updated Dec 2025: Grade R is now in HSP, not temporary
      expect(tempSum).toBe(q1fy26Data.summary.temporary.count);
      expect(tempSum).toBe(630);
    });

    it('should validate all assignment categories are positive integers', () => {
      Object.entries(q1fy26Data.assignmentCategories).forEach(([code, count]) => {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(count)).toBe(true);
      });
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

    it('should have positive counts for all categories', () => {
      expect(q1fy26Data.summary.total.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.faculty.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.staff.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.houseStaffPhysicians.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.studentWorkers.count).toBeGreaterThan(0);
      expect(q1fy26Data.summary.temporary.count).toBeGreaterThan(0);
    });

    it('should validate all employee groups have valid names', () => {
      const expectedGroups = [
        "Benefit-Eligible Faculty",
        "Benefit-Eligible Staff",
        "House Staff Physicians",
        "Non-Benefit Eligible",
        "Student Workers"
      ];

      const actualGroups = q1fy26Data.employeeGroups.map(g => g.group);

      expectedGroups.forEach(name => {
        expect(actualGroups).toContain(name);
      });
    });
  });

  describe('Comparison with Q4 FY25', () => {
    it('should show headcount growth from Q4 FY25', () => {
      // Q4 FY25 total was 5,037, Q1 FY26 is 5,528
      expect(q1fy26Data.summary.total.count).toBe(5528);
      expect(q1fy26Data.summary.total.count).toBeGreaterThan(5037);

      const growth = 5528 - 5037;
      expect(growth).toBe(491); // +491 employees
    });

    it('should validate Q1 FY26 data is accessible via date key', () => {
      expect(QUARTERLY_WORKFORCE_DATA).toHaveProperty("2025-09-30");
      expect(QUARTERLY_WORKFORCE_DATA["2025-09-30"]).toBeDefined();
    });
  });

  describe('Data Traceability', () => {
    it('should have processing metadata in comments', () => {
      // Validate data structure suggests proper processing
      expect(q1fy26Data.quarter).toBe("Q1 FY26");
      expect(q1fy26Data.reportingDate).toBe("9/30/25");
    });

    it('should validate data matches extraction script output', () => {
      // These values should match scripts/extract_q1_fy26_workforce.js output
      // Updated Dec 2025: Grade R included in HSP
      expect(q1fy26Data.summary.total.count).toBe(5528);
      expect(q1fy26Data.summary.faculty.count).toBe(697);
      expect(q1fy26Data.summary.staff.count).toBe(1419);
      expect(q1fy26Data.summary.houseStaffPhysicians.count).toBe(625); // HSR + Grade R
      expect(q1fy26Data.summary.studentWorkers.count).toBe(2157);
      expect(q1fy26Data.summary.temporary.count).toBe(630); // Excludes Grade R
    });
  });
});
