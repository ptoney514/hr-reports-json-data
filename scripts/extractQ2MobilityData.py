#!/usr/bin/env python3
"""
Extract Q2 FY26 Internal Mobility Data from Excel.
Outputs JSON to stdout for integration into internalMobilityData.js.
Reuses reason-code logic from processInternalMobility.py.
"""

import pandas as pd
import json
import re
import sys
from datetime import datetime
from pathlib import Path

# Q2 FY26 date range
FY26_Q2_START = '2025-10-01'
FY26_Q2_END = '2025-12-31'
BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F09', 'F10', 'F11']

# Excel source
MOBILITY_FILE = Path(__file__).parent.parent / 'source-metrics/promotions-transfers/raw/Xfer Promo since July 1 2024.xlsx'

# Department → School mapping (same as processInternalMobility.py)
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

# Career progression patterns
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


def extract_dept_number(dept_name):
    if pd.isna(dept_name):
        return None
    match = re.match(r'^(\d+)', str(dept_name))
    return match.group(1) if match else None


def get_school_from_dept(dept_name):
    dept_num = extract_dept_number(dept_name)
    if dept_num and len(dept_num) >= 1:
        return SCHOOL_MAPPING.get(dept_num[0], 'Other')
    return 'Other'


def detect_career_progression(before_title, after_title):
    if pd.isna(before_title) or pd.isna(after_title):
        return False, None
    before = str(before_title).strip()
    after = str(after_title).strip()
    for pat_b, pat_a in CAREER_PATTERNS:
        if re.search(pat_b, before, re.IGNORECASE) and re.search(pat_a, after, re.IGNORECASE):
            return True, f"{before} → {after}"
    return False, None


def titles_significantly_different(before_title, after_title):
    if pd.isna(before_title) or pd.isna(after_title):
        return True
    before = str(before_title).lower().strip()
    after = str(after_title).lower().strip()
    for word in ['senior', 'associate', 'assistant', 'lead', 'principal']:
        before = before.replace(word, '').strip()
        after = after.replace(word, '').strip()
    return before != after


def build_before_state_lookup(df):
    """Build before-state lookup from Q1 records in the same spreadsheet.
    Uses Q1 data (July-Sept 2025) as 'before' reference for Q2 employees."""
    q1_start = pd.Timestamp('2025-07-01')
    q1_end = pd.Timestamp('2025-09-30')
    df_q1 = df[(df['Eff Start Dt'] >= q1_start) & (df['Eff Start Dt'] <= q1_end)]

    lookup = {}
    for _, row in df_q1.iterrows():
        person = row['Person Number']
        lookup[person] = {
            'job_name': row['Job Name'],
            'department': row['Department Name'],
            'grade_code': row['Grade Code'] if pd.notna(row.get('Grade Code')) else None,
            'as_of_date': '2025-09-30'
        }
    return lookup


def calculate_reason_code(row, before_state):
    action_code = row['Action Code']
    after_dept = row['Department Name']
    after_title = row['Job Name']

    before_dept = before_state.get('department') if before_state else None
    before_title = before_state.get('job_name') if before_state else None

    dept_changed = False
    if before_dept and after_dept:
        before_num = extract_dept_number(before_dept)
        after_num = extract_dept_number(after_dept)
        dept_changed = before_num != after_num

    if action_code == 'PROMOTION':
        is_prog, pattern = detect_career_progression(before_title, after_title)
        if is_prog:
            return {'code': 'INCREASE', 'confidence': 'HIGH', 'notes': f'Career ladder: {pattern}'}
        if dept_changed:
            return {'code': 'APPLIED', 'confidence': 'MEDIUM', 'notes': f'Department change: {before_dept} → {after_dept}'}
        return {'code': 'INCREASE', 'confidence': 'MEDIUM', 'notes': 'Same dept promotion/grade change'}

    elif action_code == 'TRANSFER':
        if dept_changed:
            return {'code': 'APPLIED', 'confidence': 'MEDIUM', 'notes': f'Department change: {before_dept} → {after_dept}'}
        return {'code': 'REORG', 'confidence': 'MEDIUM', 'notes': 'Same department - likely cost center or reporting change'}

    return {'code': 'INCREASE', 'confidence': 'LOW', 'notes': f'Unknown action: {action_code}'}


