"use client";

import { useState } from "react";
import type { JurisdictionData } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/export";

type SortKey = keyof JurisdictionData;

export default function CbcrTable({
  data,
  currency,
}: {
  data: JurisdictionData[];
  currency: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("taxJurisdiction");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const columns: { key: SortKey; label: string; type: "text" | "currency" | "number" }[] = [
    { key: "taxJurisdiction", label: "Jurisdiction", type: "text" },
    { key: "revenueTotal", label: "Revenue", type: "currency" },
    { key: "profitOrLossBeforeIncomeTax", label: "Profit/Loss", type: "currency" },
    { key: "incomeTaxPaidCashBasis", label: "Tax Paid", type: "currency" },
    { key: "incomeTaxAccruedCurrentYear", label: "Tax Accrued", type: "currency" },
    { key: "accumulatedEarnings", label: "Accumulated Earnings", type: "currency" },
    { key: "numberOfEmployees", label: "Employees", type: "number" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="cursor-pointer px-4 py-3 text-left font-medium text-gray-600 hover:text-gray-900"
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">{sortAsc ? "\u2191" : "\u2193"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sorted.map((row) => (
            <tr key={row.countryCode} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 font-medium">
                {row.taxJurisdiction}
                <span className="ml-2 text-xs text-gray-400">
                  {row.countryCode}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatCurrency(row.revenueTotal, currency)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <span
                  className={
                    row.profitOrLossBeforeIncomeTax !== null &&
                    row.profitOrLossBeforeIncomeTax < 0
                      ? "text-red-600"
                      : ""
                  }
                >
                  {formatCurrency(row.profitOrLossBeforeIncomeTax, currency)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatCurrency(row.incomeTaxPaidCashBasis, currency)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatCurrency(row.incomeTaxAccruedCurrentYear, currency)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatCurrency(row.accumulatedEarnings, currency)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatNumber(row.numberOfEmployees)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
