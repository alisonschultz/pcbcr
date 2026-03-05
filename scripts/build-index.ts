import fs from "fs";
import path from "path";

const companiesDir = path.join(process.cwd(), "data", "companies");
const entries = fs.readdirSync(companiesDir, { withFileTypes: true });

const index: Array<{
  id: string;
  name: string;
  country: string;
  sector: string;
  regulationBasis: string;
  financialYears: string[];
}> = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const metaPath = path.join(companiesDir, entry.name, "meta.json");
  if (!fs.existsSync(metaPath)) continue;

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

  // Find all fy*.json files
  const files = fs.readdirSync(path.join(companiesDir, entry.name));
  const financialYears = files
    .filter((f) => f.startsWith("fy") && f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));

  index.push({
    id: meta.id,
    name: meta.name,
    country: meta.registeredOfficeCountry,
    sector: meta.sector || "",
    regulationBasis: meta.regulationBasis || "voluntary",
    financialYears,
  });
}

index.sort((a, b) => a.name.localeCompare(b.name));

const indexPath = path.join(companiesDir, "index.json");
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`Index rebuilt: ${index.length} companies`);
