import type { ManifestNavItem } from '../../../../scripts/lib/sidebar-builder';

export const manifestNav: ManifestNavItem[] = [
  {
    title: 'Getting started',
    path: 'quickstart.md',
    children: [
      { title: 'Quickstart', path: 'quickstart.md' },
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
    title: 'Command guides',
    path: 'commands/index.md',
    children: [
      {
        title: 'Discovery & auditing',
        path: 'commands/pfg-list.md',
        children: [
          { title: 'pfg list', path: 'commands/pfg-list.md' },
          { title: 'pfg doctor', path: 'commands/pfg-doctor.md' },
          { title: 'pfg check', path: 'commands/pfg-check.md' },
        ],
      },
      {
        title: 'Generation',
        path: 'commands/pfg-gen-json.md',
        children: [
          { title: 'pfg gen json', path: 'commands/pfg-gen-json.md' },
          { title: 'pfg gen dataset', path: 'commands/pfg-gen-dataset.md' },
          { title: 'pfg gen fixtures', path: 'commands/pfg-gen-fixtures.md' },
          { title: 'pfg gen schema', path: 'commands/pfg-gen-schema.md' },
          { title: 'pfg gen examples', path: 'commands/pfg-gen-examples.md' },
          { title: 'pfg gen openapi', path: 'commands/pfg-gen-openapi.md' },
          { title: 'pfg gen strategies', path: 'commands/pfg-gen-strategies.md' },
          { title: 'pfg gen polyfactory', path: 'commands/pfg-gen-polyfactory.md' },
          { title: 'pfg gen explain', path: 'commands/pfg-gen-explain.md' },
          { title: 'pfg gen seed sqlmodel', path: 'commands/pfg-gen-seed-sqlmodel.md' },
          { title: 'pfg gen seed beanie', path: 'commands/pfg-gen-seed-beanie.md' },
        ],
      },
      {
        title: 'Integrations & sanitization',
        path: 'commands/pfg-anonymize.md',
        children: [
          { title: 'pfg anonymize', path: 'commands/pfg-anonymize.md' },
          { title: 'pfg fastapi smoke', path: 'commands/pfg-fastapi-smoke.md' },
          { title: 'pfg fastapi serve', path: 'commands/pfg-fastapi-serve.md' },
        ],
      },
      {
        title: 'Pipelines & CI',
        path: 'commands/pfg-diff.md',
        children: [
          { title: 'pfg diff', path: 'commands/pfg-diff.md' },
          { title: 'pfg snapshot verify', path: 'commands/pfg-snapshot-verify.md' },
          { title: 'pfg snapshot write', path: 'commands/pfg-snapshot-write.md' },
          { title: 'pfg lock', path: 'commands/pfg-lock.md' },
          { title: 'pfg verify', path: 'commands/pfg-verify.md' },
        ],
      },
      {
        title: 'Project setup',
        path: 'commands/pfg-init.md',
        children: [
          { title: 'pfg init', path: 'commands/pfg-init.md' },
          { title: 'pfg plugin', path: 'commands/pfg-plugin.md' },
          { title: 'pfg schema config', path: 'commands/pfg-schema-config.md' },
        ],
      },
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
