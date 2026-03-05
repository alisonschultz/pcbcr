import fs from "fs";
import path from "path";

const companiesDir = path.join(process.cwd(), "data", "companies");
const indexPath = path.join(companiesDir, "index.json");
const outputPath = path.join(process.cwd(), "public", "all-reports.csv");

const regulationLabels: Record<string, string> = {
  eu_directive_2021_2101: "EU Directive 2021/2101",
  crd_iv_article_89: "CRD IV (Article 89)",
  voluntary: "Voluntary",
};

const jurisdictionTypeLabels: Record<string, string> = {
  eu_member_state: "EU Member State",
  eea_state: "EEA State",
  non_cooperative_jurisdiction: "Non-cooperative Jurisdiction",
  grey_listed_jurisdiction: "Grey-listed Jurisdiction",
  aggregated_other: "Aggregated Other",
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const index = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as Array<{
  id: string;
  name: string;
  country: string;
  sector: string;
  regulationBasis: string;
  financialYears: string[];
}>;

const headers = [
  "Company",
  "Company ID",
  "Country",
  "Sector",
  "Regulation",
  "Financial Year",
  "Currency",
  "Tax Jurisdiction",
  "Country Code",
  "Jurisdiction Type",
  "Revenue Total",
  "Revenue (Unrelated Parties)",
  "Revenue (Related Parties)",
  "Profit/Loss Before Tax",
  "Income Tax Paid (Cash)",
  "Income Tax Accrued (Current Year)",
  "Accumulated Earnings",
  "Number of Employees",
];

const rows: string[] = [headers.join(",")];
let reportCount = 0;

for (const company of index) {
  for (const fy of company.financialYears) {
    const reportPath = path.join(companiesDir, company.id, `${fy}.json`);
    if (!fs.existsSync(reportPath)) continue;

    const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    const currency = report.section1?.reportingCurrency ?? "";
    const yearLabel = fy.replace("fy", "FY");
    reportCount++;

    for (const j of report.section2 ?? []) {
      const row = [
        escapeCsv(company.name),
        company.id,
        company.country,
        escapeCsv(company.sector),
        regulationLabels[company.regulationBasis] ?? company.regulationBasis,
        yearLabel,
        currency,
        escapeCsv(j.taxJurisdiction ?? ""),
        j.countryCode ?? "",
        jurisdictionTypeLabels[j.jurisdictionType] ?? j.jurisdictionType ?? "",
        j.revenueTotal ?? "",
        j.revenueFromUnrelatedParties ?? "",
        j.revenueFromRelatedParties ?? "",
        j.profitOrLossBeforeIncomeTax ?? "",
        j.incomeTaxPaidCashBasis ?? "",
        j.incomeTaxAccruedCurrentYear ?? "",
        j.accumulatedEarnings ?? "",
        j.numberOfEmployees ?? "",
      ].join(",");
      rows.push(row);
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, rows.join("\n"));
console.log(
  `CSV built: ${reportCount} reports, ${rows.length - 1} jurisdiction rows → ${outputPath}`
);
