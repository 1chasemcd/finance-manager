#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "jsonc-parser";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const terraformOutput = JSON.parse(fs.readFileSync(0, "utf8"));

const wrangler = path.join(root, "apps/api/wrangler.jsonc");
const config = parse(fs.readFileSync(wrangler, "utf8"));

config.name = terraformOutput.worker_name.value;
config.d1_databases[0].database_name = terraformOutput.db_name.value;
config.d1_databases[0].database_id = terraformOutput.db_id.value;

fs.writeFileSync(wrangler, JSON.stringify(config, null, 2) + "\n");
