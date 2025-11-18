#!/usr/bin/env python3
"""
Aggregate Quarterly Turnover Data
Transforms termination CSV data into quarterly trends for dashboard visualization

Input: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
Output: JSON data for staticData.js

Creates two datasets:
1. Overall turnover by quarter (Faculty, Staff Exempt, Staff Non-Exempt)
2. Early turnover (<1 year tenure) by quarter

Last 16 quarters: Q2 FY22 → Q1 FY26
"""

import pandas as pd
import json
from datetime import datetime
from collections import defaultdict

# File paths
INPUT_CSV = "../source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv"
OUTPUT_JSON = "../source-metrics/terminations/cleaned/FY25_Q4/quarterly_turnover_trends.json"

# Fiscal quarters to include (last 16 quarters)
QUARTERS = [
    "Q2 FY22", "Q3 FY22", "Q4 FY22",
    "Q1 FY23", "Q2 FY23", "Q3 FY23", "Q4 FY23",
    "Q1 FY24", "Q2 FY24", "Q3 FY24", "Q4 FY24",
    "Q1 FY25", "Q2 FY25", "Q3 FY25", "Q4 FY25",
    "Q1 FY26"
]

def load_termination_data():
    """Load and prepare termination data"""
    print(f"Loading termination data from: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV)
    print(f"Loaded {len(df)} total termination records")
    return df

def filter_benefit_eligible(df):
    """Filter to benefit-eligible employees only (F/PT regular employees)"""
    # IMPORTANT: Use Assignment Category as single source of truth
    # Reference: TERMINATION_METHODOLOGY.md Section 4 (Benefit Eligibility)
    # NOTE: Jesuits ARE INCLUDED - their assignment category determines eligibility, not benefit program
    BENEFIT_ELIGIBLE_CODES = [
        'F12', 'F11', 'F10', 'FT9',    # Full-time regular employees
        'PT12', 'PT11', 'PT10', 'PT9'  # Part-time regular employees
    ]

    benefit_eligible = df[
        df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES)
    ].copy()

    print(f"\nBenefit-Eligible Terminations: {len(benefit_eligible)}")
    print(benefit_eligible['Employee_Category'].value_counts())

    return benefit_eligible

def aggregate_quarterly_data(df):
    """Aggregate terminations by quarter and employee category"""

    # Overall turnover by quarter
    overall = defaultdict(lambda: {'Faculty': 0, 'Staff Exempt': 0, 'Staff Non-Exempt': 0})

    # Early turnover (<1 year) by quarter
    early = defaultdict(lambda: {'Faculty': 0, 'Staff Exempt': 0, 'Staff Non-Exempt': 0})

    for _, row in df.iterrows():
        quarter = row['Termination_Fiscal_Period']
        category = row['Employee_Category']
        tenure_band = row['Tenure_Band']

        if quarter in QUARTERS:
            # Count overall turnover
            overall[quarter][category] += 1

            # Count early turnover (<1 year)
            if tenure_band == '<1 Year':
                early[quarter][category] += 1

    return overall, early

def format_for_dashboard(overall, early):
    """Format data for dashboard consumption"""

    # Overall turnover trends
    overall_trends = []
    for quarter in QUARTERS:
        data = overall[quarter]
        overall_trends.append({
            'quarter': quarter,
            'faculty': data['Faculty'],
            'staffExempt': data['Staff Exempt'],
            'staffNonExempt': data['Staff Non-Exempt'],
            'total': data['Faculty'] + data['Staff Exempt'] + data['Staff Non-Exempt']
        })

    # Early turnover trends
    early_trends = []
    for quarter in QUARTERS:
        data = early[quarter]
        early_trends.append({
            'quarter': quarter,
            'faculty': data['Faculty'],
            'staffExempt': data['Staff Exempt'],
            'staffNonExempt': data['Staff Non-Exempt'],
            'total': data['Faculty'] + data['Staff Exempt'] + data['Staff Non-Exempt']
        })

    return {
        'metadata': {
            'generated': datetime.now().isoformat(),
            'quarters': len(QUARTERS),
            'startQuarter': QUARTERS[0],
            'endQuarter': QUARTERS[-1],
            'categories': ['Faculty', 'Staff Exempt', 'Staff Non-Exempt']
        },
        'overallTurnover': overall_trends,
        'earlyTurnover': early_trends
    }

