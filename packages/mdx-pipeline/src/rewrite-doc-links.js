import { dirname, relative, resolve } from 'node:path';

import { visit } from 'unist-util-visit';

function normalizeSlug(value) {
  return value
    .split(/\\+/g)
    .join('/')
    .replace(/^\/+|\/+$/g, '');
}

function withoutExtension(value) {
  return value.replace(/\.(mdx?)$/i, '');
}

function cleanBase(basePath) {
  if (!basePath) return '/docs';
  const trimmed = basePath.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

export function remarkRewriteDocLinks(options = {}) {
  const { basePath = '/docs', docsRoot = 'src/content/docs' } = options;
  const resolvedRoot = docsRoot.startsWith('/') ? docsRoot : resolve(process.cwd(), docsRoot);
  const cleanedBase = cleanBase(basePath);

  return function rewriteDocLinks(tree, file) {
    const filePath = typeof file?.path === 'string' ? file.path : '';
    const currentDir = filePath ? dirname(filePath) : resolvedRoot;

    visit(tree, 'link', (node) => {
      if (!node?.url || typeof node.url !== 'string') return;
      const rawUrl = node.url.trim();
      if (!rawUrl) return;
      if (/^(https?:|mailto:|#)/i.test(rawUrl)) return;
      if (!/\.mdx?($|#)/i.test(rawUrl)) return;

      const [pathPart = '', hash = ''] = rawUrl.split('#');
      const normalizedPath = pathPart.replace(/\\+/g, '/');
      const resolvedTarget = normalizedPath.startsWith('/')
        ? resolve(resolvedRoot, normalizedPath.slice(1))
        : resolve(currentDir, normalizedPath);

      let relativeTarget = normalizeSlug(relative(resolvedRoot, resolvedTarget));
      if (!relativeTarget && normalizedPath.startsWith('/')) {
        relativeTarget = '';
      }
      if (relativeTarget.startsWith('..')) return;
      relativeTarget = withoutExtension(relativeTarget);

      if (relativeTarget === 'index') {
        relativeTarget = '';
      } else if (relativeTarget.endsWith('/index')) {
        relativeTarget = relativeTarget.slice(0, -'/index'.length);
      }

      const hrefPath = relativeTarget ? `${cleanedBase}/${relativeTarget}/` : `${cleanedBase}/`;
      const fragment = hash ? `#${hash}` : '';
      node.url = `${hrefPath}${fragment}`;
    });
  };
}
