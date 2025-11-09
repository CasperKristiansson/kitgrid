#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

interface CliArgs {
  project: string;
  source: string;
  ref: string;
}

const CACHE_ROOT = resolve('.kitgrid-cache/docs');

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--project':
      case '-p':
        args.project = argv[i + 1];
        i += 1;
        break;
      case '--source':
      case '-s':
        args.source = argv[i + 1];
        i += 1;
        break;
      case '--ref':
      case '-r':
        args.ref = argv[i + 1];
        i += 1;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
      default:
        if (!token.startsWith('-') && !args.source) {
          args.source = token;
        } else if (!token.startsWith('-') && !args.project) {
          args.project = token;
        } else {
          throw new Error(`Unknown argument: ${token}`);
        }
    }
  }

  if (!args.project) {
    throw new Error('Missing required --project <id> argument.');
  }

  if (!args.source) {
    throw new Error('Missing required --source <path> argument.');
  }

  return {
    project: args.project,
    source: args.source,
    ref: args.ref ?? 'local'
  };
}

function printUsage() {
  console.log(`Usage: pnpm docs:fetch -- --project <id> --source <path> [--ref <ref>]

Examples:
  pnpm docs:fetch -- --project pydantic-fixturegen --source ../pydantic-fixturegen/docs --ref main
  pnpm docs:fetch -- --project demo --source ./tmp/docs
`);
}

function ensureDir(pathToCreate: string) {
  mkdirSync(pathToCreate, { recursive: true });
}

function ensureParentDirs(targetPath: string) {
  ensureDir(dirname(targetPath));
}

function cleanDir(targetPath: string) {
  rmSync(targetPath, { recursive: true, force: true });
  ensureDir(targetPath);
}

function copySource(sourceDir: string, destDir: string) {
  cpSync(sourceDir, destDir, { recursive: true, errorOnExist: false });
}

function recordMetadata(destDir: string, info: CliArgs, sourceRealPath: string) {
  const metadata = {
    project: info.project,
    ref: info.ref,
    source: sourceRealPath,
    cachedAt: new Date().toISOString()
  } satisfies Record<string, string>;
  writeFileSync(join(destDir, '.kitgrid-docs.json'), JSON.stringify(metadata, null, 2));
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const resolvedSource = resolve(args.source);

    if (!existsSync(resolvedSource)) {
      throw new Error(`Source path not found: ${resolvedSource}`);
    }

    const sourceStat = statSync(resolvedSource);
    if (!sourceStat.isDirectory()) {
      throw new Error('Source path must point to a directory that contains docs.');
    }

    const targetDir = resolve(CACHE_ROOT, args.project, args.ref);
    ensureParentDirs(targetDir);
    cleanDir(targetDir);
    copySource(resolvedSource, targetDir);
    recordMetadata(targetDir, args, resolvedSource);

    console.log(`Cached docs for ${args.project}@${args.ref} → ${targetDir}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`docs:fetch failed — ${message}`);
    printUsage();
    process.exit(1);
  }
}

main();
