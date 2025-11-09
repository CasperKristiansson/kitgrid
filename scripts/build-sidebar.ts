#!/usr/bin/env node
import { resolve } from 'node:path';

import { buildSidebar } from './lib/sidebar-builder.js';

const docsRoot = process.argv[2] ? resolve(process.argv[2]) : resolve('apps/project-stub/src/content/docs');

const { nav, redirects } = buildSidebar({ docsRoot, basePath: '/docs' });

console.log(JSON.stringify({ nav, redirects }, null, 2));
