import { getAllCompanies } from "@/lib/data";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const companies = getAllCompanies();

  const totalReports = companies.reduce(
    (sum, c) => sum + c.financialYears.length,
    0
  );
  const countries = new Set(companies.map((c) => c.country)).size;

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Public CbCR Data</h1>
        <p className="mb-4 text-gray-600">
          Browse and download public Country-by-Country Reports from
          multinational enterprises, published under{" "}
          <a
            href="https://eur-lex.europa.eu/eli/dir/2021/2101/oj/eng"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            EU Directive 2021/2101
          </a>
          ,{" "}
          <a
            href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32013L0036"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CRD IV (Article 89)
          </a>
          , or voluntarily.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>
            <strong className="text-gray-700">{companies.length}</strong>{" "}
            companies
          </span>
          <span>
            <strong className="text-gray-700">{totalReports}</strong> reports
          </span>
          <span>
            <strong className="text-gray-700">{countries}</strong> countries
          </span>
          <a
            href="/all-reports.csv"
            download
            className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Download All (CSV)
          </a>
        </div>
      </div>

      <SearchBar companies={companies} />
    </div>
  );
}
