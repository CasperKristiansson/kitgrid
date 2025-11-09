#!/usr/bin/env tsx
import { execa } from 'execa';
import registry from '../registry.json' with { type: 'json' };

type RegistryEntry = {
  workspace?: string;
};

async function main() {
  const entries = registry as RegistryEntry[];
  const workspaces = new Set<string>();
  workspaces.add('@kitgrid/hub');

  for (const entry of entries) {
    if (entry.workspace) {
      workspaces.add(entry.workspace);
    }
  }

  for (const workspace of workspaces) {
    console.log(`Building ${workspace}`);
    await execa('pnpm', ['--filter', workspace, 'build'], { stdio: 'inherit' });
    try {
      await execa('pnpm', ['--filter', workspace, 'search:index'], { stdio: 'inherit' });
    } catch (error) {
      console.warn(`Skipping search index for ${workspace}:`, error instanceof Error ? error.message : error);
    }
  }
}

await main();
