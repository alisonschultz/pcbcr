import type { SubsidiarySection } from "@/lib/types";

export default function SubsidiariesTable({
  data,
}: {
  data: SubsidiarySection[];
}) {
  if (data.length === 0) {
    return <p className="text-gray-500">No subsidiary data available.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((section) => (
        <div key={section.countryCode}>
          <h4 className="mb-2 font-medium text-gray-700">
            {section.taxJurisdiction}{" "}
            <span className="text-xs text-gray-400">
              ({section.countryCode})
            </span>
          </h4>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Subsidiary
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Nature of Activities
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {section.subsidiaries.map((sub) => (
                <tr key={sub.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{sub.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {sub.activitiesNature.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
