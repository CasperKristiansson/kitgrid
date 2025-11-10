import { projectTheme } from './theme';

const DEFAULT_REF = 'main';

const envRef = process.env.KITGRID_DOCS_REF ?? process.env.PROJECT_REF ?? DEFAULT_REF;

export const project = {
  id: 'pydantic-fixturegen',
  name: 'pydantic-fixturegen',
  repo: 'CasperKristiansson/pydantic-fixturegen',
  docsPath: 'docs',
  buildRef: envRef,
  theme: projectTheme,
};
