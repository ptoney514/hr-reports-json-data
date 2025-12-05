#!/usr/bin/env python3
"""
Extract Q1 FY26 Detailed Turnover Data
Generates comprehensive quarterly turnover data for dashboard consumption
"""

import pandas as pd
import json
from datetime import datetime
from collections import defaultdict

# File paths
INPUT_CSV = "../source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv"
OUTPUT_JSON = "../source-metrics/terminations/cleaned/FY25_Q4/q1_fy26_details.json"

def load_data():
    """Load and filter Q1 FY26 termination data"""
    print("Loading termination data...")
    df = pd.read_csv(INPUT_CSV)

    # Filter to Q1 FY26 benefit-eligible only
    # IMPORTANT: Updated 2025-12-04 - Grade R now INCLUDED as HSP
    # Reference: TERMINATION_METHODOLOGY.md Section 4 (Benefit Eligibility)

    # Assignment Category Filter
    BENEFIT_ELIGIBLE_CODES = [
        'F12', 'F11', 'F10', 'FT9',    # Full-time regular employees
        'PT12', 'PT11', 'PT10', 'PT9'  # Part-time regular employees
    ]

    # Get all benefit-eligible terminations (including Grade R as HSP)
    q1_fy26 = df[
        (df['Termination_Fiscal_Period'] == 'Q1 FY26') &
        (df['Assignment_Category'].isin(BENEFIT_ELIGIBLE_CODES))
    ].copy()

    print(f"Q1 FY26 Benefit-Eligible Terminations: {len(q1_fy26)}")
    print(f"Employee Category Breakdown:")
    print(q1_fy26['Employee_Category'].value_counts())

    # Show Grade R employees included as HSP
    grade_r_included = q1_fy26[q1_fy26['Grade'].str.startswith('R', na=False)]
    if len(grade_r_included) > 0:
        print(f"\n✅ Included {len(grade_r_included)} Grade R employees as House Staff Physicians")
        print(grade_r_included['Job_Name'].value_counts())

    return q1_fy26

def calculate_age_from_dob(dob_str, term_date_str):
    """Calculate age at termination"""
    try:
        dob = pd.to_datetime(dob_str)
        term_date = pd.to_datetime(term_date_str)
        age = (term_date - dob).days // 365
        return age
    except:
        return None

def categorize_age(age):
    """Categorize age into groups"""
    if age is None or pd.isna(age):
        return "Unknown"
    if age < 25:
        return "<25"
    elif age < 35:
        return "25-34"
    elif age < 45:
        return "35-44"
    elif age < 55:
        return "45-54"
    elif age < 65:
        return "55-64"
    else:
        return "65+"

def map_tenure_band(tenure_band):
    """Map tenure band to standardized format"""
    mapping = {
        '<1 Year': '<1 Year',
        '1-3 Years': '1-3 Years',
        '3-5 Years': '3-5 Years',
        '5-10 Years': '5-10 Years',
        '10+ Years': '10-15 Years'  # Will need to separate 10-15, 15-20, 20+ from tenure value
    }
    return mapping.get(tenure_band, tenure_band)

def categorize_tenure_detailed(tenure_years):
    """Categorize tenure into detailed bands"""
    if pd.isna(tenure_years):
        return "Unknown"
    if tenure_years < 1:
        return "<1 Year"
    elif tenure_years < 3:
        return "1-3 Years"
    elif tenure_years < 5:
        return "3-5 Years"
    elif tenure_years < 10:
        return "5-10 Years"
    elif tenure_years < 15:
        return "10-15 Years"
    elif tenure_years < 20:
        return "15-20 Years"
    else:
        return "20+ Years"

