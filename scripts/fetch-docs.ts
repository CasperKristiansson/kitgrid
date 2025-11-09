#!/usr/bin/env node
import {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { request as httpsRequest } from 'node:https';

import tar from 'tar';

import registry from '../registry.json' with { type: 'json' };

interface CliArgs {
  project: string;
  source?: string;
  ref?: string;
  docsPath?: string;
  repo?: string;
  registryPath?: string;
}

type RegistryEntry = (typeof registry)[number];

interface CacheMetadata {
  project: string;
  ref: string;
  source: string;
  sourceType: 'local' | 'tarball';
  repo?: string;
  docsPath: string;
  cachedAt: string;
}

const CACHE_ROOT = resolve('.kitgrid-cache/docs');
const TAR_ROOT = resolve('.kitgrid-cache/tarballs');
const EXTRACT_ROOT = resolve('.kitgrid-cache/tmp');

function workspaceDirFromEntry(entry?: RegistryEntry) {
  if (!entry?.workspace || !entry.sync_docs) return null;
  const parts = entry.workspace.split('/');
  const name = parts.at(-1);
  if (!name) return null;
  return resolve('apps', name);
}

function touchGitkeep(targetDir: string) {
  writeFileSync(join(targetDir, '.gitkeep'), '', { flag: 'w' });
}

function syncWorkspaceDocs(entry: RegistryEntry | undefined, cacheDir: string, ref: string) {
  if (!entry?.sync_docs) return;
  const workspaceDir = workspaceDirFromEntry(entry);
  if (!workspaceDir) return;
  const docsTarget = join(workspaceDir, 'src', 'content', 'docs');
  rmSync(docsTarget, { recursive: true, force: true });
  copySource(cacheDir, docsTarget);
  touchGitkeep(docsTarget);
  console.log(`Synced docs for ${entry.id}@${ref} into ${docsTarget}`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { project: '' };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--') continue;
    switch (token) {
      case '--project':
      case '-p':
        args.project = argv[i + 1] ?? '';
        i += 1;
        break;
      case '--source':
      case '-s':
        args.source = argv[i + 1];
        i += 1;
        break;
      case '--ref':
      case '-r':
        args.ref = argv[i + 1];
        i += 1;
        break;
      case '--docs-path':
        args.docsPath = argv[i + 1];
        i += 1;
        break;
      case '--repo':
        args.repo = argv[i + 1];
        i += 1;
        break;
      case '--registry':
        args.registryPath = argv[i + 1];
        i += 1;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
      default:
        if (!token.startsWith('-') && !args.source) {
          args.source = token;
        } else if (!token.startsWith('-') && !args.project) {
          args.project = token;
        } else {
          throw new Error(`Unknown argument: ${token}`);
        }
    }
  }

  if (!args.project) {
    throw new Error('Missing required --project <id> argument.');
  }

  return args;
}

function printUsage() {
  console.log(`Usage: pnpm docs:fetch -- --project <id> [--ref <ref>] [--source <path>]
               [--docs-path <dir>] [--repo org/name]

Examples:
  pnpm docs:fetch -- --project pydantic-fixturegen --ref main
  pnpm docs:fetch -- --project demo --source ../demo/docs
`);
}

function ensureDir(pathToCreate: string) {
  mkdirSync(pathToCreate, { recursive: true });
}

function ensureParentDirs(targetPath: string) {
  ensureDir(dirname(targetPath));
}

function cleanDir(targetPath: string) {
  rmSync(targetPath, { recursive: true, force: true });
  ensureDir(targetPath);
}

function copySource(sourceDir: string, destDir: string) {
  cpSync(sourceDir, destDir, { recursive: true, errorOnExist: false });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapCodeBlocks(markdown: string) {
  const fence = /```([\w-]+)?\n([\s\S]*?)```/g;
  return markdown.replace(fence, (_, __, body = '') => {
    const content = escapeHtml(body.replace(/\s+$/, ''));
    return (
      '<div class="mockup-code w-full">\n' +
      '  <pre data-prefix="$"><code>' +
      content +
      '</code></pre>\n' +
      '</div>'
    );
  });
}

function transformDocs(dir: string) {
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!/\.(md|mdx)$/i.test(entry.name)) continue;
      const original = readFileSync(fullPath, 'utf8');
      if (!original.includes('```')) continue;
      const transformed = wrapCodeBlocks(original);
      if (transformed !== original) {
        writeFileSync(fullPath, transformed);
      }
    }
  }
}

function recordMetadata(destDir: string, metadata: CacheMetadata) {
  writeFileSync(join(destDir, '.kitgrid-docs.json'), JSON.stringify(metadata, null, 2));
}

