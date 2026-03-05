"use client";

import type { CbcrReport } from "@/lib/types";
import { section2ToCsv } from "@/lib/export";

export default function DownloadButtons({ report }: { report: CbcrReport }) {
  function downloadCsv() {
    const csv = section2ToCsv(report.section2);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.companyId}-${report.section1.financialYearEnd.slice(0, 4)}-cbcr.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.companyId}-${report.section1.financialYearEnd.slice(0, 4)}-cbcr.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={downloadCsv}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Download CSV
      </button>
      <button
        onClick={downloadJson}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Download JSON
      </button>
    </div>
  );
}
