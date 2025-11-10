import type { DocsNavItem } from '@kitgrid/docs-ui';

export const landingNav: DocsNavItem[] = [
  { title: 'Overview', href: '#overview' },
  {
    title: 'First pass',
    href: '#first-pass',
    children: [
      { title: 'Quickstart', href: '#first-pass' },
      { title: 'Install', href: '#first-pass' },
      { title: 'Feature tour', href: '#first-pass' },
    ],
  },
  {
    title: 'Daily workflows',
    href: '#daily-workflows',
    children: [
      { title: 'CLI', href: '#daily-workflows' },
      { title: 'Config', href: '#daily-workflows' },
      { title: 'Cookbook', href: '#daily-workflows' },
    ],
  },
  {
    title: 'Quality systems',
    href: '#quality-systems',
  },
  {
    title: 'Reference',
    href: '#reference',
  },
];
