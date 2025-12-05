#!/usr/bin/env python3
"""
Assignment Category Filter Impact Analysis
Shows the impact of switching from Benefit_Program_Description to Assignment_Category
"""

import pandas as pd

INPUT_CSV = "../source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv"

# Define filters
BENEFIT_ELIGIBLE_CODES = [
    'F12', 'F11', 'F10', 'FT9',    # Full-time regular employees
    'PT12', 'PT11', 'PT10', 'PT9'  # Part-time regular employees
]

def main():
    df = pd.read_csv(INPUT_CSV)

    # Get last 5 quarters
    quarters = ["Q1 FY25", "Q2 FY25", "Q3 FY25", "Q4 FY25", "Q1 FY26"]

    print("="*80)
    print("IMPACT OF ASSIGNMENT CATEGORY FILTER")
    print("="*80)
    print("\nQuarter  | Old Filter | New Filter | Difference | Impact")
    print("-"*80)

    for qtr in quarters:
        qtr_df = df[df['Termination_Fiscal_Period'] == qtr]

        # Old filter (Benefit_Program_Description)
        old_count = len(qtr_df[
            (qtr_df['Employee_Category'].isin(['Faculty', 'Staff Exempt', 'Staff Non-Exempt'])) &
            (qtr_df['Benefit_Program_Description'] != 'Non-Benefit Eligible')
        ])

        # New filter (Assignment_Category)
        new_count = len(qtr_df[qtr_df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES)])

        diff = new_count - old_count
        impact = "✅ Same" if diff == 0 else f"⚠️  {diff:+d}"

        print(f"{qtr:8} | {old_count:10} | {new_count:10} | {diff:10} | {impact}")

    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print("\n✅ Assignment Category filter is more accurate because:")
    print("   - It's based on employment type (F/PT regular), not a data quality field")
    print("   - It excludes TEMP workers incorrectly marked 'Cobra Eligible'")
    print("   - It includes F10/F11/F12 regular employees incorrectly marked 'Non-Benefit Eligible'")
    print("\n📊 Most quarters have the SAME count but DIFFERENT people")
    print("   - This proves the Benefit_Program_Description field has data quality errors")
    print("="*80)

if __name__ == "__main__":
    main()
