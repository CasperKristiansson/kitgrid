import rawRegistry from '../../../../registry.json' assert { type: 'json' };

export type ProjectStatus = 'live' | 'in-progress' | 'design';

type RegistryEntry = {
  id: string;
  name: string;
  description: string;
  repo: string;
  status: ProjectStatus;
  tag: string;
  subdomain: string;
  default_ref: string;
  last_built_ref?: string | null;
  docs_path?: string;
  docs_url?: string | null;
};

export type ProjectMeta = {
  id: string;
  name: string;
  description: string;
  repo: string;
  status: ProjectStatus;
  tag: string;
  subdomain: string;
  defaultRef: string;
  lastBuiltRef?: string;
  docsPath?: string;
  docsUrl?: string;
};

const registry = rawRegistry as RegistryEntry[];

export const featuredProjects: ProjectMeta[] = registry.map((entry) => ({
  id: entry.id,
  name: entry.name,
  description: entry.description,
  repo: entry.repo,
  status: entry.status,
  tag: entry.tag,
  subdomain: entry.subdomain,
  defaultRef: entry.default_ref,
  lastBuiltRef: entry.last_built_ref ?? undefined,
  docsPath: entry.docs_path,
  docsUrl: entry.docs_url ?? undefined,
}));
