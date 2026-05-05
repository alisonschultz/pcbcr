import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

const EXTRACTION_PROMPT = `You are a specialist in extracting structured data from EU Public Country-by-Country Reports (Directive 2021/2101).

Extract ALL data from this CbCR report into the exact JSON structure below. Be precise with numbers - preserve the exact values from the report. Use null for missing fields. All monetary values should be numbers without currency symbols or formatting. If values are in thousands or millions, convert to full numbers.

Output ONLY valid JSON with this structure:

{
  "section1": {
    "ultimateParentName": "string",
    "registeredOfficeCountry": "2-letter ISO code",
    "financialYearStart": "YYYY-MM-DD",
    "financialYearEnd": "YYYY-MM-DD",
    "reportingCurrency": "3-letter ISO code",
    "taxReportingBasis": "consolidated or standalone",
    "basisDescription": "string or null"
  },
  "section2": [
    {
      "taxJurisdiction": "Country name",
      "countryCode": "2-letter ISO code",
      "jurisdictionType": "eu_member_state | eea_state | non_cooperative_jurisdiction | grey_listed_jurisdiction | aggregated_other",
      "revenueTotal": number_or_null,
      "revenueFromUnrelatedParties": number_or_null,
      "revenueFromRelatedParties": number_or_null,
      "profitOrLossBeforeIncomeTax": number_or_null,
      "incomeTaxPaidCashBasis": number_or_null,
      "incomeTaxAccruedCurrentYear": number_or_null,
      "accumulatedEarnings": number_or_null,
      "numberOfEmployees": number_or_null
    }
  ],
  "section3": [
    {
      "taxJurisdiction": "Country name",
      "countryCode": "2-letter ISO code",
      "subsidiaries": [
        {
          "name": "Subsidiary name",
          "activitiesNature": ["description of activities"]
        }
      ]
    }
  ],
  "section4": {
    "hasOmittedInformation": boolean,
    "omissionDetails": "string or null",
    "omissionExpiryYear": number_or_null
  },
  "section5": {
    "hasMaterialDiscrepancies": boolean,
    "discrepancyExplanation": "string or null"
  }
}

Rules:
- EU Member States: AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE
- EEA (non-EU): IS, LI, NO
- Use "aggregated_other" for rows labeled "All other jurisdictions" or similar aggregated categories
- If the report is in a language other than English, translate jurisdiction names to English but keep subsidiary names in original language
- Return ONLY the JSON object, no markdown fences or other text`;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePageRange(spec: string, totalPages: number): number[] {
  const indices = new Set<number>();
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`Invalid page range segment: "${trimmed}"`);
    const start = parseInt(m[1], 10);
    const end = m[2] ? parseInt(m[2], 10) : start;
    if (start < 1 || end < start || end > totalPages) {
      throw new Error(
        `Page range "${trimmed}" out of bounds (PDF has ${totalPages} pages)`
      );
    }
    for (let p = start; p <= end; p++) indices.add(p - 1);
  }
  return Array.from(indices).sort((a, b) => a - b);
}

async function slicePdf(buffer: Buffer, pageSpec: string): Promise<Buffer> {
  const mupdf = await import("mupdf");
  const doc = mupdf.PDFDocument.openDocument(buffer, "application/pdf") as InstanceType<
    typeof mupdf.PDFDocument
  >;
  const indices = parsePageRange(pageSpec, doc.countPages());
  doc.rearrangePages(indices);
  const out = doc
    .saveToBuffer("compress=yes,clean=yes,sanitize=yes,garbage=yes")
    .asUint8Array();
  return Buffer.from(out);
}

