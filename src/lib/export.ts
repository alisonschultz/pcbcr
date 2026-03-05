import type { JurisdictionData } from "./types";

export const jurisdictionTypeLabels: Record<string, string> = {
  eu_member_state: "EU Member State",
  eea_state: "EEA State",
  non_cooperative_jurisdiction: "Non-cooperative Jurisdiction",
  grey_listed_jurisdiction: "Grey-listed Jurisdiction",
  aggregated_other: "Aggregated Other",
};

export function section2ToCsv(section2: JurisdictionData[]): string {
  const headers = [
    "Tax Jurisdiction",
    "Country Code",
    "Type",
    "Revenue Total",
    "Revenue (Unrelated Parties)",
    "Revenue (Related Parties)",
    "Profit/Loss Before Tax",
    "Income Tax Paid (Cash)",
    "Income Tax Accrued (Current Year)",
    "Accumulated Earnings",
    "Number of Employees",
  ];

  const rows = section2.map((j) =>
    [
      `"${j.taxJurisdiction}"`,
      j.countryCode,
      jurisdictionTypeLabels[j.jurisdictionType] ?? j.jurisdictionType,
      j.revenueTotal ?? "",
      j.revenueFromUnrelatedParties ?? "",
      j.revenueFromRelatedParties ?? "",
      j.profitOrLossBeforeIncomeTax ?? "",
      j.incomeTaxPaidCashBasis ?? "",
      j.incomeTaxAccruedCurrentYear ?? "",
      j.accumulatedEarnings ?? "",
      j.numberOfEmployees ?? "",
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function formatNumber(value: number | null): string {
  if (value === null) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(
  value: number | null,
  currency: string
): string {
  if (value === null) return "-";
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B ${currency}`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${currency}`;
  }
  return `${formatNumber(value)} ${currency}`;
}
