import { BibleBook, BibleChapter, BibleVerse, BibleVersion } from '../../types/bible';
import { IBibleService } from './bibleService';
import { BIBLE_BOOKS, MOCK_CHAPTERS } from './mockBibleData';

/**
 * Cache en memoria para almacenar capítulos completos consultados
 */
const chaptersCache: Map<string, BibleChapter> = new Map();

/**
 * Mapeo de versiones del sistema a identificadores de traducción de la API bolls.life
 */
const BOLLS_TRANSLATION_MAP: Record<BibleVersion, string> = {
  RVR1960: 'RV1960',
  LBLA: 'LBLA',
  NVI: 'NTV', // NTV (Nueva Traducción Viviente) ofrece lenguaje contemporáneo de alta fidelidad
  DHH: 'PDT'  // PDT (Palabra de Dios para Todos) para lenguaje sencillo y dinámico
};

/**
 * BibleService híbrido de alta disponibilidad:
 * 1. Prioriza datos mock enriquecidos (Génesis 1, Juan 1, Romanos 8).
 * 2. Consulta la API pública y abierta de bolls.life para capítulos completos
 *    de todo el Antiguo y Nuevo Testamento (66 libros canónicos).
 * 3. En caso de fallo de red o modo offline, genera versículos estructurados de respaldo.
 */
export class MockBibleService implements IBibleService {
  async getBooks(): Promise<BibleBook[]> {
    // Simula una pequeña latencia realista
    await new Promise((resolve) => setTimeout(resolve, 60));
    return BIBLE_BOOKS;
  }

  async getChapter(bookId: string, chapter: number, version: BibleVersion): Promise<BibleChapter> {
    const cacheKey = `${bookId.toUpperCase()}_${chapter}_${version}`;
    if (chaptersCache.has(cacheKey)) {
      return chaptersCache.get(cacheKey)!;
    }

    const mockKey = `${bookId.toUpperCase()}_${chapter}`;
    const chapterData = MOCK_CHAPTERS[mockKey]?.[version];

    if (chapterData) {
      chaptersCache.set(cacheKey, chapterData);
      return chapterData;
    }

    const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === bookId.toUpperCase());
    const bookNumber = book ? book.order : null;
    const bookName = book ? book.name : bookId;
    const isOT = book ? book.testament === 'OT' : false;

    // Intento de conexión con la API pública de Bolls Life
    if (bookNumber) {
      try {
        const bollsTranslation = BOLLS_TRANSLATION_MAP[version] || 'RV1960';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(
          `https://bolls.life/get-chapter/${bollsTranslation}/${bookNumber}/${chapter}/`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const rawVerses: Array<{ verse: number; text: string }> = await response.json();
          if (Array.isArray(rawVerses) && rawVerses.length > 0) {
            const verses: BibleVerse[] = rawVerses.map((item) => ({
              bookId,
              chapter,
              verse: item.verse,
              version,
              originalLanguage: isOT ? 'hebrew' : 'greek',
              text: item.text.replace(/<[^>]*>/g, '').trim()
            }));

            const fetchedChapter: BibleChapter = {
              bookId,
              bookName,
              chapter,
              version,
              verses
            };

            chaptersCache.set(cacheKey, fetchedChapter);
            return fetchedChapter;
          }
        }
      } catch (error) {
        console.warn(`[BibleService] No se pudo obtener ${bookName} ${chapter} de la API remota. Usando generador local de respaldo.`, error);
      }
    }

    // Si no está precargado en el mock específico y no hay conexión, generamos versículos de respaldo
    // para que la interfaz nunca se rompa y permita navegar por toda la Biblia.
    const mockVerses: BibleVerse[] = Array.from({ length: 25 }, (_, i) => ({
      bookId,
      chapter,
      verse: i + 1,
      version,
      originalLanguage: isOT ? 'hebrew' : 'greek',
      text: `[${bookName} ${chapter}:${i + 1} (${version})] La palabra del Señor permanece para siempre, dando entendimiento a los humildes y alumbrando el camino de la verdad y la paz.`
    }));

    const fallbackChapter: BibleChapter = {
      bookId,
      bookName,
      chapter,
      version,
      verses: mockVerses
    };

    chaptersCache.set(cacheKey, fallbackChapter);
    return fallbackChapter;
  }

  async getVerse(bookId: string, chapter: number, verse: number, version: BibleVersion): Promise<BibleVerse | null> {
    const chapterData = await this.getChapter(bookId, chapter, version);
    return chapterData.verses.find((v) => v.verse === verse) || null;
  }

  async searchVerses(query: string, version: BibleVersion): Promise<BibleVerse[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const results: BibleVerse[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) return [];

    // Buscar primero en la memoria caché
    chaptersCache.forEach((chapter) => {
      if (chapter.version === version) {
        chapter.verses.forEach((v) => {
          if (v.text.toLowerCase().includes(normalizedQuery)) {
            results.push(v);
          }
        });
      }
    });

    // Buscar en los mock chapters
    Object.values(MOCK_CHAPTERS).forEach((versionMap) => {
      const chapter = versionMap[version];
      if (chapter) {
        chapter.verses.forEach((v) => {
          if (v.text.toLowerCase().includes(normalizedQuery) && !results.some(r => r.bookId === v.bookId && r.chapter === v.chapter && r.verse === v.verse)) {
            results.push(v);
          }
        });
      }
    });

    return results;
  }
}

/**
 * Retorna la cantidad de versículos disponibles para un capítulo específico.
 * Si es un capítulo cargado en caché o mock detallado, devuelve el número real de versículos;
 * de lo contrario, devuelve la cantidad simulada estándar (25).
 */
export function getVerseCountForChapter(
  bookId: string,
  chapter: number,
  version: BibleVersion = 'RVR1960'
): number {
  const cacheKey = `${bookId.toUpperCase()}_${chapter}_${version}`;
  const cachedChapter = chaptersCache.get(cacheKey);
  if (cachedChapter && cachedChapter.verses && cachedChapter.verses.length > 0) {
    return cachedChapter.verses.length;
  }

  const key = `${bookId.toUpperCase()}_${chapter}`;
  const mockChapter = MOCK_CHAPTERS[key]?.[version];
  if (mockChapter && mockChapter.verses && mockChapter.verses.length > 0) {
    return Math.max(...mockChapter.verses.map((v) => v.verse));
  }
  return 25;
}

// Instancia singleton por defecto
export const bibleService = new MockBibleService();
