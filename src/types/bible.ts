export type BibleVersion = 'RVR1960' | 'RVR1909' | 'NVI' | 'DHH' | 'LBLA';

export type ReadingMode = 'split-vertical' | 'side-by-side' | 'single';

export interface StrongToken {
  word: string;
  strong: string;
}

export interface BibleVersionInfo {
  id: BibleVersion;
  name: string;
  abbreviation: string;
  year: number;
  description: string;
}

export type Testament = 'OT' | 'NT';

export interface BibleBook {
  id: string; // e.g., 'GEN', 'JHN', 'ROM'
  name: string;
  testament: Testament;
  chaptersCount: number;
  order: number;
}

export interface BibleVerse {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  version: BibleVersion;
  originalLanguage?: 'hebrew' | 'greek' | 'aramaic';
  strongTokens?: StrongToken[];
}

export interface BibleChapter {
  bookId: string;
  bookName: string;
  chapter: number;
  version: BibleVersion;
  verses: BibleVerse[];
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export interface Highlight {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: string;
  note?: string;
}

export interface CustomChapter {
  chapter: number;
  title: string;
  content: string;
  paragraphs: string[];
  createdAt: string;
}

export interface CustomBook {
  id: string;
  title: string;
  author?: string;
  description?: string;
  tags?: string[];
  chapters: CustomChapter[];
  createdAt: string;
  updatedAt: string;
}
