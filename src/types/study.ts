import { BibleVersion } from './bible';

export interface VerseReference {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  version: BibleVersion;
  text: string;
}

export type NoteBlockType = 'text' | 'verse_quote' | 'heading' | 'theological_insight' | 'reflection';

export interface StudyBlock {
  id: string;
  type: NoteBlockType;
  content: string; // text, markdown, or reflection text
  verseRef?: VerseReference;
  createdAt: string;
}

export interface Study {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string; // "Alejandro" or "Esposa" for collaborative note
  blocks: StudyBlock[];
}
