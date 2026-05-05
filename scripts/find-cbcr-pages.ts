import fs from "fs";

async function findCbcrPages(pdfPath: string): Promise<number[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, disableWorker: true } as never)
    .promise;

  const matches: number[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = (tc.items as { str: string }[])
      .map((i) => i.str)
      .join(" ");
    if (/country[- ]by[- ]country reporting/i.test(text)) {
      matches.push(p);
    }
  }
  return matches;
}

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Usage: npx tsx scripts/find-cbcr-pages.ts <pdf-path>");
  process.exit(1);
}

findCbcrPages(pdfPath).then((pages) => {
  console.log(JSON.stringify(pages));
});
