#!/usr/bin/env python3
"""
Extract Q1 FY26 Ethnicity and Gender Demographics
Calculates ethnicity and gender distribution for Benefit-Eligible Faculty and Staff
"""

import pandas as pd
import json
from collections import defaultdict

# File paths
INPUT_EXCEL = "source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx"
OUTPUT_JSON = "source-metrics/workforce/cleaned/FY26_Q1/q1_fy26_ethnicity_demographics.json"

# Q1 FY26 snapshot date
Q1_FY26_DATE = "2025-09-30"

# Benefit-eligible assignment codes (from WORKFORCE_METHODOLOGY.md v2.0)
BENEFIT_ELIGIBLE_CODES = ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9']

print("=" * 60)
print("  Q1 FY26 Ethnicity & Gender Demographics Extractor")
print("=" * 60)
print()

# Load raw Excel data
print("Loading raw Excel data...")
df = pd.read_excel(INPUT_EXCEL)
print(f"✓ Loaded {len(df):,} total records")
print()

# Convert END DATE to string format for comparison
df['END DATE'] = pd.to_datetime(df['END DATE']).dt.strftime('%Y-%m-%d')

# Filter to Q1 FY26 snapshot
print(f"Filtering to Q1 FY26 snapshot ({Q1_FY26_DATE})...")
q1_fy26 = df[df['END DATE'] == Q1_FY26_DATE].copy()
print(f"✓ Found {len(q1_fy26):,} Q1 FY26 records")
print()

# Filter to benefit-eligible only
print("Filtering to benefit-eligible employees (Faculty and Staff)...")
benefit_eligible = q1_fy26[
    q1_fy26['Assignment Category Code'].isin(BENEFIT_ELIGIBLE_CODES)
].copy()
print(f"✓ Found {len(benefit_eligible):,} benefit-eligible employees")
print()

# Separate Faculty and Staff using Person Type (capitalize properly)
faculty = benefit_eligible[benefit_eligible['Person Type'] == 'Faculty'].copy()
staff = benefit_eligible[benefit_eligible['Person Type'] == 'Staff'].copy()

print(f"Faculty: {len(faculty):,}")
print(f"Staff: {len(staff):,}")
print()

# Extract ethnicity distributions
print("Calculating ethnicity distributions...")

def normalize_ethnicity(ethnicity_value):
    """Normalize ethnicity values to standard categories"""
    if pd.isna(ethnicity_value):
        return 'Not Disclosed'

    ethnicity_str = str(ethnicity_value).strip()

    # Normalize to standard categories
    if ethnicity_str.lower() in ['not disclosed', 'not_disclosed', '']:
        return 'Not Disclosed'
    elif 'white' in ethnicity_str.lower():
        return 'White'
    elif 'asian' in ethnicity_str.lower():
        return 'Asian'
    elif 'black' in ethnicity_str.lower() or 'african american' in ethnicity_str.lower():
        return 'Black or African American'
    elif 'hispanic' in ethnicity_str.lower() or 'latino' in ethnicity_str.lower():
        return 'Hispanic or Latino'
    elif 'two or more' in ethnicity_str.lower() or 'more than one' in ethnicity_str.lower():
        return 'Two or More Races'
    elif 'american indian' in ethnicity_str.lower() or 'alaska native' in ethnicity_str.lower():
        return 'American Indian or Alaska Native'
    elif 'hawaiian' in ethnicity_str.lower() or 'pacific islander' in ethnicity_str.lower():
        return 'Native Hawaiian or other Pacific Islander'
    else:
        return ethnicity_str

def get_ethnicity_distribution(df, category_name):
    """Calculate ethnicity distribution with counts and percentages"""
    # Normalize ethnicity values
    df_copy = df.copy()
    df_copy['Normalized Ethnicity'] = df_copy['Employee Ethnicity'].apply(normalize_ethnicity)

    ethnicity_counts = df_copy['Normalized Ethnicity'].value_counts().to_dict()
    total = len(df_copy)

    distribution = []
    for ethnicity, count in ethnicity_counts.items():
        percentage = (count / total) * 100 if total > 0 else 0
        distribution.append({
            'ethnicity': ethnicity,
            'count': int(count),
            'percentage': round(percentage, 1)
        })

    # Sort by count descending
    distribution.sort(key=lambda x: x['count'], reverse=True)

    return {
        'category': category_name,
        'total': int(total),
        'distribution': distribution
    }

def get_gender_distribution(df, category_name):
    """Calculate gender distribution with counts and percentages"""
    gender_counts = df['Gender'].value_counts().to_dict()
    total = len(df)

    distribution = []
    for gender, count in gender_counts.items():
        percentage = (count / total) * 100 if total > 0 else 0
        distribution.append({
            'gender': gender if pd.notna(gender) else 'Not Disclosed',
            'count': int(count),
            'percentage': round(percentage, 1)
        })

    # Sort by count descending
    distribution.sort(key=lambda x: x['count'], reverse=True)

    return {
        'category': category_name,
        'total': int(total),
        'distribution': distribution
    }

