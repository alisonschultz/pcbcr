import fs from "fs";
import path from "path";
import type { CompanyIndex, CompanyMeta, CbcrReport } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "companies");

export function getAllCompanies(): CompanyIndex[] {
  const indexPath = path.join(DATA_DIR, "index.json");
  return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
}

export function getCompanyMeta(slug: string): CompanyMeta {
  const filePath = path.join(DATA_DIR, slug, "meta.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getCompanyReport(slug: string, fy: string): CbcrReport {
  const filePath = path.join(DATA_DIR, slug, `${fy}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getCompanySlugs(): string[] {
  return getAllCompanies().map((c) => c.id);
}

export function getCompanyFYs(slug: string): string[] {
  const company = getAllCompanies().find((c) => c.id === slug);
  return company?.financialYears ?? [];
}
