"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CompanyIndex, RegulationBasis } from "@/lib/types";

const regulationLabels: Record<RegulationBasis, string> = {
  eu_directive_2021_2101: "EU Directive 2021/2101",
  crd_iv_article_89: "CRD IV (Article 89)",
  voluntary: "Voluntary",
};

export default function SearchBar({
  companies,
}: {
  companies: CompanyIndex[];
}) {
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const countries = useMemo(() => {
    const set = new Set(companies.map((c) => c.country));
    return Array.from(set).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.sector.toLowerCase().includes(query.toLowerCase());
      const matchesCountry = !countryFilter || c.country === countryFilter;
      return matchesQuery && matchesCountry;
    });
  }, [companies, query, countryFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {filtered.length} {filtered.length === 1 ? "company" : "companies"}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Company
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Country
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Sector
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Regulation
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Reports
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/company/${company.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{company.country}</td>
                <td className="px-4 py-3 text-gray-600">{company.sector}</td>
                <td className="px-4 py-3 text-gray-600">
                  {regulationLabels[company.regulationBasis]}
                </td>
                <td className="px-4 py-3">
                  {company.financialYears
                    .map((fy) => fy.replace("fy", "FY"))
                    .join(", ")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
