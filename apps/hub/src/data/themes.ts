export type ThemeTokens = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  link: string;
  code: string;
  motion: string;
};

export const themes: ThemeTokens[] = [
  {
    id: 'kitgrid',
    label: 'Kitgrid (core)',
    primary: '#60A5FA',
    secondary: '#6EE7F9',
    bg: '#0B0F16',
    surface: '#101627',
    text: '#E6EBF2',
    muted: '#8EA2C1',
    link: '#6EE7F9',
    code: '#1E293B',
    motion: '1',
  },
  {
    id: 'pydantic-fixturegen',
    label: 'pydantic-fixturegen',
    primary: '#14B8A6',
    secondary: '#67E8F9',
    bg: '#0A0F14',
    surface: '#0F1722',
    text: '#E5F4F1',
    muted: '#9AC7C0',
    link: '#2DD4BF',
    code: '#042F2E',
    motion: '0.9',
  },
  {
    id: 'docs-playground',
    label: 'Docs Playground',
    primary: '#F472B6',
    secondary: '#A78BFA',
    bg: '#0F0C1F',
    surface: '#17112E',
    text: '#F4F2FF',
    muted: '#BBB1E8',
    link: '#C084FC',
    code: '#1C1330',
    motion: '1.1',
  },
];
