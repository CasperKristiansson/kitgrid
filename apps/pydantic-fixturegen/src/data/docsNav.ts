import type { DocsNavItem } from '@kitgrid/docs-ui';
import { resolve } from 'node:path';

import { buildSidebar } from '../../../../scripts/lib/sidebar-builder';

const docsRoot = resolve(process.cwd(), 'src/content/docs');

function getDocsNav(): DocsNavItem[] {
  try {
    const { nav } = buildSidebar({ docsRoot, basePath: '/docs' });
    return nav;
  } catch (error) {
    console.warn(
      'docsNav fallback for pydantic-fixturegen:',
      error instanceof Error ? error.message : error
    );
    return [
      { title: 'Overview', href: '/docs' },
      { title: 'Quickstart', href: '/docs/quickstart/' },
      { title: 'Install', href: '/docs/install/' },
    ];
  }
}

export const docsNav = getDocsNav();
export const firstDocsHref = docsNav[0]?.href ?? '/docs';
