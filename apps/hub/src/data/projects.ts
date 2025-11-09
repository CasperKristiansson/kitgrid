export type ProjectStatus = 'live' | 'in-progress' | 'design';

export type ProjectMeta = {
  id: string;
  name: string;
  description: string;
  repo: string;
  status: ProjectStatus;
  tag: string;
  docsUrl?: string;
};

export const featuredProjects: ProjectMeta[] = [
  {
    id: 'pydantic-fixturegen',
    name: 'pydantic-fixturegen',
    description:
      'Deterministic test data factories for Pydantic v2. Ships CLI, providers, and seeds.',
    repo: 'CasperKristiansson/pydantic-fixturegen',
    status: 'in-progress',
    tag: 'python',
  },
  {
    id: 'kitgrid-hub',
    name: 'Kitgrid Hub',
    description:
      'Marketing + multi-project index that orchestrates every docs deployment.',
    repo: 'kitgrid/hub',
    status: 'design',
    tag: 'astro',
  },
  {
    id: 'docs-playground',
    name: 'Docs Playground',
    description:
      'Reference implementation used to validate theming, navigation, and ingestion.',
    repo: 'kitgrid/docs-playground',
    status: 'in-progress',
    tag: 'playground',
  },
];
