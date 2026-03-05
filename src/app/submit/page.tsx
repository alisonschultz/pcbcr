export default function SubmitPage() {
  const GITHUB_REPO = "https://github.com/YOUR_USERNAME/pcbcr";
  const issueUrl = `${GITHUB_REPO}/issues/new?template=submit-report.yml`;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-3xl font-bold">Submit a CbCR Report</h1>
      <p className="mb-6 text-gray-600">
        Found a company&apos;s public Country-by-Country Report that isn&apos;t
        in our database yet? Submit it and we&apos;ll automatically extract the
        data.
      </p>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">How it works</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
          <li>
            Click the button below to open a GitHub issue form
          </li>
          <li>
            Fill in the company name, report URL (PDF or XHTML), financial year,
            and country
          </li>
          <li>
            Our automated system will download the report and extract the data
            using AI
          </li>
          <li>
            A pull request is created with the extracted data for review
          </li>
          <li>
            Once reviewed and merged, the data appears on this website
          </li>
        </ol>
      </div>

      <a
        href={issueUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Submit a Report via GitHub
      </a>

      <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">Known sources of CbCR reports:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <a
              href="https://cro.ie/publications/document-library/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ireland - Companies Registration Office (CRO)
            </a>
          </li>
          <li>
            National business registers of EU Member States
          </li>
          <li>
            Company websites (investor relations sections)
          </li>
        </ul>
      </div>
    </div>
  );
}
