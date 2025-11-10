// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkKitgridGuard, remarkRewriteDocLinks } from '@kitgrid/mdx-pipeline';
import rehypeWrapCodeBlocks from '@kitgrid/docs-ui/rehype/rehypeWrapCodeBlocks.js';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// https://astro.build/config
const docRemarkPlugins = [
  [remarkRewriteDocLinks, { basePath: '/docs', docsRoot: 'src/content/docs' }],
  [remarkKitgridGuard, { allowHtml: true }],
];
const docRehypePlugins = [rehypeWrapCodeBlocks];

function copySitemapIntegration() {
  return {
    name: 'kitgrid-copy-sitemap',
    hooks: {
      /**
       * @param {{ dir: URL }} options
       */
      'astro:build:done'(options) {
        const { dir } = options;
        const outDir = fileURLToPath(dir);
        const sitemapChunk = join(outDir, 'sitemap-0.xml');
        const sitemapIndex = join(outDir, 'sitemap-index.xml');
        const sitemapXml = join(outDir, 'sitemap.xml');
        if (existsSync(sitemapChunk)) {
          copyFileSync(sitemapChunk, sitemapXml);
        } else if (existsSync(sitemapIndex)) {
          copyFileSync(sitemapIndex, sitemapXml);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://python-version-patch-pr.kitgrid.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx({
      remarkPlugins: /** @type {any} */ (docRemarkPlugins),
      rehypePlugins: /** @type {any} */ (docRehypePlugins),
      syntaxHighlight: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/drafts'),
    }),
    copySitemapIntegration(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: /** @type {any} */ (docRemarkPlugins),
    rehypePlugins: /** @type {any} */ (docRehypePlugins),
  },
});
