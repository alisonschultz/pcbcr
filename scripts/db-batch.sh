#!/usr/bin/env bash
set -u
export $(cat .env | xargs)

declare -A YEARS=(
  [2024]="https://investor-relations.db.com/files/documents/other-presentations-and-events/2024/Annual-Report-2024.pdf|532"
  [2023]="https://investor-relations.db.com/files/documents/annual-reports/2024/Annual-Report-2023.pdf|357-358"
  [2022]="https://investor-relations.db.com/files/documents/annual-reports/2023/Annual-Report-2022.pdf|349"
  [2021]="https://investor-relations.db.com/files/documents/annual-reports/2022/Annual_Report_2021.pdf?language_id=1|333"
  [2020]="https://investor-relations.db.com/files/documents/annual-reports/Annual_Report_2020.pdf?language_id=1|369-370"
  [2019]="https://investor-relations.db.com/files/documents/annual-reports/Deutsche_Bank_Annual_Report_2019.pdf?language_id=1|373-374"
  [2018]="https://investor-relations.db.com/files/documents/annual-reports/Deutsche_Bank_Annual_Report_2018.pdf?language_id=1|361-362"
  [2017]="https://investor-relations.db.com/files/documents/annual-reports/DB_Annual_Report_2017.pdf?language_id=1|320-321"
  [2016]="https://investor-relations.db.com/files/documents/annual-reports/Deutsche_Bank_Annual_Report_2016.pdf?language_id=1|415-416"
  [2015]="https://investor-relations.db.com/files/documents/annual-reports/Deutsche_Bank_Annual_Report_2015.pdf?language_id=1|386-387"
  [2014]="https://investor-relations.db.com/files/documents/annual-reports/deutsche_bank_annual_report_2014_entire.pdf?kid=14.redirect-en.shortcut&language_id=1|446-447"
)

for YEAR in 2024 2023 2022 2021 2020 2019 2018 2017 2016 2015 2014; do
  IFS='|' read -r URL PRINTED_PAGES <<< "${YEARS[$YEAR]}"
  PDF="db${YEAR}.pdf"
  echo ""
  echo "=========================================="
  echo "FY${YEAR}: printed pages ${PRINTED_PAGES}"
  echo "=========================================="

  if [ ! -f "$PDF" ]; then
    echo "Downloading..."
    curl -sL -o "$PDF" "$URL"
    if [ ! -s "$PDF" ]; then
      echo "Download FAILED for FY${YEAR}, skipping"
      continue
    fi
  fi
  echo "PDF size: $(du -h $PDF | cut -f1)"

  # Find CbCR PDF pages
  CANDIDATES=$(npx tsx scripts/find-cbcr-pages.ts "$PDF" 2>/dev/null)
  echo "CbCR text matches at PDF pages: $CANDIDATES"

  # Pick last cluster (skip TOC entries near front)
  PDF_PAGES=$(node -e "
    const pages = $CANDIDATES;
    if (pages.length === 0) { console.error('NO MATCH'); process.exit(1); }
    // Take last contiguous cluster
    const last = pages[pages.length - 1];
    const cluster = pages.filter(p => p >= last - 3);
    console.log(cluster[0] + '-' + cluster[cluster.length - 1]);
  ")
  echo "Using PDF pages: $PDF_PAGES"

  npx tsx scripts/extract-pdf.ts --url "$PDF" --company "Deutsche Bank AG" --fy "$YEAR" --country DE --pages "$PDF_PAGES" 2>&1 | tail -5

  echo "Sleeping 30s before next..."
  sleep 30
done

echo ""
echo "=== FY2013 (standalone CbCR PDF) ==="
PDF=db2013.pdf
if [ ! -f "$PDF" ]; then
  curl -sL -o "$PDF" "https://investor-relations.db.com/files/documents/annual-reports/Deutsche_Bank_CbCR_Disclosure_2013.pdf?language_id=3"
fi
echo "PDF size: $(du -h $PDF | cut -f1)"
# Standalone PDF — country data starts page 3, send first 6 pages
npx tsx scripts/extract-pdf.ts --url "$PDF" --company "Deutsche Bank AG" --fy 2013 --country DE --pages 1-6 2>&1 | tail -5

echo ""
echo "=== Batch complete ==="
