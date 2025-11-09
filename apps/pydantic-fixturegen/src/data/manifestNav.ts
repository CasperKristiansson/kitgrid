import type { ManifestNavItem } from '../../../../scripts/lib/sidebar-builder';

export const manifestNav: ManifestNavItem[] = [
  { title: 'Overview', path: 'index.md' },
  {
    title: 'Getting started',
    path: 'quickstart.md',
    children: [
      { title: 'Install', path: 'install.md' },
      { title: 'Features', path: 'features.md' },
    ],
  },
  {
    title: 'Workflow',
    path: 'cli.md',
    children: [
      { title: 'CLI reference', path: 'cli.md' },
      { title: 'Cookbook', path: 'cookbook.md' },
      { title: 'Configuration', path: 'configuration.md' },
    ],
  },
  {
    title: 'Generation internals',
    path: 'discovery.md',
    children: [
      { title: 'Discovery', path: 'discovery.md' },
      { title: 'Emitters', path: 'emitters.md' },
      { title: 'Providers', path: 'providers.md' },
      { title: 'Strategies', path: 'strategies.md' },
    ],
  },
  {
    title: 'Quality + testing',
    path: 'doctor.md',
    children: [
      { title: 'Doctor', path: 'doctor.md' },
      { title: 'Testing helpers', path: 'testing.md' },
      { title: 'Seeds & presets', path: 'seeds.md' },
    ],
  },
  {
    title: 'Reference',
    path: 'api.md',
    children: [
      { title: 'API', path: 'api.md' },
      { title: 'Output paths', path: 'output-paths.md' },
      { title: 'Security', path: 'security.md' },
      { title: 'Troubleshooting', path: 'troubleshooting.md' },
    ],
  },
];
