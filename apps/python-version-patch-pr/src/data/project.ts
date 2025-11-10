import { projectTheme } from './theme';

const DEFAULT_REF = 'main';

const envRef = process.env.KITGRID_DOCS_REF ?? process.env.PROJECT_REF ?? DEFAULT_REF;

export const project = {
  id: 'python-version-patch-pr',
  name: 'python-version-patch-pr',
  repo: 'CasperKristiansson/python-version-patch-pr',
  docsPath: 'docs',
  buildRef: envRef,
  theme: projectTheme,
};