def extract_summary_metrics(df):
    """Extract summary metrics"""
    total = len(df)

    # By employee category
    faculty = len(df[df['Employee_Category'] == 'Faculty'])
    staff_exempt = len(df[df['Employee_Category'] == 'Staff Exempt'])
    staff_non_exempt = len(df[df['Employee_Category'] == 'Staff Non-Exempt'])

    # By location
    oma = len(df[df['Campus'] == 'OMA'])
    phx = len(df[df['Campus'] == 'PHX'])

    return {
        'total': {
            'count': total,
            'oma': oma,
            'phx': phx
        },
        'faculty': {
            'count': faculty,
            'oma': len(df[(df['Employee_Category'] == 'Faculty') & (df['Campus'] == 'OMA')]),
            'phx': len(df[(df['Employee_Category'] == 'Faculty') & (df['Campus'] == 'PHX')])
        },
        'staffExempt': {
            'count': staff_exempt,
            'oma': len(df[(df['Employee_Category'] == 'Staff Exempt') & (df['Campus'] == 'OMA')]),
            'phx': len(df[(df['Employee_Category'] == 'Staff Exempt') & (df['Campus'] == 'PHX')])
        },
        'staffNonExempt': {
            'count': staff_non_exempt,
            'oma': len(df[(df['Employee_Category'] == 'Staff Non-Exempt') & (df['Campus'] == 'OMA')]),
            'phx': len(df[(df['Employee_Category'] == 'Staff Non-Exempt') & (df['Campus'] == 'PHX')])
        },
        'staff': {
            'count': staff_exempt + staff_non_exempt,
            'oma': len(df[(df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])) & (df['Campus'] == 'OMA')]),
            'phx': len(df[(df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])) & (df['Campus'] == 'PHX')])
        }
    }

def extract_termination_types(df):
    """Extract termination type breakdown by employee group"""

    # Define termination type mapping
    type_mapping = {
        'Voluntary': 'voluntary',
        'Involuntary': 'involuntary',
        'Retirement': 'retirement',
        'End of Assignment': 'endOfAssignment'
    }

    faculty_df = df[df['Employee_Category'] == 'Faculty']
    staff_df = df[df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])]

    faculty_breakdown = {
        'group': 'Benefit Eligible Faculty',
        'total': len(faculty_df),
        'voluntary': len(faculty_df[faculty_df['Termination_Type'] == 'Voluntary']),
        'involuntary': len(faculty_df[faculty_df['Termination_Type'] == 'Involuntary']),
        'retirement': len(faculty_df[faculty_df['Termination_Type'] == 'Retirement']),
        'endOfAssignment': len(faculty_df[faculty_df['Termination_Type'] == 'End of Assignment'])
    }

    staff_breakdown = {
        'group': 'Benefit Eligible Staff',
        'total': len(staff_df),
        'voluntary': len(staff_df[staff_df['Termination_Type'] == 'Voluntary']),
        'involuntary': len(staff_df[staff_df['Termination_Type'] == 'Involuntary']),
        'retirement': len(staff_df[staff_df['Termination_Type'] == 'Retirement']),
        'endOfAssignment': len(staff_df[staff_df['Termination_Type'] == 'End of Assignment'])
    }

    return [faculty_breakdown, staff_breakdown]

def extract_years_of_service(df):
    """Extract years of service breakdown"""
    # Add detailed tenure categorization
    df['Tenure_Detailed'] = df['Tenure'].apply(categorize_tenure_detailed)

    tenure_bands = ['<1 Year', '1-3 Years', '3-5 Years', '5-10 Years', '10-15 Years', '15-20 Years', '20+ Years']

    result = []
    for band in tenure_bands:
        band_df = df[df['Tenure_Detailed'] == band]
        faculty = len(band_df[band_df['Employee_Category'] == 'Faculty'])
        staff = len(band_df[band_df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])])

        result.append({
            'range': band,
            'faculty': faculty,
            'staff': staff
        })

    return result

def extract_age_groups(df):
    """Extract age group breakdown"""
    # Calculate age at termination
    df['Age_At_Term'] = df.apply(
        lambda row: calculate_age_from_dob(row['Person_Date_of_Birth'], row['Term_Date']),
        axis=1
    )
    df['Age_Group'] = df['Age_At_Term'].apply(categorize_age)

    age_bands = ['<25', '25-34', '35-44', '45-54', '55-64', '65+']

    result = []
    for band in age_bands:
        band_df = df[df['Age_Group'] == band]
        faculty = len(band_df[band_df['Employee_Category'] == 'Faculty'])
        staff = len(band_df[band_df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])])

        result.append({
            'range': band,
            'faculty': faculty,
            'staff': staff
        })

    return result

