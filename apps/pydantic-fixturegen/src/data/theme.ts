import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import YAML from 'yaml';

const defaultTheme = {
  primary: '#1D4ED8',
  secondary: '#1D4ED8',
  bg: '#FFFFFF',
  surface: '#F5F7FB',
  text: '#0B0F14',
  muted: '#6B7280',
  link: '#1D4ED8',
  code_theme: 'kitgrid-light',
  motion: 'subtle',
};

function loadThemeFromManifest() {
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const manifestPath = resolve(
      currentDir,
      '../../../../.kitgrid-cache/docs/pydantic-fixturegen/main/kitgrid.yaml',
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
