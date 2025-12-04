#!/usr/bin/env python3
"""
Extract Q1 FY26 New Hire Data for Recruiting Dashboard
Generates comprehensive new hire data for benefit-eligible Faculty and Staff

Methodology Reference: NEW_HIRES_METHODOLOGY.md

Data Source: Oracle HCM export (New Emp List since FY20 to Q1FY25 1031 PT.xlsx)
Reporting Period: Q1 FY26 (July 1 - September 30, 2025)
Note: Current data available through August 31, 2025 only
"""

import pandas as pd
import json
from datetime import datetime
from pathlib import Path

# File paths
INPUT_XLSX = Path("../source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT.xlsx")
OUTPUT_DIR = Path("../source-metrics/recruiting/cleaned/FY26_Q1")
OUTPUT_JSON = OUTPUT_DIR / "q1_fy26_new_hires.json"

# Benefit-eligible assignment categories (per WORKFORCE_METHODOLOGY.md)
BENEFIT_ELIGIBLE_CODES = [
    'F12', 'F11', 'F10', 'F09',    # Faculty full-time regular
    'PT12', 'PT11', 'PT10', 'PT9'  # Staff part-time regular
]

# Q1 FY26 date range
Q1_FY26_START = pd.Timestamp('2025-07-01')
Q1_FY26_END = pd.Timestamp('2025-09-30')


def load_and_filter_data():
    """Load Excel data and filter for Q1 FY26 benefit-eligible new hires"""
    print("Loading workforce data from Excel...")
    df = pd.read_excel(INPUT_XLSX)
    print(f"Total rows in source: {len(df):,}")

    # Parse hire date
    df['Hire_Date'] = pd.to_datetime(df['Current Hire Date'], format='%m/%d/%Y', errors='coerce')

    # Parse snapshot date
    df['Snapshot_Date'] = pd.to_datetime(df['END DATE'])
    latest_snapshot = df['Snapshot_Date'].max()
    print(f"Latest snapshot date: {latest_snapshot.strftime('%Y-%m-%d')}")

    # Step 1: Filter for Q1 FY26 hire dates
    q1_hires = df[
        (df['Hire_Date'] >= Q1_FY26_START) &
        (df['Hire_Date'] <= Q1_FY26_END)
    ].copy()
    print(f"\nQ1 FY26 hires (all categories): {len(q1_hires):,}")

    # Step 2: Filter for benefit-eligible assignment categories
    be_hires = q1_hires[
        q1_hires['Assignment Category Code'].isin(BENEFIT_ELIGIBLE_CODES)
    ].copy()
    print(f"Benefit-eligible assignment categories: {len(be_hires):,}")

    # Step 3: Exclude Grade R (Residents/Fellows) - per WORKFORCE_METHODOLOGY.md
    grade_r_excluded = be_hires[be_hires['Grade Code'].str.startswith('R', na=False)]
    if len(grade_r_excluded) > 0:
        print(f"\n⚠️  Excluding {len(grade_r_excluded)} Grade R employees (Residents/Fellows)")
        print("   Job titles excluded:")
        for job in grade_r_excluded['Job Name'].unique():
            print(f"     - {job}")

    final_hires = be_hires[~be_hires['Grade Code'].str.startswith('R', na=False)].copy()

    # Step 4: Deduplicate by employee ID (keep first appearance)
    final_unique = final_hires.drop_duplicates(subset='Empl num', keep='first')
    print(f"\nFinal unique benefit-eligible new hires: {len(final_unique)}")

    return final_unique, latest_snapshot


def classify_employee_type(row):
    """Classify employee as Faculty or Staff based on Person Type and Assignment"""
    if row['Person Type'] == 'FACULTY':
        return 'Faculty'
    elif row['Person Type'] == 'STAFF':
        return 'Staff'
    # Fallback based on assignment category
    elif row['Assignment Category Code'] in ['F09', 'F10', 'F11']:
        return 'Faculty'  # These are typically faculty-only codes
    else:
        return 'Staff'  # Default to staff if unclear


