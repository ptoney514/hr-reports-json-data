#!/usr/bin/env python3
"""
Verify Q1 FY26 Termination Data Accuracy
Compares dashboard hardcoded values against source data
"""

import json
import sys

# Dashboard hardcoded values (from TurnoverQ1FY26Dashboard.jsx)
DASHBOARD_DATA = {
    'total': 86,
    'faculty': 21,
    'staff': 41  # Combined staff
}

# Load source data
SOURCE_FILE = "../source-metrics/terminations/cleaned/FY25_Q4/quarterly_turnover_trends.json"

def verify_data():
    """Verify dashboard data against source"""

    print("="*80)
    print("Q1 FY26 DATA VERIFICATION")
    print("="*80)

    # Load source data
    with open(SOURCE_FILE, 'r') as f:
        source_data = json.load(f)

    # Find Q1 FY26 data
    q1_fy26 = None
    for quarter in source_data['overallTurnover']:
        if quarter['quarter'] == 'Q1 FY26':
            q1_fy26 = quarter
            break

    if not q1_fy26:
        print("❌ ERROR: Q1 FY26 data not found in source!")
        sys.exit(1)

    print("\n📊 SOURCE DATA (quarterly_turnover_trends.json):")
    print(f"   Faculty: {q1_fy26['faculty']}")
    print(f"   Staff Exempt: {q1_fy26['staffExempt']}")
    print(f"   Staff Non-Exempt: {q1_fy26['staffNonExempt']}")
    print(f"   TOTAL: {q1_fy26['total']}")

    print("\n📱 DASHBOARD DATA (TurnoverQ1FY26Dashboard.jsx):")
    print(f"   Faculty: {DASHBOARD_DATA['faculty']}")
    print(f"   Staff: {DASHBOARD_DATA['staff']} (combined)")
    print(f"   TOTAL: {DASHBOARD_DATA['total']}")

    print("\n🔍 VERIFICATION RESULTS:")
    print("-" * 80)

    # Check faculty
    faculty_match = q1_fy26['faculty'] == DASHBOARD_DATA['faculty']
    faculty_diff = DASHBOARD_DATA['faculty'] - q1_fy26['faculty']
    print(f"Faculty:  {'✅ MATCH' if faculty_match else '❌ MISMATCH'}")
    if not faculty_match:
        print(f"          Dashboard shows {DASHBOARD_DATA['faculty']}, should be {q1_fy26['faculty']}")
        print(f"          Difference: {faculty_diff:+d}")

    # Check staff (combined)
    source_staff_total = q1_fy26['staffExempt'] + q1_fy26['staffNonExempt']
    staff_match = source_staff_total == DASHBOARD_DATA['staff']
    staff_diff = DASHBOARD_DATA['staff'] - source_staff_total
    print(f"\nStaff:    {'✅ MATCH' if staff_match else '❌ MISMATCH'}")
    if not staff_match:
        print(f"          Dashboard shows {DASHBOARD_DATA['staff']}, should be {source_staff_total}")
        print(f"          Difference: {staff_diff:+d}")
        print(f"          (Staff Exempt: {q1_fy26['staffExempt']}, Staff Non-Exempt: {q1_fy26['staffNonExempt']})")

    # Check total
    total_match = q1_fy26['total'] == DASHBOARD_DATA['total']
    total_diff = DASHBOARD_DATA['total'] - q1_fy26['total']
    print(f"\nTotal:    {'✅ MATCH' if total_match else '❌ MISMATCH'}")
    if not total_match:
        print(f"          Dashboard shows {DASHBOARD_DATA['total']}, should be {q1_fy26['total']}")
        print(f"          Difference: {total_diff:+d}")

    # Math check
    dashboard_sum = DASHBOARD_DATA['faculty'] + DASHBOARD_DATA['staff']
    print(f"\n🧮 MATH CHECK (Dashboard):")
    print(f"   Faculty ({DASHBOARD_DATA['faculty']}) + Staff ({DASHBOARD_DATA['staff']}) = {dashboard_sum}")
    print(f"   Dashboard Total: {DASHBOARD_DATA['total']}")
    if dashboard_sum != DASHBOARD_DATA['total']:
        print(f"   ❌ INTERNAL INCONSISTENCY: {dashboard_sum} ≠ {DASHBOARD_DATA['total']}")
        print(f"   Missing {DASHBOARD_DATA['total'] - dashboard_sum} terminations!")
    else:
        print(f"   ✅ Dashboard math is internally consistent")

    print("\n" + "="*80)

    # Overall verdict
    all_match = faculty_match and staff_match and total_match
    if all_match:
        print("✅ VERDICT: Dashboard data matches source data")
    else:
        print("❌ VERDICT: Dashboard data DOES NOT match source data")
        print("\n📝 RECOMMENDED FIXES:")
        print("   1. Update TurnoverQ1FY26Dashboard.jsx line 16: count: 91")
        print(f"   2. Update TurnoverQ1FY26Dashboard.jsx line 22: count: {q1_fy26['faculty']}")
        print(f"   3. Update TurnoverQ1FY26Dashboard.jsx line 27: count: {source_staff_total}")
        print("   4. Consider separating Staff Exempt and Staff Non-Exempt in the dashboard")

    print("="*80)

    return all_match

if __name__ == "__main__":
    matches = verify_data()
    sys.exit(0 if matches else 1)
