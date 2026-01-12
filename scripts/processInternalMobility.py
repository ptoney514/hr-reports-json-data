#!/usr/bin/env python3
"""
Process Internal Mobility Data for FY26 Q1
Calculates reason codes for promotions and transfers.
"""

import pandas as pd
import json
import re
from datetime import datetime
from pathlib import Path

# Configuration
FY26_Q1_START = '2025-07-01'
FY26_Q1_END = '2025-09-30'
BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F09', 'F10', 'F11']

# File paths
MOBILITY_FILE = '/Users/pernelltoney/Downloads/Promotions and Transfers 7_01_24 to 11_13_25.xlsx'
WORKFORCE_FILE = '/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data/source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx'
OUTPUT_FILE = '/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data/src/data/internalMobilityData.js'

# Career progression patterns for PROGRESSION detection
CAREER_PATTERNS = [
    (r'Assistant\s+Professor', r'Associate\s+Professor'),
    (r'Associate\s+Professor', r'(?:Full\s+)?Professor'),
    (r'Instructor', r'Assistant\s+Professor'),
    (r'Assistant\s+Director', r'(?:Associate\s+)?Director'),
    (r'Associate\s+Director', r'(?:Senior\s+)?Director'),
    (r'Director', r'Senior\s+Director'),
    (r'Senior\s+Director', r'(?:Vice\s+President|VP)'),
    (r'Coordinator', r'(?:Senior\s+)?Coordinator'),
    (r'Senior\s+Coordinator', r'Manager'),
    (r'Manager', r'(?:Senior\s+)?Manager'),
    (r'Senior\s+Manager', r'Director'),
    (r'Specialist', r'Senior\s+Specialist'),
    (r'Analyst', r'Senior\s+Analyst'),
    (r'Assistant\s+Dean', r'Associate\s+Dean'),
    (r'Associate\s+Dean', r'Dean'),
]

# Department number to School mapping
SCHOOL_MAPPING = {
    '5': 'Student Life',
    '4': 'Health Sciences',
    '6': 'University Relations',
    '7': 'Administration',
    '2': 'School of Medicine',
    '3': 'Academic Affairs',
    '8': 'Development',
    '9': 'Athletics',
    '1': 'Arts & Sciences',
}


def extract_dept_number(dept_name):
    """Extract department number from department name like '506000 Student Health'."""
    if pd.isna(dept_name):
        return None
    match = re.match(r'^(\d+)', str(dept_name))
    return match.group(1) if match else None


def get_school_from_dept(dept_name):
    """Map department to school/area based on department number prefix."""
    dept_num = extract_dept_number(dept_name)
    if dept_num and len(dept_num) >= 1:
        prefix = dept_num[0]
        return SCHOOL_MAPPING.get(prefix, 'Other')
    return 'Other'


def detect_career_progression(before_title, after_title):
    """Check if the title change represents a career ladder progression."""
    if pd.isna(before_title) or pd.isna(after_title):
        return False, None

    before = str(before_title).strip()
    after = str(after_title).strip()

    for pattern_before, pattern_after in CAREER_PATTERNS:
        if re.search(pattern_before, before, re.IGNORECASE) and \
           re.search(pattern_after, after, re.IGNORECASE):
            return True, f"{before} → {after}"

    return False, None


def titles_significantly_different(before_title, after_title):
    """Check if titles are significantly different (not just minor changes)."""
    if pd.isna(before_title) or pd.isna(after_title):
        return True

    before = str(before_title).lower().strip()
    after = str(after_title).lower().strip()

    # Remove common prefixes/suffixes for comparison
    for word in ['senior', 'associate', 'assistant', 'lead', 'principal']:
        before = before.replace(word, '').strip()
        after = after.replace(word, '').strip()

    # If core titles are very different, they're significantly different
    return before != after