def get_age_gender_distribution(df, category_name):
    """Calculate age/gender distribution by age bands"""
    # Define age bands
    age_bands_order = ['20-30', '31-40', '41-50', '51-60', '61 Plus']

    # Create age band column
    def categorize_age(age):
        if pd.isna(age):
            return None
        age = int(age)
        if age <= 30:
            return '20-30'
        elif age <= 40:
            return '31-40'
        elif age <= 50:
            return '41-50'
        elif age <= 60:
            return '51-60'
        else:
            return '61 Plus'

    df_copy = df.copy()
    df_copy['Age Band Group'] = df_copy['Age'].apply(categorize_age)

    # Calculate distribution by age band and gender
    age_gender_data = []
    total_female = len(df_copy[df_copy['Gender'] == 'F'])
    total_male = len(df_copy[df_copy['Gender'] == 'M'])
    total = len(df_copy)

    for age_band in age_bands_order:
        band_data = df_copy[df_copy['Age Band Group'] == age_band]
        female_count = len(band_data[band_data['Gender'] == 'F'])
        male_count = len(band_data[band_data['Gender'] == 'M'])

        age_gender_data.append({
            'ageBand': age_band,
            'female': int(female_count),
            'male': int(male_count),
            'total': int(female_count + male_count)
        })

    return {
        'category': category_name,
        'total': int(total),
        'femaleTotal': int(total_female),
        'maleTotal': int(total_male),
        'femalePercentage': round((total_female / total) * 100, 1) if total > 0 else 0,
        'malePercentage': round((total_male / total) * 100, 1) if total > 0 else 0,
        'ageGenderBreakdown': age_gender_data
    }

# Calculate distributions
faculty_ethnicity = get_ethnicity_distribution(faculty, 'Benefit-Eligible Faculty')
staff_ethnicity = get_ethnicity_distribution(staff, 'Benefit-Eligible Staff')
faculty_gender = get_gender_distribution(faculty, 'Benefit-Eligible Faculty')
staff_gender = get_gender_distribution(staff, 'Benefit-Eligible Staff')
faculty_age_gender = get_age_gender_distribution(faculty, 'Benefit-Eligible Faculty')
staff_age_gender = get_age_gender_distribution(staff, 'Benefit-Eligible Staff')

# Display results
print("\nFaculty Ethnicity Distribution:")
print(f"  Total: {faculty_ethnicity['total']}")
for item in faculty_ethnicity['distribution']:
    print(f"    {item['ethnicity']}: {item['count']} ({item['percentage']}%)")

print("\nStaff Ethnicity Distribution:")
print(f"  Total: {staff_ethnicity['total']}")
for item in staff_ethnicity['distribution']:
    print(f"    {item['ethnicity']}: {item['count']} ({item['percentage']}%)")

print("\nFaculty Gender Distribution:")
print(f"  Total: {faculty_gender['total']}")
for item in faculty_gender['distribution']:
    print(f"    {item['gender']}: {item['count']} ({item['percentage']}%)")

print("\nStaff Gender Distribution:")
print(f"  Total: {staff_gender['total']}")
for item in staff_gender['distribution']:
    print(f"    {item['gender']}: {item['count']} ({item['percentage']}%)")

print("\nFaculty Age/Gender Distribution:")
print(f"  Total: {faculty_age_gender['total']}")
print(f"  Female: {faculty_age_gender['femaleTotal']} ({faculty_age_gender['femalePercentage']}%)")
print(f"  Male: {faculty_age_gender['maleTotal']} ({faculty_age_gender['malePercentage']}%)")
for item in faculty_age_gender['ageGenderBreakdown']:
    print(f"    {item['ageBand']}: Female={item['female']}, Male={item['male']}, Total={item['total']}")

print("\nStaff Age/Gender Distribution:")
print(f"  Total: {staff_age_gender['total']}")
print(f"  Female: {staff_age_gender['femaleTotal']} ({staff_age_gender['femalePercentage']}%)")
print(f"  Male: {staff_age_gender['maleTotal']} ({staff_age_gender['malePercentage']}%)")
for item in staff_age_gender['ageGenderBreakdown']:
    print(f"    {item['ageBand']}: Female={item['female']}, Male={item['male']}, Total={item['total']}")

# Prepare output data
output_data = {
    'reportingDate': '9/30/25',
    'quarter': 'Q1 FY26',
    'fiscalPeriod': 'July 2025 - September 2025',
    'ethnicity': {
        'faculty': faculty_ethnicity,
        'staff': staff_ethnicity
    },
    'gender': {
        'faculty': faculty_gender,
        'staff': staff_gender
    },
    'ageGender': {
        'faculty': faculty_age_gender,
        'staff': staff_age_gender
    }
}

# Save output
print(f"\nSaving demographics data to {OUTPUT_JSON}...")
with open(OUTPUT_JSON, 'w') as f:
    json.dump(output_data, f, indent=2)
print("✓ Saved successfully")

print()
print("=" * 60)
print("✓ Extraction Complete")
print("=" * 60)
print()
print("Next steps:")
print("  1. Review demographics data: q1_fy26_ethnicity_demographics.json")
print("  2. Add ethnicity data to QUARTERLY_WORKFORCE_DATA in staticData.js")
print("  3. Create pie chart components for ethnicity visualization")
print()
