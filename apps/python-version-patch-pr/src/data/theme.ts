import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import YAML from 'yaml';

const defaultTheme = {
  primary: '#0B5FFF',
  secondary: '#1F2937',
  bg: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#0F172A',
  muted: '#6B7280',
  link: '#0B5FFF',
  code_theme: 'kitgrid-light',
  motion: 'subtle',
};

function loadThemeFromManifest() {
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const manifestPath = resolve(
      currentDir,
      '../../../../.kitgrid-cache/docs/python-version-patch-pr/main/kitgrid.yaml',
    );
    const file = readFileSync(manifestPath, 'utf8');
    const parsed = YAML.parse(file);
    return { ...defaultTheme, ...(parsed?.theme ?? {}) };
  } catch (error) {
    console.warn('Failed to load kitgrid theme manifest, falling back to defaults.', error);
    return defaultTheme;
  }
}

export const projectTheme = loadThemeFromManifest();