def calculate_reason_code(row, before_state):
    """
    Calculate custom reason code based on available data.

    For PROMOTIONS:
    1. PROGRESSION - Career ladder advancement (detected from title patterns)
    2. APPLIED - Department changed
    3. RECLASS - Same dept, significantly different title
    4. MERIT - Same dept, similar title

    For TRANSFERS:
    1. APPLIED - Department changed
    2. REORG - Same dept (cost center/reporting change)
    """
    action_code = row['Action Code']
    after_dept = row['Department Name']
    after_title = row['Job Name']
    oracle_code = row.get('Asgmt Chg Reason Code', None)

    # Get before state
    before_dept = before_state.get('department') if before_state else None
    before_title = before_state.get('job_name') if before_state else None
    before_grade = before_state.get('grade_code') if before_state else None

    # Check if department changed
    dept_changed = False
    if before_dept and after_dept:
        before_dept_num = extract_dept_number(before_dept)
        after_dept_num = extract_dept_number(after_dept)
        dept_changed = before_dept_num != after_dept_num

    # Determine reason code based on action type
    if action_code == 'PROMOTION':
        # Check for career progression first
        is_progression, pattern = detect_career_progression(before_title, after_title)
        if is_progression:
            return {
                'code': 'PROGRESSION',
                'confidence': 'HIGH',
                'notes': f'Career ladder: {pattern}'
            }

        # If department changed, likely applied for new position
        if dept_changed:
            return {
                'code': 'APPLIED',
                'confidence': 'MEDIUM',
                'notes': f'Department change: {before_dept} → {after_dept}'
            }

        # Same department - check title difference
        if before_title and after_title:
            if titles_significantly_different(before_title, after_title):
                return {
                    'code': 'RECLASS',
                    'confidence': 'MEDIUM',
                    'notes': f'Title change: {before_title} → {after_title}'
                }
            else:
                return {
                    'code': 'MERIT',
                    'confidence': 'MEDIUM',
                    'notes': 'Same/similar title, promotion in place'
                }

        # Cannot determine
        return {
            'code': 'UNABLE_TO_DETERMINE',
            'confidence': 'LOW',
            'notes': 'Insufficient data to determine reason'
        }

    elif action_code == 'TRANSFER':
        # If department changed, likely applied
        if dept_changed:
            return {
                'code': 'APPLIED',
                'confidence': 'MEDIUM',
                'notes': f'Department change: {before_dept} → {after_dept}'
            }

        # Same department - reorganization or cost center change
        return {
            'code': 'REORG',
            'confidence': 'MEDIUM',
            'notes': 'Same department - likely cost center or reporting change'
        }

    return {
        'code': 'UNABLE_TO_DETERMINE',
        'confidence': 'LOW',
        'notes': f'Unknown action code: {action_code}'
    }


def load_mobility_data():
    """Load and filter mobility data for FY26 Q1."""
    print("Loading mobility data...")
    df = pd.read_excel(MOBILITY_FILE)

    # Convert date column
    df['Eff Start Dt'] = pd.to_datetime(df['Eff Start Dt'])

    # Filter to FY26 Q1
    mask = (df['Eff Start Dt'] >= FY26_Q1_START) & (df['Eff Start Dt'] <= FY26_Q1_END)
    df_q1 = df[mask].copy()

    # Filter to benefit-eligible
    df_q1 = df_q1[df_q1['Employment Cat Code'].isin(BENEFIT_ELIGIBLE_CATEGORIES)]

    print(f"  Total records in file: {len(df)}")
    print(f"  FY26 Q1 records: {len(df[mask])}")
    print(f"  Benefit-eligible records: {len(df_q1)}")

    return df_q1


def load_workforce_history():
    """Load workforce history to get BEFORE states."""
    print("\nLoading workforce history...")
    df = pd.read_excel(WORKFORCE_FILE)

    # Convert date column
    df['END DATE'] = pd.to_datetime(df['END DATE'])

    # Create a lookup dictionary keyed by employee number
    # Use the most recent record before FY26 Q1 (June 2025 or earlier)
    df_before_q1 = df[df['END DATE'] < FY26_Q1_START].copy()

    # Get the most recent record for each employee
    workforce_lookup = {}
    for empl_num in df_before_q1['Empl num'].unique():
        emp_records = df_before_q1[df_before_q1['Empl num'] == empl_num]
        latest = emp_records.loc[emp_records['END DATE'].idxmax()]
        workforce_lookup[empl_num] = {
            'job_name': latest['Job Name'],
            'department': latest['Organization Name'],
            'grade_code': latest.get('Grade Code', None),
            'school': latest.get('New School', None),
            'as_of_date': latest['END DATE'].strftime('%Y-%m-%d')
        }

    print(f"  Workforce records loaded: {len(df)}")
    print(f"  Unique employees with history: {len(workforce_lookup)}")

    return workforce_lookup


