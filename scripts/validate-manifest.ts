#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { Ajv, type DefinedError } from 'ajv';
import metaSchema from 'ajv/dist/refs/json-schema-2020-12/schema.json' with { type: 'json' };
import { parse as parseYaml } from 'yaml';

import schema from '../schemas/kitgrid-manifest.schema.json' with { type: 'json' };

interface CliOptions {
  file: string;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { file: 'docs/kitgrid.yaml' };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') continue;
    if ((token === '--file' || token === '-f') && argv[i + 1]) {
      opts.file = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--help' || token === '-h') {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return opts;
}

function printHelp() {
  console.log(`Usage: pnpm manifest:check -- --file <path/to/kitgrid.yaml>

Defaults:
  --file docs/kitgrid.yaml
`);
}

function formatErrors(errors: DefinedError[]): string {
  return errors
    .map((err) => {
      const path = err.instancePath || '(root)';
      const keyword = err.keyword;
      const message = err.message ?? 'Validation error';
      const details = err.params ? JSON.stringify(err.params) : '';
      return `✗ ${path} — [${keyword}] ${message}${details ? ` ${details}` : ''}`;
    })
    .join('\n');
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const manifestPath = resolve(options.file);
    const fileContents = readFileSync(manifestPath, 'utf8');
    const manifest = parseYaml(fileContents);

    const ajv = new Ajv({ allErrors: true, strict: false });
    ajv.addMetaSchema(metaSchema);
    const validate = ajv.compile(schema);
    const valid = validate(manifest);

    if (!valid) {
      const errors = validate.errors ?? [];
      console.error(`Manifest validation failed for ${manifestPath}\n${formatErrors(errors as DefinedError[])}`);
      process.exit(1);
    }

    console.log(`Manifest valid ✓ — ${manifestPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`manifest:check failed — ${message}`);
    printHelp();
    process.exit(1);
  }
}

main();
