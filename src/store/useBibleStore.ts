import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BibleBook,
  BibleChapter,
  BibleVerse,
  BibleVersion,
  Highlight,
  HighlightColor,
  CustomBook,
  CustomChapter,
  ReadingMode
} from '../types/bible';
import { bibleService } from '../services/bible/mockBibleService';

const parseParagraphs = (content: string): string[] => {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
};

const INITIAL_CUSTOM_BOOKS: CustomBook[] = [
  {
    id: 'cb-romanos-comentario',
    title: 'Comentario a Romanos (Manuscrito Pastoral)',
    author: 'Pastor John / Estudio en Fotos',
    description: 'Transcripción digitalizada de apuntes de estudio y comentarios exegéticos a Romanos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        chapter: 1,
        title: 'Capítulo 1: El Justo por la Fe Vivirá',
        content: `La justificación por la fe constituye el eje axial de la revelación paulina en la epístola a los Romanos.\n\nEn este primer capítulo, el apóstol Pablo establece con solemnidad que el evangelio no es una mera teoría filosófica, sino poder de Dios (dýnamis Theoû) para salvación a todo aquel que cree.\n\nLa justicia de Dios se revela de fe en fe, confrontando la rebelión humana y ofreciendo la gracia inmerecida a judíos y gentiles. La creación misma testifica del eterno poder y deidad del Creador, de modo que nadie tiene excusa.`,
        paragraphs: [
          'La justificación por la fe constituye el eje axial de la revelación paulina en la epístola a los Romanos.',
          'En este primer capítulo, el apóstol Pablo establece con solemnidad que el evangelio no es una mera teoría filosófica, sino poder de Dios (dýnamis Theoû) para salvación a todo aquel que cree.',
          'La justicia de Dios se revela de fe en fe, confrontando la rebelión humana y ofreciendo la gracia inmerecida a judíos y gentiles. La creación misma testifica del eterno poder y deidad del Creador, de modo que nadie tiene excusa.'
        ],
        createdAt: new Date().toISOString()
      }
    ]
  }
];

interface BibleState {
  // Estado de navegación
  books: BibleBook[];
  currentBookId: string;
  currentChapterNum: number;
  currentVersion: BibleVersion;

  // Libros Propios subidos por el usuario (Fotos / IA)
  customBooks: CustomBook[];
  activeCustomBookId: string | null;
  activeCustomChapterNum: number;

  createCustomBook: (
    title: string,
    initialContentOrChapters: string | { title?: string; content: string }[],
    author?: string,
    description?: string,
    tags?: string[]
  ) => string;
  addChapterToCustomBook: (bookId: string, content: string, title?: string) => void;
  selectCustomBook: (bookId: string, chapterNum?: number) => void;
  setCustomChapter: (chapterNum: number) => void;
  exitCustomBook: () => void;
  deleteCustomBook: (bookId: string) => void;

  // Modo Paralelo y Modos de Lectura ('split-vertical' | 'side-by-side' | 'single')
  isParallelMode: boolean;
  parallelVersion: BibleVersion;
  readingMode: ReadingMode;

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
  toggleParallelMode: () => Promise<void>;
  setReadingMode: (mode: ReadingMode) => Promise<void>;
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

      // Libros Propios
      customBooks: INITIAL_CUSTOM_BOOKS,
      activeCustomBookId: null,
      activeCustomChapterNum: 1,

