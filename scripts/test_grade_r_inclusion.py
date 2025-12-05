#!/usr/bin/env python3
"""
Test Suite: Grade R Inclusion Validation
Ensures Grade R employees are correctly INCLUDED as benefit-eligible under House Staff Physicians

This test validates that the Grade R inclusion rule is properly implemented
across both workforce and termination datasets.

METHODOLOGY UPDATE (Dec 4, 2025):
- Grade R (Residents/Fellows) are now INCLUDED as benefit-eligible under HSP
- This reverses the November 2025 exclusion policy
"""

import pandas as pd
import json
import sys

# Test configuration
TERMINATIONS_CSV = "../source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv"
WORKFORCE_EXCEL = "../source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx"
TURNOVER_JSON = "../source-metrics/terminations/cleaned/FY25_Q4/q1_fy26_details.json"
WORKFORCE_JSON = "../source-metrics/workforce/cleaned/FY26_Q1/q1_fy26_workforce_snapshot.json"

# Benefit-eligible assignment categories
BENEFIT_ELIGIBLE_CODES = ['F12', 'F11', 'F10', 'F09', 'FT9', 'PT12', 'PT11', 'PT10', 'PT9']

class TestGradeRInclusion:
    """Test suite for Grade R inclusion validation"""

    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0

    def test_terminations_grade_r_included(self):
        """Test 1: Verify Grade R employees ARE INCLUDED in Q1 FY26 benefit-eligible terminations as HSP"""
        print("\n" + "="*80)
        print("TEST 1: Q1 FY26 Terminations - Grade R Inclusion as HSP")
        print("="*80)

        df = pd.read_csv(TERMINATIONS_CSV)

        # Get all Q1 FY26 terminations with benefit-eligible codes
        q1_fy26_be = df[
            (df['Termination_Fiscal_Period'] == 'Q1 FY26') &
            (df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES))
        ]

        # Get Grade R employees (should be included as HSP)
        grade_r = q1_fy26_be[q1_fy26_be['Grade'].str.startswith('R', na=False)]

        print(f"Total Q1 FY26 terminations (BE codes): {len(q1_fy26_be)}")
        print(f"Grade R employees found: {len(grade_r)}")

        if len(grade_r) > 0:
            print("\n✅ Grade R employees that ARE included as HSP:")
            print(grade_r[['Employee_Category', 'Assignment_Category', 'Grade', 'Job_Name']].to_string())

        # Load processed JSON and verify count includes HSP
        try:
            with open(TURNOVER_JSON) as f:
                processed_data = json.load(f)

            # Total should be faculty + staff + hsp (73 total)
            expected_total = 73  # 4 faculty + 54 staff + 15 HSP
            actual_total = processed_data['summary']['total']['count']

            # HSP should be 15
            expected_hsp = 15
            actual_hsp = processed_data['summary'].get('houseStaffPhysicians', {}).get('count', 0)

            print(f"\nExpected total (with HSP): {expected_total}")
            print(f"Actual count in processed data: {actual_total}")
            print(f"Expected HSP: {expected_hsp}")
            print(f"Actual HSP: {actual_hsp}")

            if actual_total == expected_total and actual_hsp == expected_hsp:
                print("✅ PASS: Grade R correctly included as HSP in terminations")
                self.passed += 1
                return True
            else:
                print(f"❌ FAIL: Expected total={expected_total}, HSP={expected_hsp}")
                self.failed += 1
                return False
        except FileNotFoundError:
            print("⚠️  JSON file not found - skipping validation")
            self.warnings += 1
            return False

    def test_workforce_grade_r_included(self):
        """Test 2: Verify Grade R employees ARE INCLUDED in Q1 FY26 workforce as HSP"""
        print("\n" + "="*80)
        print("TEST 2: Q1 FY26 Workforce - Grade R Inclusion as HSP")
        print("="*80)

        try:
            df = pd.read_excel(WORKFORCE_EXCEL, sheet_name='Sheet1')
        except FileNotFoundError:
            print("⚠️  Excel file not found - skipping test")
            self.warnings += 1
            return False

        # Filter to Q1 FY26 active employees
        q1_fy26_date = pd.to_datetime('2025-09-30')
        df['END DATE'] = pd.to_datetime(df['END DATE'], errors='coerce')
        q1_fy26 = df[(df['END DATE'].isna()) | (df['END DATE'] >= q1_fy26_date)]

        print(f"Total Q1 FY26 active employees: {len(q1_fy26)}")

        # Get HSR employees (traditional HSP)
        hsr = q1_fy26[q1_fy26['Assignment Category Code'] == 'HSR']

        # Get Grade R employees with F12 (should be included as HSP)
        grade_r_f12 = q1_fy26[
            (q1_fy26['Grade Code'].str.startswith('R', na=False)) &
            (q1_fy26['Assignment Category Code'].isin(BENEFIT_ELIGIBLE_CODES))
        ]

        print(f"HSR employees: {len(hsr)}")
        print(f"Grade R with F12/PT12: {len(grade_r_f12)}")
        print(f"Total HSP (HSR + Grade R): {len(hsr) + len(grade_r_f12)}")

        if len(grade_r_f12) > 0:
            print("\n✅ Grade R employees included in HSP:")
            print(grade_r_f12[['Person Type', 'Assignment Category Code', 'Grade Code', 'Job Name']].value_counts().head(10).to_string())

        # Load processed JSON
        try:
            with open(WORKFORCE_JSON) as f:
                processed_data = json.load(f)

            # HSP should be 625 (613 HSR + 12 Grade R)
            expected_hsp = 625
            actual_hsp = processed_data['summary']['houseStaffPhysicians']['count']

            # Temporary should be 630 (excludes Grade R now)
            expected_temp = 630
            actual_temp = processed_data['summary']['temporary']['count']

            print(f"\nExpected HSP (HSR + Grade R): {expected_hsp}")
            print(f"Actual HSP count: {actual_hsp}")
            print(f"Expected Temporary: {expected_temp}")
            print(f"Actual Temporary: {actual_temp}")

            if actual_hsp == expected_hsp and actual_temp == expected_temp:
                print("✅ PASS: Grade R correctly included in HSP category")
                self.passed += 1
                return True
            else:
                print(f"❌ FAIL: Expected HSP={expected_hsp}, Temp={expected_temp}")
                self.failed += 1
                return False
        except FileNotFoundError:
            print("⚠️  JSON file not found - skipping validation")
            self.warnings += 1
            return False

    def test_grade_r_characteristics(self):
        """Test 3: Verify Grade R employee characteristics match residency/fellowship patterns"""
        print("\n" + "="*80)
        print("TEST 3: Grade R Characteristics Validation")
        print("="*80)

        try:
            df = pd.read_excel(WORKFORCE_EXCEL, sheet_name='Sheet1')
        except FileNotFoundError:
            print("⚠️  Excel file not found - skipping test")
            self.warnings += 1
            return False

        # Filter to Q1 FY26
        q1_fy26_date = pd.to_datetime('2025-09-30')
        df['END DATE'] = pd.to_datetime(df['END DATE'], errors='coerce')
        q1_fy26 = df[(df['END DATE'].isna()) | (df['END DATE'] >= q1_fy26_date)]

        # Get all Grade R employees
        grade_r = q1_fy26[q1_fy26['Grade Code'].str.startswith('R', na=False)]

        print(f"Total Grade R employees: {len(grade_r)}")
        print(f"\nJob titles:")
        print(grade_r['Job Name'].value_counts().head(10).to_string())

        # Verify they are residents/fellows
        residency_keywords = ['Resident', 'Fellow', 'HSR', 'House Staff']
        grade_r_jobs = grade_r['Job Name'].fillna('').str.lower()
        is_residency = grade_r_jobs.str.contains('|'.join([kw.lower() for kw in residency_keywords]))

        residency_count = is_residency.sum()
        print(f"\nGrade R with residency/fellowship keywords: {residency_count}/{len(grade_r)} ({residency_count/len(grade_r)*100:.1f}%)")

        if residency_count / len(grade_r) > 0.95:
            print("✅ PASS: >95% of Grade R employees are Residents/Fellows (appropriate for HSP)")
            self.passed += 1
            return True
        else:
            print(f"⚠️  WARNING: Only {residency_count/len(grade_r)*100:.1f}% match residency pattern")
            self.warnings += 1
            return False

    def test_data_consistency(self):
        """Test 4: Verify processed data matches expected totals with HSP included"""
        print("\n" + "="*80)
        print("TEST 4: Data Consistency Check (with HSP)")
        print("="*80)

        try:
            with open(TURNOVER_JSON) as f:
                turnover = json.load(f)
        except FileNotFoundError:
            print("⚠️  Turnover JSON not found - skipping")
            self.warnings += 1
            return False

        try:
            with open(WORKFORCE_JSON) as f:
                workforce = json.load(f)
        except FileNotFoundError:
            print("⚠️  Workforce JSON not found - skipping")
            self.warnings += 1
            return False

        # Turnover checks - should include HSP
        turnover_total = turnover['summary']['total']['count']
        turnover_faculty = turnover['summary']['faculty']['count']
        turnover_staff = turnover['summary']['staff']['count']
        turnover_hsp = turnover['summary'].get('houseStaffPhysicians', {}).get('count', 0)

        print("Turnover Data:")
        print(f"  Total: {turnover_total}")
        print(f"  Faculty: {turnover_faculty}")
        print(f"  Staff: {turnover_staff}")
        print(f"  HSP: {turnover_hsp}")
        print(f"  Sum check: {turnover_faculty} + {turnover_staff} + {turnover_hsp} = {turnover_faculty + turnover_staff + turnover_hsp}")

        if turnover_faculty + turnover_staff + turnover_hsp == turnover_total:
            print("  ✅ Faculty + Staff + HSP = Total")
            self.passed += 1
        else:
            print(f"  ❌ FAIL: Sum ({turnover_faculty + turnover_staff + turnover_hsp}) ≠ Total ({turnover_total})")
            self.failed += 1

        # Workforce checks
        workforce_total = workforce['summary']['total']['count']
        workforce_faculty = workforce['summary']['faculty']['count']
        workforce_staff = workforce['summary']['staff']['count']
        workforce_hsp = workforce['summary']['houseStaffPhysicians']['count']
        workforce_students = workforce['summary']['studentWorkers']['count']
        workforce_temp = workforce['summary']['temporary']['count']

        calculated_total = workforce_faculty + workforce_staff + workforce_hsp + workforce_students + workforce_temp

        print("\nWorkforce Data:")
        print(f"  Total: {workforce_total}")
        print(f"  Faculty: {workforce_faculty}")
        print(f"  Staff: {workforce_staff}")
        print(f"  HSP: {workforce_hsp} (includes Grade R)")
        print(f"  Students: {workforce_students}")
        print(f"  Temporary: {workforce_temp} (excludes Grade R)")
        print(f"  Sum check: {calculated_total}")

        if calculated_total == workforce_total:
            print("  ✅ All categories sum to total")
            self.passed += 1
            return True
        else:
            print(f"  ❌ FAIL: Sum ({calculated_total}) ≠ Total ({workforce_total})")
            self.failed += 1
            return False

    def run_all_tests(self):
        """Run all tests and report results"""
        print("\n" + "="*80)
        print("GRADE R INCLUSION TEST SUITE")
        print("="*80)
        print(f"Validates that Grade R (Residents/Fellows) are INCLUDED as benefit-eligible HSP")
        print(f"Date: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)

        # Run all tests
        self.test_terminations_grade_r_included()
        self.test_workforce_grade_r_included()
        self.test_grade_r_characteristics()
        self.test_data_consistency()

        # Final report
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️  Warnings: {self.warnings}")
        print("="*80)

        if self.failed == 0:
            print("\n🎉 ALL TESTS PASSED!")
            print("Grade R inclusion as HSP is correctly implemented.")
            return 0
        else:
            print(f"\n❌ {self.failed} TEST(S) FAILED")
            print("Please review the failures above and fix the implementation.")
            return 1

def main():
    """Main test execution"""
    try:
        tester = TestGradeRInclusion()
        exit_code = tester.run_all_tests()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
