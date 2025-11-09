// @ts-check
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard } from '@kitgrid/mdx-pipeline';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs-stub.kitgrid.dev',
  integrations: [
    mdx({
      remarkPlugins: [remarkKitgridGuard],
    }),
  ],
});
