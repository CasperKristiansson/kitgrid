#!/usr/bin/env tsx
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { globSync } from 'glob';
import { load } from 'cheerio';

type Target = { root: string; prefix?: string };

const targets: Target[] = [
  { root: 'apps/hub/dist' },
  { root: '.kitgrid-cache/deploy/sites' },
];

function listHtml(root: string) {
  return globSync('**/*.html', { cwd: root, nodir: true });
}

function isExternal(href: string) {
  return href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:');
}

function resolveCandidate(href: string, absRoot: string, fullPath: string) {
  const [pathPart] = href.split('#');
  const normalized = pathPart.replace(/^\/+/, '');
  if (href.startsWith('/')) {
    if (absRoot.endsWith(`${sep}sites`)) {
      const rel = relative(absRoot, fullPath);
      const segments = rel.split(sep);
      if (segments.length >= 2) {
        const siteRoot = join(absRoot, segments[0], segments[1]);
        return join(siteRoot, normalized);
      }
    }
    return join(absRoot, normalized);
  }
  return resolve(dirname(fullPath), normalized);
}

let failures = 0;

for (const target of targets) {
  const absRoot = resolve(target.root);
  if (!existsSync(absRoot)) continue;
  for (const relative of listHtml(absRoot)) {
    const fullPath = resolve(absRoot, relative);
    const html = readFileSync(fullPath, 'utf8');
    const $ = load(html);
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      if (!href || isExternal(href)) return;
      const candidate = resolveCandidate(href, absRoot, fullPath);
      if (!candidate.startsWith(absRoot)) return;
      if (!existsSync(candidate)) {
        failures += 1;
        console.error(`Broken link: ${href} referenced from ${relative}`);
      }
    });
  }
}

if (failures) {
  console.error(`Link checker found ${failures} issues`);
  process.exit(1);
} else {
  console.log('Link checker passed');
}
