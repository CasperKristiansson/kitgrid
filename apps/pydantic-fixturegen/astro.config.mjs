// @ts-check
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard, remarkRewriteDocLinks } from '@kitgrid/mdx-pipeline';
import rehypeWrapCodeBlocks from '@kitgrid/docs-ui/rehype/rehypeWrapCodeBlocks.js';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
const docRemarkPlugins = [
  [remarkRewriteDocLinks, { basePath: '/docs', docsRoot: 'src/content/docs' }],
  [remarkKitgridGuard, { allowHtml: true }],
];
const docRehypePlugins = [rehypeWrapCodeBlocks];

export default defineConfig({
  site: 'https://pydantic-fixturegen.kitgrid.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx({
      remarkPlugins: /** @type {any} */ (docRemarkPlugins),
      rehypePlugins: /** @type {any} */ (docRehypePlugins),
      syntaxHighlight: false,
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: /** @type {any} */ (docRemarkPlugins),
    rehypePlugins: /** @type {any} */ (docRehypePlugins),
  },
});
