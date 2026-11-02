import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BibleBook, BibleChapter, BibleVerse, BibleVersion, Highlight, HighlightColor } from '../types/bible';
import { bibleService } from '../services/bible/mockBibleService';

interface BibleState {
  // Estado de navegación
  books: BibleBook[];
  currentBookId: string;
  currentChapterNum: number;
  currentVersion: BibleVersion;

  // Modo Paralelo
  isParallelMode: boolean;
  parallelVersion: BibleVersion;

  // Datos cargados
  chapterData: BibleChapter | null;
  parallelChapterData: BibleChapter | null;
  isLoading: boolean;

  // Subrayados
  highlights: Highlight[];

  // Versículo seleccionado para menú contextual o acciones
  selectedVerse: BibleVerse | null;

  // Versículo objetivo de navegación directa (para auto-scroll y resaltado temporal)
  targetVerseNum: number | null;

  // Acciones
  fetchBooks: () => Promise<void>;
  setBookAndChapter: (bookId: string, chapter: number) => Promise<void>;
  navigateToVerse: (bookId: string, chapter: number, verse?: number) => Promise<void>;
  setTargetVerse: (verse: number | null) => void;
  setVersion: (version: BibleVersion) => Promise<void>;
  toggleParallelMode: () => void;
  setParallelVersion: (version: BibleVersion) => Promise<void>;
  addHighlight: (verse: BibleVerse, color: HighlightColor) => void;
  removeHighlight: (bookId: string, chapter: number, verse: number) => void;
  setSelectedVerse: (verse: BibleVerse | null) => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      books: [],
      currentBookId: 'GEN',
      currentChapterNum: 1,
      currentVersion: 'RVR1960',

      isParallelMode: true,
      parallelVersion: 'NVI',

      chapterData: null,
      parallelChapterData: null,
      isLoading: false,

      // Subrayados iniciales para una experiencia inmediata enriquecida
      highlights: [
        {
          id: 'hl-1',
          bookId: 'GEN',
          chapter: 1,
          verse: 1,
          color: 'yellow',
          createdAt: new Date().toISOString(),
          note: 'Inicio de la revelación de Dios'
        },
        {
          id: 'hl-2',
          bookId: 'GEN',
          chapter: 1,
          verse: 27,
          color: 'green',
          createdAt: new Date().toISOString(),
          note: 'Imago Dei en el matrimonio'
        },
        {
          id: 'hl-3',
          bookId: 'JHN',
          chapter: 1,
          verse: 1,
          color: 'blue',
          createdAt: new Date().toISOString(),
          note: 'Deidad del Logos'
        },
        {
          id: 'hl-4',
          bookId: 'ROM',
          chapter: 8,
          verse: 28,
          color: 'pink',
          createdAt: new Date().toISOString(),
          note: 'Promesa de soberanía consoladora'
        }
      ],

      selectedVerse: null,
      targetVerseNum: null,

      fetchBooks: async () => {
        const books = await bibleService.getBooks();
        set({ books });
        // Cargar capítulo inicial
        const { currentBookId, currentChapterNum } = get();
        await get().setBookAndChapter(currentBookId, currentChapterNum);
      },

      setBookAndChapter: async (bookId: string, chapter: number) => {
        set({ isLoading: true, currentBookId: bookId, currentChapterNum: chapter });
        try {
          const { currentVersion, isParallelMode, parallelVersion } = get();
          const primaryData = await bibleService.getChapter(bookId, chapter, currentVersion);
          
          let parallelData = null;
          if (isParallelMode) {
            parallelData = await bibleService.getChapter(bookId, chapter, parallelVersion);
          }

          set({
            chapterData: primaryData,
            parallelChapterData: parallelData,
            isLoading: false
          });
        } catch (error) {
          console.error('Error al cargar capítulo bíblico:', error);
          set({ isLoading: false });
        }
      },

      navigateToVerse: async (bookId: string, chapter: number, verse?: number) => {
        set({ targetVerseNum: verse ?? null });
        await get().setBookAndChapter(bookId, chapter);

        if (verse) {
          // Breve timeout para permitir el re-renderizado del árbol de versículos
          setTimeout(() => {
            const element =
              document.getElementById(`verse-${bookId}-${chapter}-${verse}`) ||
              document.querySelector(`[data-verse-ref="${bookId}-${chapter}-${verse}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);

          // Limpiar el efecto de resaltado temporal tras 3.5 segundos
          setTimeout(() => {
            if (get().targetVerseNum === verse) {
              set({ targetVerseNum: null });
            }
          }, 3500);
        }
      },

      setTargetVerse: (verse: number | null) => {
        set({ targetVerseNum: verse });
      },

      setVersion: async (version: BibleVersion) => {
        set({ currentVersion: version, isLoading: true });
        const { currentBookId, currentChapterNum } = get();
        const primaryData = await bibleService.getChapter(currentBookId, currentChapterNum, version);
        set({ chapterData: primaryData, isLoading: false });
      },

      toggleParallelMode: async () => {
        const nextMode = !get().isParallelMode;
        set({ isParallelMode: nextMode });
        if (nextMode) {
          const { currentBookId, currentChapterNum, parallelVersion } = get();
          const parallelData = await bibleService.getChapter(currentBookId, currentChapterNum, parallelVersion);
          set({ parallelChapterData: parallelData });
        }
      },

      setParallelVersion: async (version: BibleVersion) => {
        set({ parallelVersion: version });
        const { currentBookId, currentChapterNum } = get();
        const parallelData = await bibleService.getChapter(currentBookId, currentChapterNum, version);
        set({ parallelChapterData: parallelData });
      },

      addHighlight: (verse: BibleVerse, color: HighlightColor) => {
        const existing = get().highlights.filter(
          (h) => !(h.bookId === verse.bookId && h.chapter === verse.chapter && h.verse === verse.verse)
        );
        const newHighlight: Highlight = {
          id: `hl-${Date.now()}`,
          bookId: verse.bookId,
          chapter: verse.chapter,
          verse: verse.verse,
          color,
          createdAt: new Date().toISOString()
        };
        set({ highlights: [...existing, newHighlight] });
      },

      removeHighlight: (bookId: string, chapter: number, verse: number) => {
        set({
          highlights: get().highlights.filter(
            (h) => !(h.bookId === bookId && h.chapter === chapter && h.verse === verse)
          )
        });
      },

      setSelectedVerse: (verse: BibleVerse | null) => {
        set({ selectedVerse: verse });
      }
    }),
    {
      name: 'koinonia-bible-store',
      partialize: (state) => ({
        currentBookId: state.currentBookId,
        currentChapterNum: state.currentChapterNum,
        currentVersion: state.currentVersion,
        isParallelMode: state.isParallelMode,
        parallelVersion: state.parallelVersion,
        highlights: state.highlights
      })
    }
  )
);
