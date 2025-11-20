#!/usr/bin/env python3
"""
Test Suite: Grade R Exclusion Validation
Ensures Grade R employees are correctly excluded from benefit-eligible counts

This test validates that the Grade R exclusion rule is properly implemented
across both workforce and termination datasets.
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

class TestGradeRExclusion:
    """Test suite for Grade R exclusion validation"""

    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0

    def test_terminations_grade_r_excluded(self):
        """Test 1: Verify no Grade R employees in Q1 FY26 benefit-eligible terminations"""
        print("\n" + "="*80)
        print("TEST 1: Q1 FY26 Terminations - Grade R Exclusion")
        print("="*80)

        df = pd.read_csv(TERMINATIONS_CSV)

        # Get benefit-eligible Q1 FY26 terminations WITH Grade R (wrong way)
        wrong_way = df[
            (df['Termination_Fiscal_Period'] == 'Q1 FY26') &
            (df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES))
        ]

        # Get Grade R employees in that set
        grade_r_in_benefit = wrong_way[wrong_way['Grade'].str.startswith('R', na=False)]

        print(f"Total Q1 FY26 terminations (F12/PT12 only): {len(wrong_way)}")
        print(f"Grade R employees found: {len(grade_r_in_benefit)}")

        if len(grade_r_in_benefit) > 0:
            print("\n⚠️  Grade R employees that SHOULD BE excluded:")
            print(grade_r_in_benefit[['Employee_Category', 'Assignment_Category', 'Grade', 'Job_Name']].to_string())

        # Load processed JSON and verify count
        with open(TURNOVER_JSON) as f:
            processed_data = json.load(f)

        expected_count = len(wrong_way) - len(grade_r_in_benefit)
        actual_count = processed_data['summary']['total']['count']

        print(f"\nExpected benefit-eligible (excluding Grade R): {expected_count}")
        print(f"Actual count in processed data: {actual_count}")

        if actual_count == expected_count:
            print("✅ PASS: Grade R correctly excluded from terminations")
            self.passed += 1
            return True
        else:
            print(f"❌ FAIL: Expected {expected_count}, got {actual_count}")
            self.failed += 1
            return False

    def test_workforce_grade_r_excluded(self):
        """Test 2: Verify no Grade R employees in Q1 FY26 benefit-eligible workforce"""
        print("\n" + "="*80)
        print("TEST 2: Q1 FY26 Workforce - Grade R Exclusion")
        print("="*80)

        df = pd.read_excel(WORKFORCE_EXCEL, sheet_name='Sheet1')

        # Filter to Q1 FY26 active employees
        q1_fy26_date = pd.to_datetime('2025-09-30')
        df['END DATE'] = pd.to_datetime(df['END DATE'], errors='coerce')
        q1_fy26 = df[(df['END DATE'].isna()) | (df['END DATE'] >= q1_fy26_date)]

        print(f"Total Q1 FY26 active employees: {len(q1_fy26)}")

        # Get benefit-eligible WITH Grade R (wrong way)
        wrong_way = q1_fy26[
            q1_fy26['Assignment Category Code'].isin(BENEFIT_ELIGIBLE_CODES)
        ]

        # Get Grade R employees
        grade_r_in_benefit = wrong_way[wrong_way['Grade Code'].str.startswith('R', na=False)]

        print(f"Benefit-eligible pool (F12/PT12 only): {len(wrong_way)}")
        print(f"Grade R employees found: {len(grade_r_in_benefit)}")

        if len(grade_r_in_benefit) > 0:
            print("\n⚠️  Grade R employees that SHOULD BE excluded:")
            print(grade_r_in_benefit[['Person Type', 'Assignment Category Code', 'Grade Code', 'Job Name']].value_counts().head(10).to_string())

        # Load processed JSON
        with open(WORKFORCE_JSON) as f:
            processed_data = json.load(f)

        # Calculate expected (subtract Grade R from staff count)
        expected_staff = len(wrong_way[wrong_way['Person Type'].str.upper() == 'STAFF']) - len(grade_r_in_benefit[grade_r_in_benefit['Person Type'].str.upper() == 'STAFF'])
        actual_staff = processed_data['summary']['staff']['count']

        print(f"\nExpected benefit-eligible staff (excluding Grade R): {expected_staff}")
        print(f"Actual staff count in processed data: {actual_staff}")

        if actual_staff == expected_staff:
            print("✅ PASS: Grade R correctly excluded from workforce")
            self.passed += 1
            return True
        else:
            print(f"❌ FAIL: Expected {expected_staff}, got {actual_staff}")
            self.failed += 1
            return False

    def test_grade_r_characteristics(self):
        """Test 3: Verify Grade R employee characteristics match residency/fellowship patterns"""
        print("\n" + "="*80)
        print("TEST 3: Grade R Characteristics Validation")
        print("="*80)

        df = pd.read_excel(WORKFORCE_EXCEL, sheet_name='Sheet1')

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
            print("✅ PASS: >95% of Grade R employees are Residents/Fellows")
            self.passed += 1
            return True
        else:
            print(f"⚠️  WARNING: Only {residency_count/len(grade_r)*100:.1f}% match residency pattern")
            self.warnings += 1
            return False

    def test_data_consistency(self):
        """Test 4: Verify processed data matches expected totals"""
        print("\n" + "="*80)
        print("TEST 4: Data Consistency Check")
        print("="*80)

        with open(TURNOVER_JSON) as f:
            turnover = json.load(f)

        with open(WORKFORCE_JSON) as f:
            workforce = json.load(f)

        # Turnover checks
        turnover_total = turnover['summary']['total']['count']
        turnover_faculty = turnover['summary']['faculty']['count']
        turnover_staff = turnover['summary']['staff']['count']

        print("Turnover Data:")
        print(f"  Total: {turnover_total}")
        print(f"  Faculty: {turnover_faculty}")
        print(f"  Staff: {turnover_staff}")
        print(f"  Sum check: {turnover_faculty} + {turnover_staff} = {turnover_faculty + turnover_staff}")

        if turnover_faculty + turnover_staff == turnover_total:
            print("  ✅ Faculty + Staff = Total")
            self.passed += 1
        else:
            print(f"  ❌ FAIL: Faculty + Staff ({turnover_faculty + turnover_staff}) ≠ Total ({turnover_total})")
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
        print(f"  HSP: {workforce_hsp}")
        print(f"  Students: {workforce_students}")
        print(f"  Temporary: {workforce_temp}")
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
        print("GRADE R EXCLUSION TEST SUITE")
        print("="*80)
        print(f"Validates that Grade R (Residents/Fellows) are excluded from benefit-eligible")
        print(f"Date: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)

        # Run all tests
        self.test_terminations_grade_r_excluded()
        self.test_workforce_grade_r_excluded()
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
            print("Grade R exclusion is correctly implemented.")
            return 0
        else:
            print(f"\n❌ {self.failed} TEST(S) FAILED")
            print("Please review the failures above and fix the implementation.")
            return 1

def main():
    """Main test execution"""
    try:
        tester = TestGradeRExclusion()
        exit_code = tester.run_all_tests()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
