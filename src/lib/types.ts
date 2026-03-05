export type RegulationBasis =
  | "eu_directive_2021_2101"
  | "crd_iv_article_89"
  | "voluntary";

export interface CompanyIndex {
  id: string;
  name: string;
  country: string;
  sector: string;
  regulationBasis: RegulationBasis;
  financialYears: string[];
}

export interface CompanyMeta {
  id: string;
  name: string;
  registeredOfficeCountry: string;
  registeredOfficeCity: string;
  sector: string;
  regulationBasis: RegulationBasis;
  lei: string | null;
  sources: ReportSource[];
}

export interface ReportSource {
  financialYear: string;
  sourceUrl: string;
  sourceType: "pdf" | "xhtml" | "other";
  extractedAt: string;
  extractionModel: string;
}

export interface CbcrReport {
  companyId: string;
  companyName: string;
  section1: Section1;
  section2: JurisdictionData[];
  section3: SubsidiarySection[];
  section4: OmissionSection;
  section5: DiscrepancySection;
  extractionMetadata: ExtractionMetadata;
}

export interface Section1 {
  ultimateParentName: string;
  registeredOfficeCountry: string;
  financialYearStart: string;
  financialYearEnd: string;
  reportingCurrency: string;
  taxReportingBasis: string;
  basisDescription: string | null;
}

export type JurisdictionType =
  | "eu_member_state"
  | "eea_state"
  | "non_cooperative_jurisdiction"
  | "grey_listed_jurisdiction"
  | "aggregated_other";

export interface JurisdictionData {
  taxJurisdiction: string;
  countryCode: string;
  jurisdictionType: JurisdictionType;
  revenueTotal: number | null;
  revenueFromUnrelatedParties: number | null;
  revenueFromRelatedParties: number | null;
  profitOrLossBeforeIncomeTax: number | null;
  incomeTaxPaidCashBasis: number | null;
  incomeTaxAccruedCurrentYear: number | null;
  accumulatedEarnings: number | null;
  numberOfEmployees: number | null;
}

export interface SubsidiarySection {
  taxJurisdiction: string;
  countryCode: string;
  subsidiaries: Subsidiary[];
}

export interface Subsidiary {
  name: string;
  activitiesNature: string[];
}

export interface OmissionSection {
  hasOmittedInformation: boolean;
  omissionDetails: string | null;
  omissionExpiryYear: number | null;
}

export interface DiscrepancySection {
  hasMaterialDiscrepancies: boolean;
  discrepancyExplanation: string | null;
}

export interface ExtractionMetadata {
  sourceUrl: string;
  sourceType: "pdf" | "xhtml" | "other";
  extractedAt: string;
  extractionModel: string;
  confidenceNotes: string | null;
  manualReviewStatus: "pending" | "reviewed" | "verified";
}
