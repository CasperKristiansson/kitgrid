import type { DocsNavItem } from '@kitgrid/docs-ui';
import { resolve } from 'node:path';

import { manifestNav } from './manifestNav';
import { buildSidebar } from '../../../../scripts/lib/sidebar-builder';

const docsRoot = resolve(process.cwd(), 'src/content/docs');

function getDocsNav(): DocsNavItem[] {
  const { nav } = buildSidebar({ docsRoot, basePath: '/docs', manifestNav });
  return [{ title: 'Overview', href: '/' }, ...nav];
}

export const docsNav = getDocsNav();
export const firstDocsHref = docsNav[0].href;