def normalize_location(location):
    """Normalize location names to Omaha/Phoenix"""
    if pd.isna(location):
        return 'Unknown'
    location = str(location).strip()
    if 'Phoenix' in location or 'PHX' in location.upper():
        return 'Phoenix'
    elif 'Omaha' in location or location.startswith('HR '):
        return 'Omaha'
    else:
        return 'Omaha'  # Default to Omaha for unrecognized locations


def extract_summary_metrics(df):
    """Extract summary metrics for new hires"""
    # Add employee type classification
    df = df.copy()
    df['Employee_Type'] = df.apply(classify_employee_type, axis=1)
    df['Normalized_Location'] = df['Location'].apply(normalize_location)

    # Totals
    total = len(df)
    faculty_count = len(df[df['Employee_Type'] == 'Faculty'])
    staff_count = len(df[df['Employee_Type'] == 'Staff'])

    # By location
    omaha_count = len(df[df['Normalized_Location'] == 'Omaha'])
    phoenix_count = len(df[df['Normalized_Location'] == 'Phoenix'])

    return {
        'total': {
            'count': total,
            'oma': omaha_count,
            'phx': phoenix_count
        },
        'faculty': {
            'count': faculty_count,
            'oma': len(df[(df['Employee_Type'] == 'Faculty') & (df['Normalized_Location'] == 'Omaha')]),
            'phx': len(df[(df['Employee_Type'] == 'Faculty') & (df['Normalized_Location'] == 'Phoenix')])
        },
        'staff': {
            'count': staff_count,
            'oma': len(df[(df['Employee_Type'] == 'Staff') & (df['Normalized_Location'] == 'Omaha')]),
            'phx': len(df[(df['Employee_Type'] == 'Staff') & (df['Normalized_Location'] == 'Phoenix')])
        }
    }, df


def extract_by_school(df):
    """Extract new hires by school/organization"""
    school_summary = df.groupby('New School').agg({
        'Empl num': 'count',
        'Employee_Type': lambda x: (x == 'Faculty').sum()
    }).rename(columns={
        'Empl num': 'total',
        'Employee_Type': 'faculty'
    })
    school_summary['staff'] = school_summary['total'] - school_summary['faculty']

    # Sort by total and convert to list of dicts
    result = []
    for school, row in school_summary.sort_values('total', ascending=False).iterrows():
        if pd.notna(school):
            result.append({
                'school': school,
                'faculty': int(row['faculty']),
                'staff': int(row['staff']),
                'total': int(row['total'])
            })

    return result


def extract_by_department(df):
    """Extract new hires by department"""
    dept_summary = df.groupby('Organization Name').agg({
        'Empl num': 'count',
        'Employee_Type': lambda x: (x == 'Faculty').sum()
    }).rename(columns={
        'Empl num': 'total',
        'Employee_Type': 'faculty'
    })
    dept_summary['staff'] = dept_summary['total'] - dept_summary['faculty']

    # Sort by total and convert to list of dicts (top 15)
    result = []
    for dept, row in dept_summary.sort_values('total', ascending=False).head(15).iterrows():
        if pd.notna(dept):
            # Clean up department name (remove number prefix)
            dept_clean = ' '.join(str(dept).split()[1:]) if dept[0].isdigit() else dept
            result.append({
                'department': dept_clean,
                'faculty': int(row['faculty']),
                'staff': int(row['staff']),
                'total': int(row['total'])
            })

    return result


def extract_by_month(df):
    """Extract new hires by month"""
    df = df.copy()
    df['Hire_Month'] = df['Hire_Date'].dt.strftime('%B %Y')

    month_order = ['July 2025', 'August 2025', 'September 2025']
    month_summary = []

    for month in month_order:
        month_data = df[df['Hire_Month'] == month]
        if len(month_data) > 0:
            faculty = len(month_data[month_data['Employee_Type'] == 'Faculty'])
            staff = len(month_data[month_data['Employee_Type'] == 'Staff'])
            month_summary.append({
                'month': month,
                'faculty': faculty,
                'staff': staff,
                'total': faculty + staff
            })
        else:
            month_summary.append({
                'month': month,
                'faculty': 0,
                'staff': 0,
                'total': 0
            })

    return month_summary


