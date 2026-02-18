#!/usr/bin/env bash
#
# Load all workforce + demographics data for 6 quarters into Neon Postgres.
# Idempotent: safe to re-run (uses UPSERT).
#
# Usage:
#   ./scripts/etl/load-all-quarters.sh
#   npm run etl:load-all
#

set -euo pipefail

EXCEL_FILE="source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT 12-9-2025.xlsx"

# All 6 quarters (chronological order)
DATES=(
  "2024-06-30"   # Q4 FY24
  "2024-09-30"   # Q1 FY25
  "2024-12-31"   # Q2 FY25
  "2025-03-31"   # Q3 FY25
  "2025-06-30"   # Q4 FY25
  "2025-09-30"   # Q1 FY26
)

echo "========================================"
echo "  Load All Quarters - Workforce + Demographics"
echo "========================================"
echo ""

# Check that the Excel file exists
if [ ! -f "$EXCEL_FILE" ]; then
  echo "ERROR: Excel file not found: $EXCEL_FILE"
  exit 1
fi

echo "Source: $EXCEL_FILE"
echo "Quarters: ${#DATES[@]}"
echo ""

# --- Workforce ---
echo "--- Workforce ETL ---"
for DATE in "${DATES[@]}"; do
  echo ""
  echo ">> Loading workforce for $DATE ..."
  npm run etl:workforce -- --input "$EXCEL_FILE" --date "$DATE"
  if [ $? -ne 0 ]; then
    echo "ERROR: Workforce ETL failed for $DATE"
    exit 1
  fi
done

echo ""
echo "--- Demographics ETL ---"
for DATE in "${DATES[@]}"; do
  echo ""
  echo ">> Loading demographics for $DATE ..."
  npm run etl:demographics -- --input "$EXCEL_FILE" --date "$DATE"
  if [ $? -ne 0 ]; then
    echo "ERROR: Demographics ETL failed for $DATE"
    exit 1
  fi
done

echo ""
echo "========================================"
echo "  All quarters loaded successfully"
echo "========================================"
