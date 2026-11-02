import { Node, Edge } from '@xyflow/react';
import { BibleVersion } from './bible';

export interface VerseNodeData extends Record<string, unknown> {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  version: BibleVersion;
  text: string;
  themeColor?: string;
  userNotes?: string;
}

export interface ConceptNodeData extends Record<string, unknown> {
  title: string;
  category: 'Doctrina' | 'Tipología' | 'Contexto Histórico' | 'Pregunta' | 'Principio Práctico';
  description: string;
  tags?: string[];
  color?: string;
}

export interface StickyNodeData extends Record<string, unknown> {
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  author?: string;
}

export type VerseCustomNode = Node<VerseNodeData, 'verseNode'>;
export type ConceptCustomNode = Node<ConceptNodeData, 'conceptNode'>;
export type StickyCustomNode = Node<StickyNodeData, 'stickyNode'>;

export type CanvasCustomNode = VerseCustomNode | ConceptCustomNode | StickyCustomNode;

export interface CanvasState {
  nodes: CanvasCustomNode[];
  edges: Edge[];
}