function loadRegistryEntries(customPath?: string): RegistryEntry[] {
  if (!customPath) return registry as RegistryEntry[];
  const resolved = resolve(customPath);
  if (!existsSync(resolved)) {
    throw new Error(`Registry file not found: ${resolved}`);
  }
  const contents = readFileSync(resolved, 'utf8');
  return JSON.parse(contents) as RegistryEntry[];
}

function resolveProjectConfig(args: CliArgs, entry?: RegistryEntry) {
  const repo = args.repo ?? entry?.repo;
  if (!repo) {
    throw new Error(`Unknown repo for project ${args.project}. Pass --repo or update registry.`);
  }
  const docsPath = args.docsPath ?? entry?.docs_path ?? 'docs';
  const ref = args.ref ?? entry?.last_built_ref ?? entry?.default_ref ?? 'main';
  return { repo, docsPath, ref };
}

async function downloadTarball(repo: string, ref: string, token?: string) {
  ensureDir(TAR_ROOT);
  const safeName = repo.replace('/', '_');
  const tarPath = join(TAR_ROOT, `${safeName}-${ref}-${Date.now()}.tgz`);
  const url = `https://codeload.github.com/${repo}/tar.gz/${ref}`;

  const headers: Record<string, string> = {
    'User-Agent': 'kitgrid-docs-fetcher',
    Accept: 'application/octet-stream',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const req = httpsRequest(url, { headers }, (res) => {
      if (!res || (res.statusCode && res.statusCode >= 400)) {
        rejectPromise(
          new Error(`Download failed (${res?.statusCode ?? 'unknown'}) for ${url}`)
        );
        return;
      }
      const fileStream = createWriteStream(tarPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolvePromise();
      });
      fileStream.on('error', rejectPromise);
    });
    req.on('error', rejectPromise);
    req.end();
  });

  return tarPath;
}

async function extractTarball(archivePath: string) {
  const target = join(EXTRACT_ROOT, randomUUID());
  ensureDir(target);
  await tar.x({ file: archivePath, cwd: target, strip: 1 });
  return target;
}

async function fetchDocsFromRemote(
  project: string,
  repo: string,
  ref: string,
  docsPath: string,
  token?: string
) {
  const archive = await downloadTarball(repo, ref, token);
  const extracted = await extractTarball(archive);
  const docsDir = resolve(extracted, docsPath);
  if (!existsSync(docsDir)) {
    throw new Error(`Docs path ${docsPath} not found in repo ${repo}@${ref}`);
  }
  return { docsDir, archive, extracted };
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const registryEntries = loadRegistryEntries(args.registryPath);
    const entry = registryEntries.find((item) => item.id === args.project);

    if (args.source) {
      const ref = args.ref ?? entry?.last_built_ref ?? entry?.default_ref ?? 'local';
      const targetDir = resolve(CACHE_ROOT, args.project, ref);
      cleanDir(targetDir);
      const resolvedSource = resolve(args.source);
      if (!existsSync(resolvedSource)) {
        throw new Error(`Source path not found: ${resolvedSource}`);
      }
      const stats = statSync(resolvedSource);
      if (!stats.isDirectory()) {
        throw new Error('Source path must point to a directory with docs.');
      }
      copySource(resolvedSource, targetDir);
      transformDocs(targetDir);
      recordMetadata(targetDir, {
        project: args.project,
        ref,
        source: resolvedSource,
        sourceType: 'local',
        docsPath: resolvedSource,
        cachedAt: new Date().toISOString(),
      });
      syncWorkspaceDocs(entry, targetDir, ref);
      console.log(`Cached docs for ${args.project}@${ref} from ${resolvedSource}`);
      return;
    }

    const { repo, docsPath, ref } = resolveProjectConfig(args, entry);
    const targetDir = resolve(CACHE_ROOT, args.project, ref);
    cleanDir(targetDir);
    const token = process.env.KITGRID_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
    const { docsDir, archive, extracted } = await fetchDocsFromRemote(
      args.project,
      repo,
      ref,
      docsPath,
      token
    );
    copySource(docsDir, targetDir);
    transformDocs(targetDir);
    recordMetadata(targetDir, {
      project: args.project,
      ref,
      source: archive,
      sourceType: 'tarball',
      repo,
      docsPath,
      cachedAt: new Date().toISOString(),
    });
    syncWorkspaceDocs(entry, targetDir, ref);
    console.log(`Cached docs for ${args.project}@${ref} from ${repo}`);
    rmSync(extracted, { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`docs:fetch failed — ${message}`);
    printUsage();
    process.exit(1);
  }
}

void (async () => {
  await main();
})();
