#!/usr/bin/env python3
"""
Analyze Q1 FY26 Workforce for Grade R Employees
Identifies all Grade R employees and their benefit eligibility status
"""

import pandas as pd
import sys
from collections import Counter

# File paths
EXCEL_FILE = "../source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx"

# Benefit-eligible assignment categories (before Grade R exclusion)
BENEFIT_ELIGIBLE_CATEGORIES = [
    'F12', 'F11', 'F10', 'F09',    # Full-time regular employees
    'PT12', 'PT11', 'PT10', 'PT9'  # Part-time regular employees
]

def load_workforce_data():
    """Load Q1 FY26 workforce data from Excel"""
    print(f"Loading workforce data from Excel...")

    # Read the Excel file
    df = pd.read_excel(EXCEL_FILE, sheet_name='Sheet1')

    print(f"Total rows in file (historical): {len(df)}")
    print(f"Columns: {list(df.columns)}")

    # Filter to Q1 FY26 only (active as of 9/30/2025)
    # Employees are active if END DATE is null or >= 9/30/2025
    q1_fy26_date = pd.to_datetime('2025-09-30')

    # Convert END DATE to datetime, handling NaT (not a time - i.e., still employed)
    df['END DATE'] = pd.to_datetime(df['END DATE'], errors='coerce')

    # Filter: END DATE is null (still employed) OR END DATE >= 9/30/2025
    q1_fy26_df = df[(df['END DATE'].isna()) | (df['END DATE'] >= q1_fy26_date)]

    print(f"\nFiltered to Q1 FY26 (active as of 9/30/2025): {len(q1_fy26_df)} employees")

    return q1_fy26_df

def analyze_grade_r(df):
    """Find and analyze all Grade R employees"""

    # Filter to Grade R employees
    grade_r = df[df['Grade Code'].str.startswith('R', na=False)]

    print(f"\n{'='*80}")
    print(f"GRADE R ANALYSIS - Q1 FY26 Workforce")
    print(f"{'='*80}\n")

    print(f"Total Grade R employees: {len(grade_r)}\n")

    # Breakdown by Person Type
    print("=" * 80)
    print("By Person Type:")
    print("=" * 80)
    person_type_counts = Counter(grade_r['Person Type'])
    for person_type, count in person_type_counts.most_common():
        print(f"  {person_type}: {count}")

    # Breakdown by Assignment Category
    print("\n" + "=" * 80)
    print("By Assignment Category:")
    print("=" * 80)
    assignment_counts = Counter(grade_r['Assignment Category Code'])
    for assignment, count in assignment_counts.most_common():
        is_benefit = "⚠️ BENEFIT-ELIGIBLE" if assignment in BENEFIT_ELIGIBLE_CATEGORIES else "✅ Non-Benefit"
        print(f"  {assignment}: {count} {is_benefit}")

    # Check for benefit-eligible Grade R employees
    print("\n" + "=" * 80)
    print("🔴 CRITICAL: Grade R with Benefit-Eligible Assignment Categories")
    print("=" * 80)

    benefit_eligible_r = grade_r[grade_r['Assignment Category Code'].isin(BENEFIT_ELIGIBLE_CATEGORIES)]

    if len(benefit_eligible_r) > 0:
        print(f"\n⚠️  FOUND {len(benefit_eligible_r)} Grade R employees incorrectly counted as benefit-eligible!\n")

        # Show breakdown
        for assignment in BENEFIT_ELIGIBLE_CATEGORIES:
            count = len(benefit_eligible_r[benefit_eligible_r['Assignment Category Code'] == assignment])
            if count > 0:
                print(f"  {assignment}: {count}")

        # Show job titles
        print("\n" + "=" * 80)
        print("Job Titles of Benefit-Eligible Grade R Employees:")
        print("=" * 80)
        job_titles = Counter(benefit_eligible_r['Job Name'])
        for job, count in job_titles.most_common():
            print(f"  {job}: {count}")

        # Show detailed list
        print("\n" + "=" * 80)
        print("Detailed List (First 20):")
        print("=" * 80)
        columns_to_show = ['Name', 'First Name', 'Job Name', 'Person Type', 'Assignment Category Code', 'Grade Code', 'Hourly/Salaried']
        available_cols = [col for col in columns_to_show if col in benefit_eligible_r.columns]

        for idx, row in benefit_eligible_r.head(20).iterrows():
            print(f"\n  Employee:")
            for col in available_cols:
                print(f"    {col}: {row[col]}")
    else:
        print("\n✅ GOOD NEWS: No Grade R employees found in benefit-eligible categories!")

    # Summary statistics
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total Grade R: {len(grade_r)}")
    print(f"Grade R with Benefit-Eligible Assignment: {len(benefit_eligible_r)}")
    print(f"Grade R with Non-Benefit Assignment: {len(grade_r) - len(benefit_eligible_r)}")

    return grade_r, benefit_eligible_r

def main():
    """Main execution"""
    try:
        # Load data
        df = load_workforce_data()

        # Analyze Grade R
        grade_r, benefit_eligible_r = analyze_grade_r(df)

        # Save to CSV for review
        output_file = "../source-metrics/workforce/raw/FY26_Q1/grade_r_analysis.csv"
        grade_r.to_csv(output_file, index=False)
        print(f"\n✅ Full Grade R data saved to: {output_file}")

        if len(benefit_eligible_r) > 0:
            be_output = "../source-metrics/workforce/raw/FY26_Q1/grade_r_benefit_eligible.csv"
            benefit_eligible_r.to_csv(be_output, index=False)
            print(f"⚠️  Benefit-eligible Grade R data saved to: {be_output}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
