import { getAllCompanies, getCompanyMeta, getCompanyReport } from "@/lib/data";
import { formatCurrency } from "@/lib/export";
import type { RegulationBasis } from "@/lib/types";

const regulationLabels: Record<RegulationBasis, string> = {
  eu_directive_2021_2101: "EU Directive 2021/2101",
  crd_iv_article_89: "CRD IV (Article 89)",
  voluntary: "Voluntary",
};

export function generateStaticParams() {
  return getAllCompanies().map((c) => ({ slug: c.id }));
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getCompanyMeta(slug);
  const company = getAllCompanies().find((c) => c.id === slug)!;

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          &larr; All companies
        </a>
      </div>

      <h1 className="mb-2 text-3xl font-bold">{meta.name}</h1>
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
        <span>Country: {meta.registeredOfficeCountry}</span>
        {meta.registeredOfficeCity && (
          <span>City: {meta.registeredOfficeCity}</span>
        )}
        <span>Sector: {meta.sector}</span>
        <span>Regulation: {regulationLabels[meta.regulationBasis]}</span>
        {meta.lei && <span>LEI: {meta.lei}</span>}
      </div>

      <h2 className="mb-4 text-xl font-semibold">Available Reports</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {company.financialYears.map((fy) => {
          const report = getCompanyReport(slug, fy);
          const hasRevenue = report.section2.some(
            (j) => j.revenueTotal != null
          );
          const totalRevenue = hasRevenue
            ? report.section2.reduce(
                (sum, j) => sum + (j.revenueTotal ?? 0),
                0
              )
            : null;
          const hasEmployees = report.section2.some(
            (j) => j.numberOfEmployees != null
          );
          const totalEmployees = hasEmployees
            ? report.section2.reduce(
                (sum, j) => sum + (j.numberOfEmployees ?? 0),
                0
              )
            : null;
          const jurisdictions = report.section2.length;

          return (
            <a
              key={fy}
              href={`/company/${slug}/${fy}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-md"
            >
              <h3 className="mb-3 text-lg font-semibold">
                {fy.replace("fy", "FY ")}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                {totalRevenue != null && (
                  <p>
                    Revenue:{" "}
                    {formatCurrency(
                      totalRevenue,
                      report.section1.reportingCurrency
                    )}
                  </p>
                )}
                {totalEmployees != null && (
                  <p>Employees: {totalEmployees.toLocaleString()}</p>
                )}
                <p>{jurisdictions} jurisdictions</p>
              </div>
              <div className="mt-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                    report.extractionMetadata.manualReviewStatus === "verified"
                      ? "bg-green-100 text-green-700"
                      : report.extractionMetadata.manualReviewStatus ===
                          "reviewed"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {report.extractionMetadata.manualReviewStatus}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
