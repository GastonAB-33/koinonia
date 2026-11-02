import { BibleVersion } from './bible';

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export type FreeDrawingTool = 'pen' | 'highlighter' | 'eraser' | 'select';

export interface DrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  width: number;
  points: DrawingPoint[];
}

export interface FreeVerseRef {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  version: BibleVersion;
  text: string;
}

export interface FreeBlock {
  id: string;
  type: 'verse' | 'note';
  title?: string; // Palabra destacada como "DERRIBANDO" en el ejemplo
  content: string; // Cuerpo del versículo o texto libre
  verseRef?: FreeVerseRef;
  createdAt: string;
}

export interface FreeBookStateData {
  strokes: DrawingStroke[];
  blocks: FreeBlock[];
}
