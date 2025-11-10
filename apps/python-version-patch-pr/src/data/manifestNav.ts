import type { ManifestNavItem } from '../../../../scripts/lib/sidebar-builder';

export const manifestNav: ManifestNavItem[] = [
  { title: 'Overview', path: 'README.md',
    children: [
      { title: 'Documentation portal', path: 'README.md' },
      { title: 'Workflow recipes', path: 'workflows.md' },
      { title: 'Examples & outputs', path: 'examples.md' }
    ]
  },
  { title: 'Architecture', path: 'architecture.md' },
  { title: 'Configuration', path: 'configuration.md' },
  { title: 'Development', path: 'development.md' },
  { title: 'Testing', path: 'testing.md' },
  { title: 'Troubleshooting', path: 'troubleshooting.md' }
];