def process_mobility_data():
    """Main processing function."""
    # Load data
    mobility_df = load_mobility_data()
    workforce_lookup = load_workforce_history()

    print("\nProcessing mobility records...")

    # Process each record
    processed_records = []
    reason_summary = {
        'PROMOTION': {},
        'TRANSFER': {}
    }
    school_summary = {
        'PROMOTION': {},
        'TRANSFER': {}
    }

    matched_count = 0
    unmatched_count = 0

    for idx, row in mobility_df.iterrows():
        person_number = row['Person Number']
        action_code = row['Action Code']

        # Get before state from workforce history
        before_state = workforce_lookup.get(person_number, None)
        if before_state:
            matched_count += 1
        else:
            unmatched_count += 1

        # Calculate reason code
        reason_result = calculate_reason_code(row, before_state)

        # Get school/area
        school = get_school_from_dept(row['Department Name'])

        # Build record
        record = {
            'personNumber': int(person_number),
            'personName': row['Person List Name'],
            'effectiveDate': row['Eff Start Dt'].strftime('%Y-%m-%d'),
            'actionCode': action_code,
            'oracleReasonCode': row.get('Asgmt Chg Reason Code', None) if pd.notna(row.get('Asgmt Chg Reason Code')) else None,
            'customReasonCode': reason_result['code'],
            'reasonCodeConfidence': reason_result['confidence'],
            'reasonCodeNotes': reason_result['notes'],
            'school': school,
            'afterState': {
                'jobName': row['Job Name'],
                'department': row['Department Name'],
                'gradeCode': row['Grade Code'] if pd.notna(row['Grade Code']) else None,
                'employmentCategory': row['Employment Cat Code']
            }
        }

        if before_state:
            record['beforeState'] = {
                'jobName': before_state['job_name'],
                'department': before_state['department'],
                'gradeCode': before_state['grade_code'],
                'asOfDate': before_state['as_of_date']
            }
        else:
            record['beforeState'] = None

        processed_records.append(record)

        # Update summaries
        reason_code = reason_result['code']
        if action_code in reason_summary:
            reason_summary[action_code][reason_code] = reason_summary[action_code].get(reason_code, 0) + 1
            school_summary[action_code][school] = school_summary[action_code].get(school, {})
            school_summary[action_code][school][reason_code] = school_summary[action_code][school].get(reason_code, 0) + 1

    print(f"\n  Matched with workforce history: {matched_count}")
    print(f"  Unmatched (no history found): {unmatched_count}")

    # Build output data structure
    total_promotions = len([r for r in processed_records if r['actionCode'] == 'PROMOTION'])
    total_transfers = len([r for r in processed_records if r['actionCode'] == 'TRANSFER'])

    # Build promotions by reason
    promotions_by_reason = []
    reason_labels = {
        'APPLIED': 'Applied for Position',
        'MERIT': 'Merit/Performance',
        'RECLASS': 'Reclassification',
        'PROGRESSION': 'Career Ladder',
        'UNABLE_TO_DETERMINE': 'Unable to Determine'
    }
    for code, count in sorted(reason_summary['PROMOTION'].items(), key=lambda x: -x[1]):
        promotions_by_reason.append({
            'code': code,
            'label': reason_labels.get(code, code),
            'count': count
        })

    # Build transfers by reason
    transfers_by_reason = []
    transfer_reason_labels = {
        'APPLIED': 'Applied for Position',
        'REORG': 'Reorganization',
        'BUSN_NEED': 'Business Need',
        'ACCOMMODATION': 'Accommodation',
        'UNABLE_TO_DETERMINE': 'Unable to Determine'
    }
    for code, count in sorted(reason_summary['TRANSFER'].items(), key=lambda x: -x[1]):
        transfers_by_reason.append({
            'code': code,
            'label': transfer_reason_labels.get(code, code),
            'count': count
        })

    # Build promotions by school
    promotions_by_school = []
    for school, reasons in sorted(school_summary['PROMOTION'].items()):
        entry = {
            'area': school,
            'total': sum(reasons.values()),
            'applied': reasons.get('APPLIED', 0),
            'merit': reasons.get('MERIT', 0),
            'reclass': reasons.get('RECLASS', 0),
            'progression': reasons.get('PROGRESSION', 0),
            'unable': reasons.get('UNABLE_TO_DETERMINE', 0)
        }
        promotions_by_school.append(entry)
    promotions_by_school.sort(key=lambda x: -x['total'])

    # Build transfers by school
    transfers_by_school = []
    for school, reasons in sorted(school_summary['TRANSFER'].items()):
        entry = {
            'area': school,
            'total': sum(reasons.values()),
            'applied': reasons.get('APPLIED', 0),
            'reorg': reasons.get('REORG', 0),
            'busn_need': reasons.get('BUSN_NEED', 0),
            'accommodation': reasons.get('ACCOMMODATION', 0),
            'unable': reasons.get('UNABLE_TO_DETERMINE', 0)
        }
        transfers_by_school.append(entry)
    transfers_by_school.sort(key=lambda x: -x['total'])

    output_data = {
        'metadata': {
            'fiscalYear': 'FY26',
            'quarter': 'Q1',
            'dateRange': {
                'start': FY26_Q1_START,
                'end': FY26_Q1_END
            },
            'generatedAt': datetime.now().isoformat(),
            'benefitEligibleCategories': BENEFIT_ELIGIBLE_CATEGORIES,
            'totalRecordsProcessed': len(processed_records),
            'matchedWithHistory': matched_count,
            'unmatchedNoHistory': unmatched_count
        },
        'summary': {
            'totalMobilityActions': len(processed_records),
            'totalPromotions': total_promotions,
            'totalTransfers': total_transfers
        },
        'promotionsByReason': promotions_by_reason,
        'transfersByReason': transfers_by_reason,
        'promotionsBySchool': promotions_by_school,
        'transfersBySchool': transfers_by_school,
        'employeeDetails': processed_records
    }

    return output_data


