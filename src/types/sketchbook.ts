import { FreeVerseRef } from './freebook';

export type SketchFontFamily = 'serif' | 'sans' | 'handwriting' | 'mono';
export type SketchFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type SketchPagePattern = 'cornell' | 'grid' | 'dots' | 'blank';
export type SketchDrawingTool = 'pen' | 'highlighter' | 'eraser' | 'arrow' | 'rect' | 'circle' | 'select';

export interface SketchDrawingPoint {
  x: number;
  y: number;
}

export interface SketchDrawingStroke {
  id: string;
  tool: SketchDrawingTool;
  color: string;
  width: number;
  points: SketchDrawingPoint[];
}

export interface SketchTextBlock {
  id: string;
  title?: string;
  content: string;
  fontFamily: SketchFontFamily;
  fontSize: SketchFontSize;
  bold?: boolean;
  italic?: boolean;
  color: string;
  verseRef?: FreeVerseRef;
  createdAt: string;
}

export interface SketchPage {
  id: string;
  pageNumber: number;
  title: string;
  subject: string;
  date: string;
  pattern: SketchPagePattern;
  cueNotes: string; // Para la columna izquierda estilo Cornell ("Ideas clave / Palabras clave")
  summary: string;  // Para el bloque inferior estilo Cornell ("Resumen teológico")
  blocks: SketchTextBlock[];
  strokes: SketchDrawingStroke[];
}

export interface SketchbookStateData {
  pages: SketchPage[];
  activePageIndex: number;
}
