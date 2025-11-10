#!/usr/bin/env tsx
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function printUsage() {
  console.log('Usage: tsx scripts/sync-pagefind-to-public.ts <srcDir> <destDir>');
}

function main() {
  const [srcArg, destArg] = process.argv.slice(2);
  if (!srcArg || !destArg) {
    printUsage();
    process.exit(1);
  }

  const src = resolve(process.cwd(), srcArg);
  const dest = resolve(process.cwd(), destArg);

  if (!existsSync(src)) {
    console.warn(`Pagefind source directory not found: ${src}`);
    return;
  }

  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`Synced Pagefind assets from ${src} -> ${dest}`);
}

main();
