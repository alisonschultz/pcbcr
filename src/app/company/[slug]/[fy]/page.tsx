import Link from "next/link";
import {
  getAllCompanies,
  getCompanyReport,
} from "@/lib/data";
import CbcrTable from "@/components/CbcrTable";
import SubsidiariesTable from "@/components/SubsidiariesTable";
import DownloadButtons from "@/components/DownloadButtons";

export function generateStaticParams() {
  const companies = getAllCompanies();
  const params: { slug: string; fy: string }[] = [];
  for (const company of companies) {
    for (const fy of company.financialYears) {
      params.push({ slug: company.id, fy });
    }
  }
  return params;
}

export default async function FYPage({
  params,
}: {
  params: Promise<{ slug: string; fy: string }>;
}) {
  const { slug, fy } = await params;
  const report = getCompanyReport(slug, fy);

  return (
    <div>
      <div className="mb-6 flex gap-2 text-sm text-blue-600">
        <Link href="/" className="hover:underline">
          Companies
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href={`/company/${slug}`}
          className="hover:underline"
        >
          {report.companyName}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">
          {fy.replace("fy", "FY ")}
        </span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">{report.companyName}</h1>
          <p className="text-gray-500">
            {fy.replace("fy", "FY ")} &middot;{" "}
            {report.section1.financialYearStart} to{" "}
            {report.section1.financialYearEnd} &middot;{" "}
            {report.section1.reportingCurrency}
          </p>
        </div>
        <DownloadButtons report={report} />
      </div>

      {/* Section 1: General Information */}
      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">General Information</h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <dt className="text-gray-500">Ultimate Parent</dt>
            <dd className="font-medium">
              {report.section1.ultimateParentName}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Registered Office</dt>
            <dd className="font-medium">
              {report.section1.registeredOfficeCountry}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Reporting Currency</dt>
            <dd className="font-medium">
              {report.section1.reportingCurrency}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Tax Reporting Basis</dt>
            <dd className="font-medium">
              {report.section1.taxReportingBasis}
            </dd>
          </div>
          {report.section1.basisDescription && (
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Basis Description</dt>
              <dd className="font-medium">
                {report.section1.basisDescription}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Section 2: Country-by-Country Data */}
      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Country-by-Country Data
        </h2>
        <CbcrTable
          data={report.section2}
          currency={report.section1.reportingCurrency}
        />
      </section>

      {/* Section 3: Subsidiaries */}
      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Subsidiaries by Jurisdiction
        </h2>
        <SubsidiariesTable data={report.section3} />
      </section>

      {/* Section 4 & 5 */}
      {(report.section4.hasOmittedInformation ||
        report.section5.hasMaterialDiscrepancies) && (
        <section className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Disclosures</h2>
          {report.section4.hasOmittedInformation && (
            <div className="mb-3">
              <h3 className="font-medium text-yellow-800">
                Omitted Information
              </h3>
              <p className="text-sm text-yellow-700">
                {report.section4.omissionDetails}
              </p>
              {report.section4.omissionExpiryYear && (
                <p className="text-xs text-yellow-600">
                  Expires: {report.section4.omissionExpiryYear}
                </p>
              )}
            </div>
          )}
          {report.section5.hasMaterialDiscrepancies && (
            <div>
              <h3 className="font-medium text-yellow-800">
                Material Discrepancies
              </h3>
              <p className="text-sm text-yellow-700">
                {report.section5.discrepancyExplanation}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Extraction Metadata */}
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
        <h2 className="mb-3 font-semibold text-gray-700">Data Source</h2>
        <div className="space-y-1">
          <p>
            Source:{" "}
            <a
              href={report.extractionMetadata.sourceUrl}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {report.extractionMetadata.sourceUrl}
            </a>
          </p>
          <p>
            Extracted: {report.extractionMetadata.extractedAt} using{" "}
            {report.extractionMetadata.extractionModel}
          </p>
          <p>
            Review status:{" "}
            <span className="font-medium">
              {report.extractionMetadata.manualReviewStatus}
            </span>
          </p>
          {report.extractionMetadata.confidenceNotes && (
            <p>Notes: {report.extractionMetadata.confidenceNotes}</p>
          )}
        </div>
      </section>
    </div>
  );
}
