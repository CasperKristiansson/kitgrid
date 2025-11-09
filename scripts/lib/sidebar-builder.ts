import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import matter from 'gray-matter';

import type { DocsNavItem } from '../../packages/docs-ui/src/types.js';

export type ManifestNavItem = {
  title: string;
  path: string;
  children?: ManifestNavItem[];
};

export interface BuildSidebarOptions {
  docsRoot: string;
  basePath?: string;
  manifestNav?: ManifestNavItem[];
}

export interface SidebarBuildResult {
  nav: DocsNavItem[];
  redirects: Record<string, string>;
}

interface FileEntry {
  segments: string[];
  href: string;
  title: string;
  order: number;
  redirectFrom: string[];
}

interface InternalNode {
  title: string;
  href: string;
  order: number;
  children?: InternalNode[];
  __segment: string;
  __isSection?: boolean;
}

function normalizeBasePath(path: string) {
  if (!path) return '/docs';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.replace(/\\/g, '/').replace(/\/+$/, '');
}

function ensureTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

function slugifyPath(relativePath: string) {
  const noExt = relativePath.replace(/\.(md|mdx)$/i, '');
  if (noExt === 'index') return '';
  if (noExt.endsWith('/index')) {
    return noExt.slice(0, -'/index'.length);
  }
  return noExt;
}

function titleFromSlug(slug: string) {
  if (!slug) return 'Overview';
  return slug
    .split('/')
    .pop()
    ?.replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) ?? slug;
}

function normalizeHref(basePath: string, slug: string) {
  const prefix = normalizeBasePath(basePath);
  const combined = slug ? `${prefix}/${slug}` : prefix;
  const cleaned = combined.replace(/\\/g, '/').replace(/\/+$/g, '');
  return ensureTrailingSlash(cleaned);
}

function normalizeRedirect(basePath: string, path: string) {
  if (!path) return normalizeHref(basePath, '');
  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return normalizeHref(basePath, trimmed);
}

function collectFiles(docsRoot: string, basePath: string) {
  const entries: FileEntry[] = [];
  const redirects: Record<string, string> = {};
  const root = resolve(docsRoot);

  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new Error(`Docs root not found: ${root}`);
  }

  function walk(current: string) {
    const dirEntries = readdirSync(current, { withFileTypes: true });
    for (const dirent of dirEntries) {
      const fullPath = join(current, dirent.name);
      if (dirent.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!/\.(md|mdx)$/i.test(dirent.name)) {
        continue;
      }
      const rel = relative(root, fullPath).replace(/\\/g, '/');
      const slug = slugifyPath(rel);
      const segments = slug ? slug.split('/') : [];
      const fileContents = readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      const fm = data ?? {};
      if (fm.draft === true) continue;
      const title = typeof fm.title === 'string' ? fm.title : titleFromSlug(slug);
      const order = Number.isFinite(fm.order) ? Number(fm.order) : 0;
      const href = normalizeHref(basePath, slug);
      const redirectRaw = Array.isArray(fm.redirect_from)
        ? fm.redirect_from
        : fm.redirect_from
          ? [fm.redirect_from]
          : [];
      const redirectFrom = redirectRaw
        .map((value) => (typeof value === 'string' ? value : null))
        .filter((value): value is string => Boolean(value));
      redirectFrom.forEach((from) => {
        redirects[normalizeRedirect(basePath, from)] = href;
      });
      entries.push({ segments, href, title, order, redirectFrom });
    }
  }

  walk(root);

  return { entries, redirects };
}

function createNode(entry: FileEntry, segment: string): InternalNode {
  return {
    title: entry.title,
    href: entry.href,
    order: entry.order,
    __segment: segment,
  };
}

function insertNode(
  nodes: InternalNode[],
  entry: FileEntry,
  segments: string[],
  basePath: string,
  prefix: string[] = []
) {
  if (segments.length === 0) {
    nodes.push(createNode(entry, 'index'));
    return;
  }

  if (segments.length === 1) {
    const segment = segments[0];
    const existing = nodes.find((node) => node.__segment === segment && !node.__isSection);
    if (existing) {
      existing.title = entry.title;
      existing.href = entry.href;
      existing.order = Math.min(existing.order, entry.order);
      return;
    }
    nodes.push(createNode(entry, segment));
    return;
  }

  const [head, ...rest] = segments;
  const sectionPath = [...prefix, head].join('/');
  let section = nodes.find((node) => node.__segment === head);
  if (!section) {
    section = {
      title: titleFromSlug(head),
      href: normalizeHref(basePath, sectionPath),
      order: entry.order,
      __segment: head,
      __isSection: true,
      children: [],
    };
    nodes.push(section);
  } else {
    section.__isSection = true;
    section.order = Math.min(section.order, entry.order);
    section.children = section.children ?? [];
  }
  insertNode(section.children!, entry, rest, basePath, [...prefix, head]);
}

function sortNodes(nodes: InternalNode[]) {
  nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  nodes.forEach((node) => {
    if (node.children?.length) {
      sortNodes(node.children);
    }
  });
}

function stripNodes(nodes: InternalNode[]): DocsNavItem[] {
  return nodes.map((node) => ({
    title: node.title,
    href: node.href,
    children: node.children ? stripNodes(node.children) : undefined,
  }));
}

function cleanManifestPath(path: string) {
  if (!path) return '';
  return path.replace(/^\/+/, '').replace(/\.(md|mdx)$/i, '');
}

function buildFromManifest(items: ManifestNavItem[], basePath: string): DocsNavItem[] {
  return items.map((item) => ({
    title: item.title,
    href: normalizeHref(basePath, cleanManifestPath(item.path ?? '')),
    children: item.children ? buildFromManifest(item.children, basePath) : undefined,
  }));
}

export function buildSidebar(options: BuildSidebarOptions): SidebarBuildResult {
  const basePath = options.basePath ?? '/docs';
  const docsRoot = resolve(options.docsRoot);
  const { entries, redirects } = collectFiles(docsRoot, basePath);

  if (options.manifestNav?.length) {
    return {
      nav: buildFromManifest(options.manifestNav, basePath),
      redirects,
    };
  }

  const nodes: InternalNode[] = [];

  entries.forEach((entry) => {
    insertNode(nodes, entry, entry.segments, basePath);
  });

  sortNodes(nodes);

  return {
    nav: stripNodes(nodes),
    redirects,
  };
}
