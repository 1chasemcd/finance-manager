#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";

const file = process.argv[2];

process.stdout.write("## Terraform Plan\n\n");
process.stdout.write("```terraform\n");

if (file && existsSync(file))
  process.stdout.write(readFileSync(file, "utf8").replace(/\n$/, ""));
else process.stdout.write("no plan output - see the workflow log for details");

process.stdout.write("\n```");