def extract_demographics(df):
    """Extract demographic breakdown of new hires"""
    # Gender distribution
    gender_dist = df['Gender'].value_counts()
    female_count = gender_dist.get('F', 0)
    male_count = gender_dist.get('M', 0)
    total = len(df)

    # Ethnicity distribution
    ethnicity_dist = df['Employee Ethnicity'].value_counts()

    # Age band distribution
    age_dist = df['Age Band'].value_counts()

    return {
        'gender': {
            'female': int(female_count),
            'male': int(male_count),
            'femalePercentage': round((female_count / total) * 100, 1) if total > 0 else 0,
            'malePercentage': round((male_count / total) * 100, 1) if total > 0 else 0
        },
        'ethnicity': [
            {'category': str(eth), 'count': int(count), 'percentage': round((count / total) * 100, 1)}
            for eth, count in ethnicity_dist.items() if pd.notna(eth)
        ],
        'ageDistribution': [
            {'band': str(band), 'count': int(count), 'percentage': round((count / total) * 100, 1)}
            for band, count in age_dist.items() if pd.notna(band)
        ]
    }


def main():
    """Main execution"""
    print("=" * 80)
    print("Q1 FY26 NEW HIRE DATA EXTRACTION")
    print("=" * 80 + "\n")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load and filter data
    df, latest_snapshot = load_and_filter_data()

    # Extract all metrics
    print("\nExtracting metrics...")
    summary, df_enriched = extract_summary_metrics(df)
    by_school = extract_by_school(df_enriched)
    by_department = extract_by_department(df_enriched)
    by_month = extract_by_month(df_enriched)
    demographics = extract_demographics(df_enriched)

    # Compile output
    output = {
        'reportingDate': '9/30/25',
        'quarter': 'Q1 FY26',
        'fiscalPeriod': 'July 2025 - September 2025',
        'dataAsOf': latest_snapshot.strftime('%Y-%m-%d'),
        'note': 'Data available through August 2025. September hires pending next data refresh.',
        'summary': summary,
        'bySchool': by_school,
        'byDepartment': by_department,
        'byMonth': by_month,
        'demographics': demographics,
        'methodology': {
            'benefitEligibleCodes': BENEFIT_ELIGIBLE_CODES,
            'gradeRExcluded': True,
            'deduplicatedByEmployeeId': True
        },
        'metadata': {
            'generated': datetime.now().isoformat(),
            'source': str(INPUT_XLSX),
            'totalBenefitEligible': summary['total']['count']
        }
    }

    # Print summary
    print("\n" + "=" * 80)
    print("EXTRACTION SUMMARY - Q1 FY26 BENEFIT-ELIGIBLE NEW HIRES")
    print("=" * 80)
    print(f"\nTotal New Hires: {summary['total']['count']}")
    print(f"  Faculty: {summary['faculty']['count']}")
    print(f"  Staff: {summary['staff']['count']}")
    print(f"\nBy Campus:")
    print(f"  Omaha: {summary['total']['oma']}")
    print(f"  Phoenix: {summary['total']['phx']}")
    print(f"\nBy Month:")
    for m in by_month:
        print(f"  {m['month']}: {m['total']} ({m['faculty']} faculty, {m['staff']} staff)")
    print(f"\nTop 5 Schools/Organizations:")
    for s in by_school[:5]:
        print(f"  {s['school']}: {s['total']}")

    # Save to JSON
    print(f"\nSaving to: {OUTPUT_JSON}")
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)

    print("\n" + "=" * 80)
    print("✅ SUCCESS: Q1 FY26 new hire data extracted!")
    print("=" * 80)
    print("\nNext steps:")
    print("1. Review the output file for accuracy")
    print("2. Update src/data/staticData.js with new hire data")
    print("3. Create/update RecruitingQ1FY26Dashboard component")
    print("4. Document methodology in NEW_HIRES_METHODOLOGY.md")

    return output


if __name__ == "__main__":
    main()