      createCustomBook: (
        title: string,
        initialContentOrChapters: string | { title?: string; content: string }[],
        author?: string,
        description?: string,
        tags?: string[]
      ) => {
        const id = `cb-${Date.now()}`;
        let chapters: CustomChapter[] = [];

        if (Array.isArray(initialContentOrChapters)) {
          chapters = initialContentOrChapters.map((ch, idx) => {
            const paragraphs = parseParagraphs(ch.content);
            return {
              chapter: idx + 1,
              title: ch.title?.trim() || `Capítulo ${idx + 1}`,
              content: ch.content,
              paragraphs: paragraphs.length ? paragraphs : [ch.content],
              createdAt: new Date().toISOString()
            };
          });
          if (chapters.length === 0) {
            chapters = [
              {
                chapter: 1,
                title: 'Capítulo 1',
                content: '',
                paragraphs: ['Sin contenido aún.'],
                createdAt: new Date().toISOString()
              }
            ];
          }
        } else {
          const paragraphs = parseParagraphs(initialContentOrChapters);
          chapters = [
            {
              chapter: 1,
              title: 'Capítulo 1',
              content: initialContentOrChapters,
              paragraphs: paragraphs.length ? paragraphs : [initialContentOrChapters],
              createdAt: new Date().toISOString()
            }
          ];
        }

        const newBook: CustomBook = {
          id,
          title: title.trim() || 'Mi Libro de Estudio',
          author: author?.trim() || 'Notas Propias',
          description: description?.trim() || '',
          tags: tags || ['Libro'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          chapters
        };

        set((state) => ({
          customBooks: [newBook, ...state.customBooks],
          activeCustomBookId: id,
          activeCustomChapterNum: 1
        }));
        return id;
      },

      addChapterToCustomBook: (bookId: string, content: string, title?: string) => {
        const paragraphs = parseParagraphs(content);
        set((state) => {
          const bookIndex = state.customBooks.findIndex((b) => b.id === bookId);
          if (bookIndex === -1) return state;

          const book = state.customBooks[bookIndex];
          const nextChapterNum = (book.chapters.length || 0) + 1;
          const newChapter: CustomChapter = {
            chapter: nextChapterNum,
            title: title?.trim() || `Capítulo ${nextChapterNum}`,
            content,
            paragraphs: paragraphs.length ? paragraphs : [content],
            createdAt: new Date().toISOString()
          };

          const updatedBook: CustomBook = {
            ...book,
            chapters: [...book.chapters, newChapter],
            updatedAt: new Date().toISOString()
          };

          const updatedList = [...state.customBooks];
          updatedList[bookIndex] = updatedBook;

          return {
            customBooks: updatedList,
            activeCustomBookId: bookId,
            activeCustomChapterNum: nextChapterNum
          };
        });
      },

      selectCustomBook: (bookId: string, chapterNum = 1) => {
        set({
          activeCustomBookId: bookId,
          activeCustomChapterNum: chapterNum
        });
      },

      setCustomChapter: (chapterNum: number) => {
        set({ activeCustomChapterNum: chapterNum });
      },

      exitCustomBook: () => {
        set({ activeCustomBookId: null });
      },

      deleteCustomBook: (bookId: string) => {
        set((state) => ({
          customBooks: state.customBooks.filter((b) => b.id !== bookId),
          activeCustomBookId: state.activeCustomBookId === bookId ? null : state.activeCustomBookId
        }));
      },

      isParallelMode: true,
      parallelVersion: 'NVI',
      readingMode: 'split-vertical',

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
        if (nextMode) {
          const currentReadingMode = get().readingMode === 'single' ? 'split-vertical' : get().readingMode;
          set({ isParallelMode: true, readingMode: currentReadingMode });
          const { currentBookId, currentChapterNum, parallelVersion } = get();
          const parallelData = await bibleService.getChapter(currentBookId, currentChapterNum, parallelVersion);
          set({ parallelChapterData: parallelData });
        } else {
          set({ isParallelMode: false, readingMode: 'single' });
        }
      },

      setReadingMode: async (mode: ReadingMode) => {
        if (mode === 'single') {
          set({ readingMode: 'single', isParallelMode: false });
        } else {
          set({ readingMode: mode, isParallelMode: true });
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
        readingMode: state.readingMode,
        parallelVersion: state.parallelVersion,
        highlights: state.highlights,
        customBooks: state.customBooks,
        activeCustomBookId: state.activeCustomBookId,
        activeCustomChapterNum: state.activeCustomChapterNum
      })
    }
  )
);
