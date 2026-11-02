import { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../../types/bible';

export interface IBibleService {
  /**
   * Obtiene la lista completa de libros canónicos disponibles
   */
  getBooks(): Promise<BibleBook[]>;

  /**
   * Obtiene los versículos de un capítulo específico para una versión bíblica dada
   */
  getChapter(bookId: string, chapter: number, version: BibleVersion): Promise<BibleChapter>;

  /**
   * Obtiene un versículo individual específico
   */
  getVerse(bookId: string, chapter: number, verse: number, version: BibleVersion): Promise<BibleVerse | null>;

  /**
   * Búsqueda simple de versículos por palabra clave
   */
  searchVerses(query: string, version: BibleVersion): Promise<BibleVerse[]>;
}

// TODO: Integrar API YouVersion aquí
// Cuando se disponga de las credenciales de YouVersion Developer Platform (o RapidAPI Bible API):
// export class YouVersionBibleService implements IBibleService {
//   private apiKey: string;
//   constructor(apiKey: string) { this.apiKey = apiKey; }
//   async getBooks(): Promise<BibleBook[]> { ... }
//   async getChapter(bookId: string, chapter: number, version: BibleVersion): Promise<BibleChapter> { ... }
//   ...
// }
