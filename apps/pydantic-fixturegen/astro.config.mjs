// @ts-check
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard, remarkRewriteDocLinks } from '@kitgrid/mdx-pipeline';
import { defineConfig } from 'astro/config';

// https://astro.build/config
const docRemarkPlugins = [
  [remarkRewriteDocLinks, { basePath: '/docs', docsRoot: 'src/content/docs' }],
  remarkKitgridGuard,
];

export default defineConfig({
  site: 'https://pydantic-fixturegen.kitgrid.dev',
  integrations: [
    mdx({
      remarkPlugins: /** @type {any} */ (docRemarkPlugins),
    }),
  ],
  markdown: {
    remarkPlugins: /** @type {any} */ (docRemarkPlugins),
  },
});
