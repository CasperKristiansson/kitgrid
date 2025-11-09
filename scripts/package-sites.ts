#!/usr/bin/env tsx
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import registry from '../registry.json' with { type: 'json' };

type RegistryEntry = {
  id: string;
  workspace?: string;
  last_built_ref?: string | null;
  default_ref?: string;
};

const DIST_MAP: Record<string, string> = {
  '@kitgrid/hub': 'apps/hub/dist',
  '@kitgrid/project-stub': 'apps/project-stub/dist',
  '@kitgrid/pydantic-fixturegen': 'apps/pydantic-fixturegen/dist',
};

const DISPATCH_PROJECT = process.env.PROJECT_ID;
const DISPATCH_REF = process.env.PROJECT_REF;

const STAGING_ROOT = resolve('.kitgrid-cache/deploy');

function cleanStaging() {
  rmSync(STAGING_ROOT, { recursive: true, force: true });
  mkdirSync(STAGING_ROOT, { recursive: true });
}

function copyDir(src: string, dest: string) {
  const resolvedSrc = resolve(src);
  if (!existsSync(resolvedSrc)) {
    throw new Error(`Missing build output: ${resolvedSrc}`);
  }
  const resolvedDest = resolve(dest);
  rmSync(resolvedDest, { recursive: true, force: true });
  mkdirSync(dirname(resolvedDest), { recursive: true });
  cpSync(resolvedSrc, resolvedDest, { recursive: true });
}

function stageHub() {
  copyDir(DIST_MAP['@kitgrid/hub'], join(STAGING_ROOT, 'hub'));
}

function stageProjects(entries: RegistryEntry[]) {
  for (const entry of entries) {
    if (!entry.workspace || entry.id === 'kitgrid-hub') continue;
    const dist = DIST_MAP[entry.workspace];
    if (!dist) {
      console.warn(`Skipping ${entry.id}; no dist map for workspace ${entry.workspace}`);
      continue;
    }
    const fallbackRef = entry.last_built_ref ?? entry.default_ref ?? 'main';
    const ref = entry.id === DISPATCH_PROJECT ? DISPATCH_REF ?? fallbackRef : fallbackRef;
    const versionPath = join(STAGING_ROOT, 'sites', entry.id, ref);
    const currentPath = join(STAGING_ROOT, 'sites', entry.id, 'current');
    copyDir(dist, versionPath);
    copyDir(dist, currentPath);
  }
}

function main() {
  cleanStaging();
  const entries = registry as RegistryEntry[];
  stageHub();
  stageProjects(entries);
  console.log(`Staged deploy artifacts in ${STAGING_ROOT}`);
}

main();
