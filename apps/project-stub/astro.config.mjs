// @ts-check
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard } from '@kitgrid/mdx-pipeline';
import rehypeWrapCodeBlocks from '@kitgrid/docs-ui/rehype/rehypeWrapCodeBlocks.js';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs-stub.kitgrid.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx({
      remarkPlugins: [[remarkKitgridGuard, { allowHtml: true }]],
      rehypePlugins: [rehypeWrapCodeBlocks],
      syntaxHighlight: false,
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [[remarkKitgridGuard, { allowHtml: true }]],
    rehypePlugins: [rehypeWrapCodeBlocks],
  },
});
