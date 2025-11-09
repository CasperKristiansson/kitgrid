import type { DocsNavItem } from '@kitgrid/docs-ui';

export const docsNav: DocsNavItem[] = [
  {
    title: 'Overview',
    href: '#overview',
  },
  {
    title: 'Manifest',
    href: '#manifest',
    children: [
      { title: 'Metadata', href: '#manifest-metadata' },
      { title: 'Theme tokens', href: '#manifest-theme' },
      { title: 'Refs', href: '#manifest-refs' },
    ],
  },
  {
    title: 'Build pipeline',
    href: '#pipeline',
    children: [
      { title: 'Ingestion', href: '#pipeline-ingestion' },
      { title: 'Security', href: '#pipeline-security' },
    ],
  },
  {
    title: 'Deploy',
    href: '#deploy',
  },
];
