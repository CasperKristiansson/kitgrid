import type { MDXComponents } from 'astro/types';

import Callout from './Callout.astro';
import CodeBlock from './CodeBlock.astro';
import Tabs from './Tabs.astro';

export const mdxComponents: MDXComponents = {
  Callout,
  Tabs,
  CodeBlock,
  pre: CodeBlock,
};
