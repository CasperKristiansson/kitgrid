// @ts-check
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard } from '@kitgrid/mdx-pipeline';
import rehypeWrapCodeBlocks from '@kitgrid/docs-ui/rehype/rehypeWrapCodeBlocks.js';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs-stub.kitgrid.dev',
  integrations: [
    mdx({
      remarkPlugins: [remarkKitgridGuard],
      rehypePlugins: [rehypeWrapCodeBlocks],
      syntaxHighlight: false,
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkKitgridGuard],
    rehypePlugins: [rehypeWrapCodeBlocks],
  },
});