def main():
    print(f"Reading {MOBILITY_FILE}...", file=sys.stderr)
    df = pd.read_excel(MOBILITY_FILE)
    df['Eff Start Dt'] = pd.to_datetime(df['Eff Start Dt'])

    # Filter to Q2 FY26
    mask = (df['Eff Start Dt'] >= FY26_Q2_START) & (df['Eff Start Dt'] <= FY26_Q2_END)
    df_q2 = df[mask].copy()

    # Filter benefit-eligible
    df_q2 = df_q2[df_q2['Employment Cat Code'].isin(BENEFIT_ELIGIBLE_CATEGORIES)]

    print(f"Total records: {len(df)}", file=sys.stderr)
    print(f"Q2 FY26 benefit-eligible: {len(df_q2)}", file=sys.stderr)

    # Build before-state lookup from Q1 data in same spreadsheet
    before_lookup = build_before_state_lookup(df)

    # Also build a lookup from earlier rows (pre-Q1) for employees not in Q1
    all_before_q2 = df[df['Eff Start Dt'] < pd.Timestamp(FY26_Q2_START)]
    for _, row in all_before_q2.iterrows():
        person = row['Person Number']
        eff_date = row['Eff Start Dt']
        if person not in before_lookup or eff_date > pd.Timestamp(before_lookup[person].get('as_of_date', '2000-01-01')):
            before_lookup[person] = {
                'job_name': row['Job Name'],
                'department': row['Department Name'],
                'grade_code': row['Grade Code'] if pd.notna(row.get('Grade Code')) else None,
                'as_of_date': eff_date.strftime('%Y-%m-%d')
            }

    # Process records
    records = []
    reason_summary = {'PROMOTION': {}, 'TRANSFER': {}}
    school_summary = {'PROMOTION': {}, 'TRANSFER': {}}
    matched = 0
    unmatched = 0

    for _, row in df_q2.iterrows():
        person = row['Person Number']
        action = row['Action Code']
        before_state = before_lookup.get(person)

        if before_state:
            matched += 1
        else:
            unmatched += 1

        reason = calculate_reason_code(row, before_state)
        school = get_school_from_dept(row['Department Name'])

        record = {
            'personNumber': int(person),
            'personName': row['Person List Name'],
            'effectiveDate': row['Eff Start Dt'].strftime('%Y-%m-%d'),
            'actionCode': action,
            'oracleReasonCode': row.get('Asgmt Chg Reason Code', None) if pd.notna(row.get('Asgmt Chg Reason Code')) else None,
            'customReasonCode': reason['code'],
            'reasonCodeConfidence': reason['confidence'],
            'reasonCodeNotes': reason['notes'],
            'school': school,
            'afterState': {
                'jobName': row['Job Name'],
                'department': row['Department Name'],
                'gradeCode': row['Grade Code'] if pd.notna(row.get('Grade Code')) else None,
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

        records.append(record)

        code = reason['code']
        if action in reason_summary:
            reason_summary[action][code] = reason_summary[action].get(code, 0) + 1
            school_summary[action][school] = school_summary[action].get(school, {})
            school_summary[action][school][code] = school_summary[action][school].get(code, 0) + 1

    total_promotions = len([r for r in records if r['actionCode'] == 'PROMOTION'])
    total_transfers = len([r for r in records if r['actionCode'] == 'TRANSFER'])

    # Build reason breakdowns
    promo_reasons = []
    for code, count in sorted(reason_summary['PROMOTION'].items(), key=lambda x: -x[1]):
        labels = {'APPLIED': 'Applied for Position', 'INCREASE': 'Salary/Grade Increase'}
        promo_reasons.append({'code': code, 'label': labels.get(code, code), 'count': count})

    transfer_reasons = []
    for code, count in sorted(reason_summary['TRANSFER'].items(), key=lambda x: -x[1]):
        labels = {'APPLIED': 'Applied for Position', 'REORG': 'Reorganization'}
        transfer_reasons.append({'code': code, 'label': labels.get(code, code), 'count': count})

    # Build school breakdowns
    promo_by_school = []
    for school, reasons in sorted(school_summary['PROMOTION'].items()):
        promo_by_school.append({
            'area': school,
            'total': sum(reasons.values()),
            'applied': reasons.get('APPLIED', 0),
            'increase': reasons.get('INCREASE', 0),
        })
    promo_by_school.sort(key=lambda x: -x['total'])

    transfer_by_school = []
    for school, reasons in sorted(school_summary['TRANSFER'].items()):
        transfer_by_school.append({
            'area': school,
            'total': sum(reasons.values()),
            'applied': reasons.get('APPLIED', 0),
            'reorg': reasons.get('REORG', 0),
            'busn_need': reasons.get('BUSN_NEED', 0),
            'accommodation': reasons.get('ACCOMMODATION', 0),
            'unable': reasons.get('UNABLE_TO_DETERMINE', 0),
        })
    transfer_by_school.sort(key=lambda x: -x['total'])

    output = {
        'metadata': {
            'fiscalYear': 'FY26',
            'quarter': 'Q2',
            'dateRange': {'start': FY26_Q2_START, 'end': FY26_Q2_END},
            'generatedAt': datetime.now().isoformat(),
            'benefitEligibleCategories': BENEFIT_ELIGIBLE_CATEGORIES,
            'totalRecordsProcessed': len(records),
            'matchedWithHistory': matched,
            'unmatchedNoHistory': unmatched,
        },
        'summary': {
            'totalMobilityActions': len(records),
            'totalPromotions': total_promotions,
            'totalTransfers': total_transfers,
        },
        'promotionsByReason': promo_reasons,
        'transfersByReason': transfer_reasons,
        'promotionsBySchool': promo_by_school,
        'transfersBySchool': transfer_by_school,
        'employeeDetails': records,
    }

    print(f"\nQ2 FY26 Summary:", file=sys.stderr)
    print(f"  Total: {len(records)}, Promotions: {total_promotions}, Transfers: {total_transfers}", file=sys.stderr)
    print(f"  Matched: {matched}, Unmatched: {unmatched}", file=sys.stderr)
    print(f"  Promotion reasons: {reason_summary['PROMOTION']}", file=sys.stderr)
    print(f"  Transfer reasons: {reason_summary['TRANSFER']}", file=sys.stderr)

    # Output JSON to stdout
    json.dump(output, sys.stdout, indent=2)


if __name__ == '__main__':
    main()
