export default function AboutPage() {
  return (
    <div className="prose prose-gray max-w-3xl">
      <h1>About Public CbCR Data</h1>

      <p>
        This website collects and makes accessible the data from public
        Country-by-Country Reports (CbCR) published by multinational
        enterprises. Reports come from several regulatory frameworks as well as
        voluntary disclosures.
      </p>

      <h2>Regulatory frameworks</h2>

      <h3>EU Directive 2021/2101</h3>
      <p>
        <a
          href="https://eur-lex.europa.eu/eli/dir/2021/2101/oj/eng"
          target="_blank"
          rel="noopener noreferrer"
        >
          EU Directive 2021/2101
        </a>{" "}
        requires multinational enterprises and standalone undertakings with
        consolidated net turnover exceeding EUR 750 million (in each of the last
        two consecutive financial years) to publicly disclose income tax
        information on a country-by-country basis. For most in-scope companies
        with calendar financial years, the first reporting period is FY2025,
        with reports due by 31 December 2026.
      </p>

      <h3>CRD IV &mdash; Article 89</h3>
      <p>
        EU and EEA-regulated credit institutions and investment firms have been
        required to publish country-by-country data since 2014 under{" "}
        <a
          href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32013L0036"
          target="_blank"
          rel="noopener noreferrer"
        >
          CRD IV (Article 89)
        </a>
        . The reported fields differ slightly from Directive 2021/2101: banks
        disclose turnover, number of employees, profit or loss before tax, tax
        on profit or loss, and public subsidies received.
      </p>

      <h3>Voluntary disclosure</h3>
      <p>
        Some companies publish CbCR data voluntarily, often as part of tax
        transparency reports or sustainability commitments. These reports may
        predate mandatory requirements and can vary in format and completeness.
      </p>

      <h2>What data is reported?</h2>
      <p>
        Depending on the regulation, reports may include some or all of the
        following for each jurisdiction:
      </p>
      <ul>
        <li>Revenue (total, from related parties, and from unrelated parties)</li>
        <li>Profit or loss before income tax</li>
        <li>Income tax paid on a cash basis</li>
        <li>Income tax accrued for the current year</li>
        <li>Accumulated earnings</li>
        <li>Number of employees</li>
        <li>Names and activities of subsidiaries</li>
      </ul>

      <h2>How is data extracted?</h2>
      <p>
        Reports are published by companies as PDF or iXBRL documents. We use
        AI-powered extraction (Claude by Anthropic) to convert these documents
        into structured, machine-readable data. Each extracted report includes
        metadata about the extraction process and review status.
      </p>
      <p>
        Data accuracy depends on the quality of the source document and the
        extraction process. We encourage users to verify critical data points
        against the original source documents, which are always linked.
      </p>

      <h2>How can I contribute?</h2>
      <p>
        If you find a company&apos;s public CbCR report that is not yet in our
        database, you can{" "}
        <a href="/submit">submit it</a> for extraction. The process is automated
        and the data will be reviewed before publication.
      </p>

      <h2>Disclaimer</h2>
      <p>
        This is not an official government resource. Data is extracted from
        publicly available reports and may contain errors. Always refer to the
        original source documents for authoritative data. This project is open
        source and community-maintained.
      </p>
    </div>
  );
}