def print_summary(data):
    """Print summary statistics"""
    print("\n" + "="*80)
    print("QUARTERLY TURNOVER TRENDS SUMMARY")
    print("="*80)

    print(f"\nTime Period: {data['metadata']['startQuarter']} → {data['metadata']['endQuarter']}")
    print(f"Total Quarters: {data['metadata']['quarters']}")

    # Overall turnover summary
    print("\n--- OVERALL TURNOVER (Last 16 Quarters) ---")
    total_faculty = sum(q['faculty'] for q in data['overallTurnover'])
    total_staff_exempt = sum(q['staffExempt'] for q in data['overallTurnover'])
    total_staff_non_exempt = sum(q['staffNonExempt'] for q in data['overallTurnover'])

    print(f"Faculty: {total_faculty}")
    print(f"Staff Exempt: {total_staff_exempt}")
    print(f"Staff Non-Exempt: {total_staff_non_exempt}")
    print(f"TOTAL: {total_faculty + total_staff_exempt + total_staff_non_exempt}")

    # Early turnover summary
    print("\n--- EARLY TURNOVER (<1 Year, Last 16 Quarters) ---")
    early_faculty = sum(q['faculty'] for q in data['earlyTurnover'])
    early_staff_exempt = sum(q['staffExempt'] for q in data['earlyTurnover'])
    early_staff_non_exempt = sum(q['staffNonExempt'] for q in data['earlyTurnover'])

    print(f"Faculty: {early_faculty}")
    print(f"Staff Exempt: {early_staff_exempt}")
    print(f"Staff Non-Exempt: {early_staff_non_exempt}")
    print(f"TOTAL: {early_faculty + early_staff_exempt + early_staff_non_exempt}")

    # Sample quarters
    print("\n--- SAMPLE QUARTERS (First 3) ---")
    for i in range(min(3, len(data['overallTurnover']))):
        q = data['overallTurnover'][i]
        print(f"\n{q['quarter']}:")
        print(f"  Overall: Faculty={q['faculty']}, Staff Exempt={q['staffExempt']}, Staff Non-Exempt={q['staffNonExempt']}, Total={q['total']}")
        e = data['earlyTurnover'][i]
        print(f"  Early:   Faculty={e['faculty']}, Staff Exempt={e['staffExempt']}, Staff Non-Exempt={e['staffNonExempt']}, Total={e['total']}")

def main():
    """Main execution"""
    print("="*80)
    print("QUARTERLY TURNOVER AGGREGATION SCRIPT")
    print("="*80)

    # Load data
    df = load_termination_data()

    # Filter to benefit-eligible
    df_be = filter_benefit_eligible(df)

    # Aggregate by quarter
    print(f"\nAggregating data for {len(QUARTERS)} quarters...")
    overall, early = aggregate_quarterly_data(df_be)

    # Format for dashboard
    output_data = format_for_dashboard(overall, early)

    # Print summary
    print_summary(output_data)

    # Save to JSON
    print(f"\n{'='*80}")
    print(f"Saving output to: {OUTPUT_JSON}")
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2)

    print("✅ SUCCESS: Quarterly turnover data aggregated and saved!")
    print(f"\nNext steps:")
    print(f"1. Review the output file: {OUTPUT_JSON}")
    print(f"2. Copy the 'overallTurnover' and 'earlyTurnover' arrays to src/data/staticData.js")
    print(f"3. Create dashboard component to visualize the trends")
    print("="*80)

if __name__ == "__main__":
    main()
