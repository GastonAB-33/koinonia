export type ThemeId =
  | 'aesthetic-pastel'
  | 'minimalist-vertical'
  | 'bullet-journal'
  | 'dark'
  | 'dark-blackout';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'Aesthetic' | 'Minimalista' | 'Planner' | 'Oscuro';
  palettePreview: string[]; // 3 o 4 colores hex representativos
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'aesthetic-pastel',
    name: 'Aesthetic Pastel',
    tagline: 'Paleta Sage, Mostaza & Olivo',
    category: 'Aesthetic',
    palettePreview: ['#B7D6D9', '#C4BC7B', '#88804B'],
    description: 'Inspirado en la paleta suave: celeste pastel (#B7D6D9), mostaza olivo (#C4BC7B) y verde musgo (#88804B).'
  },
  {
    id: 'minimalist-vertical',
    name: 'Minimalista Vertical',
    tagline: 'Líneas finas, pulcritud y claridad',
    category: 'Minimalista',
    palettePreview: ['#ffffff', '#f1f5f9', '#475569', '#0f172a'],
    description: 'Diseño sobrio y moderno con líneas sutiles, fondo blanco puro y tipografía neutral equilibrada.'
  },
  {
    id: 'bullet-journal',
    name: 'Bullet Journal / Cornell',
    tagline: 'Papel marfil, cuadrícula y pestañas',
    category: 'Planner',
    palettePreview: ['#f8f4ec', '#e9dfd0', '#c29b38', '#4a3b2c'],
    description: 'Estilo libreta digital de estudio con cuadrícula suave, textura de papel craft y pestañas de índice.'
  },
  {
    id: 'dark',
    name: 'Modo Oscuro',
    tagline: 'Carbón y descanso visual nocturno',
    category: 'Oscuro',
    palettePreview: ['#0f172a', '#1e293b', '#38bdf8', '#f8fafc'],
    description: 'Paleta nocturna en tonos slate y azul celeste para prolongar el estudio con menor fatiga visual.'
  },
  {
    id: 'dark-blackout',
    name: 'Dark Mode Blackout',
    tagline: 'Negro puro OLED y alto contraste',
    category: 'Oscuro',
    palettePreview: ['#000000', '#121212', '#22c55e', '#ffffff'],
    description: 'Negro profundo (#000000) de máximo contraste con acentos vibrantes.'
  }
];
