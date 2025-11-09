#!/usr/bin/env tsx
import registry from '../registry.json' with { type: 'json' };

type RegistryEntry = { id: string; workspace?: string };

const entries = registry as RegistryEntry[];
const paths = ['/hub/*'];

for (const entry of entries) {
  if (entry.workspace && entry.id !== 'kitgrid-hub') {
    paths.push(`/sites/${entry.id}/*`);
  }
}

console.log(paths.join(' '));