async function extractFromPdf(
  pdfUrl: string,
  companyName: string,
  financialYear: string,
  country: string,
  pageSpec?: string
) {
  let pdfBuffer: Buffer;

  if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
    console.log(`Downloading PDF from: ${pdfUrl}`);
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/pdf,*/*",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to download PDF: ${response.status} ${response.statusText}`
      );
    }
    pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log(
      `PDF downloaded: ${(pdfBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`
    );
  } else {
    console.log(`Reading local PDF: ${pdfUrl}`);
    pdfBuffer = fs.readFileSync(pdfUrl);
    console.log(
      `PDF read: ${(pdfBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`
    );
  }

  if (pageSpec) {
    pdfBuffer = await slicePdf(pdfBuffer, pageSpec);
    console.log(
      `Sliced to pages ${pageSpec}: ${(pdfBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`
    );
  }

  const pdfBase64 = pdfBuffer.toString("base64");

  console.log("Sending to Claude for extraction...");
  const maxRetries = 5;
  let result;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const stream = client.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });
      result = await stream.finalMessage();
      break;
    } catch (err: any) {
      if (err?.status === 429 && attempt < maxRetries) {
        const retryAfter = parseInt(err?.headers?.["retry-after"] || "120", 10);
        const waitSecs = Math.max(retryAfter, 60) + 10;
        console.log(`Rate limited. Waiting ${waitSecs}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, waitSecs * 1000));
      } else {
        throw err;
      }
    }
  }
  if (!result) throw new Error("Failed after all retries");

  const textBlock = result.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let jsonText = textBlock.text.trim();
  // Strip markdown fences if present
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const extracted = JSON.parse(jsonText);

  const slug = slugify(companyName);
  const fy = `fy${financialYear}`;

  const report = {
    companyId: slug,
    companyName: companyName,
    ...extracted,
    extractionMetadata: {
      sourceUrl: pdfUrl,
      sourceType: "pdf" as const,
      extractedAt: new Date().toISOString(),
      extractionModel: "claude-sonnet-4-20250514",
      confidenceNotes: null,
      manualReviewStatus: "pending" as const,
    },
  };

  // Write report file
  const companyDir = path.join(process.cwd(), "data", "companies", slug);
  fs.mkdirSync(companyDir, { recursive: true });

  const reportPath = path.join(companyDir, `${fy}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved: ${reportPath}`);

  // Write/update meta.json
  const metaPath = path.join(companyDir, "meta.json");
  let meta;
  if (fs.existsSync(metaPath)) {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    const existingSource = meta.sources.find(
      (s: { financialYear: string }) => s.financialYear === fy
    );
    if (existingSource) {
      Object.assign(existingSource, {
        sourceUrl: pdfUrl,
        sourceType: "pdf",
        extractedAt: new Date().toISOString(),
        extractionModel: "claude-sonnet-4-20250514",
      });
    } else {
      meta.sources.push({
        financialYear: fy,
        sourceUrl: pdfUrl,
        sourceType: "pdf",
        extractedAt: new Date().toISOString(),
        extractionModel: "claude-sonnet-4-20250514",
      });
    }
  } else {
    meta = {
      id: slug,
      name: companyName,
      registeredOfficeCountry: country.toUpperCase(),
      registeredOfficeCity: "",
      sector: "",
      lei: null,
      sources: [
        {
          financialYear: fy,
          sourceUrl: pdfUrl,
          sourceType: "pdf",
          extractedAt: new Date().toISOString(),
          extractionModel: "claude-sonnet-4-20250514",
        },
      ],
    };
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Meta saved: ${metaPath}`);

  // Update index.json
  const indexPath = path.join(process.cwd(), "data", "companies", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  const existing = index.find((c: { id: string }) => c.id === slug);
  if (existing) {
    if (!existing.financialYears.includes(fy)) {
      existing.financialYears.push(fy);
    }
  } else {
    index.push({
      id: slug,
      name: companyName,
      country: country.toUpperCase(),
      sector: "",
      financialYears: [fy],
    });
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Index updated: ${indexPath}`);

  console.log("\nExtraction complete!");
  console.log(`Company: ${companyName} (${slug})`);
  console.log(`Financial Year: ${fy}`);
  console.log(`Jurisdictions extracted: ${report.section2.length}`);
}

// CLI argument parsing
const args = process.argv.slice(2);
const argMap: Record<string, string> = {};
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, "");
  argMap[key] = args[i + 1];
}

if (!argMap.url || !argMap.company || !argMap.fy || !argMap.country) {
  console.error(
    "Usage: npx tsx scripts/extract-pdf.ts --url <pdf-url> --company <name> --fy <year> --country <code> [--pages <range>]"
  );
  console.error("Example: npx tsx scripts/extract-pdf.ts --url https://example.com/report.pdf --company 'Volkswagen AG' --fy 2025 --country DE");
  console.error("Page range example: --pages 450-455 or --pages 12,18-22,30");
  process.exit(1);
}

extractFromPdf(argMap.url, argMap.company, argMap.fy, argMap.country, argMap.pages).catch(
  (err) => {
    console.error("Extraction failed:", err);
    process.exit(1);
  }
);
