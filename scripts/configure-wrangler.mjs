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
config.vars.POLICY_AUD = terraformOutput.access_app_aud_tag.value;
config.vars.TEAM_DOMAIN = formatDomain(terraformOutput.zt_team_domain.value);
config.d1_databases[0].database_name = terraformOutput.db_name.value;
config.d1_databases[0].database_id = terraformOutput.db_id.value;

fs.writeFileSync(wrangler, JSON.stringify(config, null, 2) + "\n");

function formatDomain(domain) {
  if (domain.startsWith("https://") || domain.startsWith("http://")) return domain;
  return `https://${domain}`;
}