def write_output(data):
    """Write output to JavaScript file."""
    print(f"\nWriting output to {OUTPUT_FILE}...")

    js_content = f"""// Internal Mobility Data - FY26 Q1
// Generated: {data['metadata']['generatedAt']}
// This file is auto-generated by scripts/processInternalMobility.py

export const internalMobilityData = {json.dumps(data, indent=2)};

// Convenience exports
export const {{ metadata, summary, promotionsByReason, transfersByReason, promotionsBySchool, transfersBySchool, employeeDetails }} = internalMobilityData;
"""

    with open(OUTPUT_FILE, 'w') as f:
        f.write(js_content)

    print("  Done!")


def print_summary(data):
    """Print summary statistics."""
    print("\n" + "=" * 60)
    print("INTERNAL MOBILITY SUMMARY - FY26 Q1")
    print("=" * 60)

    print(f"\nTotal Mobility Actions: {data['summary']['totalMobilityActions']}")
    print(f"  Promotions: {data['summary']['totalPromotions']}")
    print(f"  Transfers: {data['summary']['totalTransfers']}")

    print("\n--- Promotions by Reason ---")
    for item in data['promotionsByReason']:
        print(f"  {item['label']}: {item['count']}")

    print("\n--- Transfers by Reason ---")
    for item in data['transfersByReason']:
        print(f"  {item['label']}: {item['count']}")

    print("\n--- Promotions by School/Area ---")
    for item in data['promotionsBySchool'][:5]:
        print(f"  {item['area']}: {item['total']}")

    # Show Jennifer Bragg test case
    print("\n--- TEST CASE: Jennifer Bragg (ID 36011) ---")
    jennifer = [r for r in data['employeeDetails'] if r['personNumber'] == 36011]
    if jennifer:
        j = jennifer[0]
        print(f"  Action: {j['actionCode']}")
        print(f"  Custom Reason: {j['customReasonCode']} ({j['reasonCodeConfidence']})")
        print(f"  Notes: {j['reasonCodeNotes']}")
        if j['beforeState']:
            print(f"  Before: {j['beforeState']['jobName']}")
        print(f"  After: {j['afterState']['jobName']}")
    else:
        print("  Not found in FY26 Q1 data (may be outside date range)")


if __name__ == '__main__':
    data = process_mobility_data()
    write_output(data)
    print_summary(data)
