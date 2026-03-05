import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const schemaPath = path.join(
  process.cwd(),
  "data",
  "schema",
  "cbcr-report.schema.json"
);
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const companiesDir = path.join(process.cwd(), "data", "companies");
const indexPath = path.join(companiesDir, "index.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

let errors = 0;

for (const company of index) {
  for (const fy of company.financialYears) {
    const filePath = path.join(companiesDir, company.id, `${fy}.json`);

    if (!fs.existsSync(filePath)) {
      console.error(`MISSING: ${filePath}`);
      errors++;
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const valid = validate(data);

    if (valid) {
      console.log(`OK: ${company.id}/${fy}.json`);
    } else {
      console.error(`INVALID: ${company.id}/${fy}.json`);
      for (const err of validate.errors || []) {
        console.error(`  ${err.instancePath} ${err.message}`);
      }
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log("\nAll data files are valid.");
}