def extract_early_turnover(df):
    """Extract early turnover (<1 year) details"""
    early_df = df[df['Tenure'] < 1.0]

    # By termination type
    termination_types = []
    voluntary = len(early_df[early_df['Termination_Type'] == 'Voluntary'])
    involuntary = len(early_df[early_df['Termination_Type'] == 'Involuntary'])
    end_of_assignment = len(early_df[early_df['Termination_Type'] == 'End of Assignment'])
    retirement = len(early_df[early_df['Termination_Type'] == 'Retirement'])

    total = len(early_df)

    if voluntary > 0:
        termination_types.append({
            'name': 'Voluntary',
            'value': voluntary,
            'percentage': round((voluntary / total) * 100, 1) if total > 0 else 0,
            'color': '#3B82F6'
        })
    if end_of_assignment > 0:
        termination_types.append({
            'name': 'End of Assignment',
            'value': end_of_assignment,
            'percentage': round((end_of_assignment / total) * 100, 1) if total > 0 else 0,
            'color': '#F59E0B'
        })
    if involuntary > 0:
        termination_types.append({
            'name': 'Involuntary',
            'value': involuntary,
            'percentage': round((involuntary / total) * 100, 1) if total > 0 else 0,
            'color': '#EF4444'
        })
    if retirement > 0:
        termination_types.append({
            'name': 'Retirement',
            'value': retirement,
            'percentage': round((retirement / total) * 100, 1) if total > 0 else 0,
            'color': '#10B981'
        })

    # By employee category
    faculty_count = len(early_df[early_df['Employee_Category'] == 'Faculty'])
    staff_count = len(early_df[early_df['Employee_Category'].isin(['Staff Exempt', 'Staff Non-Exempt'])])

    category_breakdown = []
    if staff_count > 0:
        category_breakdown.append({
            'name': 'Staff',
            'value': staff_count,
            'percentage': round((staff_count / total) * 100, 1) if total > 0 else 0,
            'color': '#3B82F6'
        })
    if faculty_count > 0:
        category_breakdown.append({
            'name': 'Faculty',
            'value': faculty_count,
            'percentage': round((faculty_count / total) * 100, 1) if total > 0 else 0,
            'color': '#10B981'
        })

    return {
        'total': total,
        'byTerminationType': termination_types,
        'byEmployeeCategory': category_breakdown
    }

def main():
    """Main execution"""
    print("="*80)
    print("Q1 FY26 DETAILED DATA EXTRACTION")
    print("="*80 + "\n")

    # Load data
    df = load_data()

    # Extract all components
    print("\nExtracting summary metrics...")
    summary = extract_summary_metrics(df)

    print("Extracting termination type breakdown...")
    termination_types = extract_termination_types(df)

    print("Extracting years of service data...")
    years_of_service = extract_years_of_service(df)

    print("Extracting age group data...")
    age_groups = extract_age_groups(df)

    print("Extracting early turnover data...")
    early_turnover = extract_early_turnover(df)

    # Compile output
    output = {
        'reportingDate': '9/30/25',
        'quarter': 'Q1 FY26',
        'fiscalPeriod': 'July 2025 - September 2025',
        'summary': summary,
        'terminationTypesByGroup': termination_types,
        'yearsOfService': years_of_service,
        'ageGroups': age_groups,
        'earlyTurnover': early_turnover,
        'metadata': {
            'generated': datetime.now().isoformat(),
            'source': INPUT_CSV,
            'totalBenefitEligible': summary['total']['count']
        }
    }

    # Print summary
    print("\n" + "="*80)
    print("EXTRACTION SUMMARY")
    print("="*80)
    print(f"\nTotal Benefit-Eligible Terminations: {summary['total']['count']}")
    print(f"  Faculty: {summary['faculty']['count']}")
    print(f"  Staff Exempt: {summary['staffExempt']['count']}")
    print(f"  Staff Non-Exempt: {summary['staffNonExempt']['count']}")
    print(f"  Combined Staff: {summary['staff']['count']}")
    print(f"\nBy Campus:")
    print(f"  Omaha: {summary['total']['oma']}")
    print(f"  Phoenix: {summary['total']['phx']}")
    print(f"\nEarly Turnover (<1 Year): {early_turnover['total']}")

    # Save to JSON
    print(f"\nSaving to: {OUTPUT_JSON}")
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output, f, indent=2)

    print("\n✅ SUCCESS: Q1 FY26 detailed data extracted!")
    print("\nNext steps:")
    print("1. Review the output file")
    print("2. Add this data to src/data/staticData.js as QUARTERLY_TURNOVER_DATA['2025-09-30']")
    print("3. Update TurnoverQ1FY26Dashboard to load from staticData")
    print("="*80)

if __name__ == "__main__":
    main()
