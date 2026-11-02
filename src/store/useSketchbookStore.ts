import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SketchPage,
  SketchTextBlock,
  SketchDrawingStroke,
  SketchFontFamily,
  SketchFontSize,
  SketchPagePattern,
  SketchDrawingTool
} from '../types/sketchbook';
import { BibleVerse } from '../types/bible';
import { BIBLE_BOOKS } from '../services/bible/mockBibleData';

interface StudySketchbookData {
  pages: SketchPage[];
  activePageIndex: number;
}

interface SketchbookStoreState {
  // Estado de bloque seleccionado
  selectedBlockId: string | null;
  setSelectedBlockId: (blockId: string | null) => void;

  // Estado de edición actual
  activeFontFamily: SketchFontFamily;
  activeFontSize: SketchFontSize;
  activeBold: boolean;
  activeItalic: boolean;
  activeTextColor: string;

  // Estado de dibujo actual
  activeDrawingTool: SketchDrawingTool;
  activeStrokeColor: string;
  activeStrokeWidth: number;

  // Datos por estudio
  sketchbookByStudy: Record<string, StudySketchbookData>;

  // Pilas deshacer / rehacer
  undoStack: SketchDrawingStroke[][];
  redoStack: SketchDrawingStroke[][];

  // Acciones de formato
  setActiveFontFamily: (font: SketchFontFamily, studyId?: string) => void;
  setActiveFontSize: (size: SketchFontSize, studyId?: string) => void;
  toggleActiveBold: (studyId?: string) => void;
  toggleActiveItalic: (studyId?: string) => void;
  setActiveTextColor: (color: string, studyId?: string) => void;
  setActiveDrawingTool: (tool: SketchDrawingTool) => void;
  setActiveStrokeColor: (color: string) => void;
  setActiveStrokeWidth: (width: number) => void;

  // Acciones de páginas
  getStudyData: (studyId: string) => StudySketchbookData;
  getActivePage: (studyId: string) => SketchPage | undefined;
  setActivePageIndex: (studyId: string, index: number) => void;
  addPage: (studyId: string, pattern?: SketchPagePattern) => void;
  deletePage: (studyId: string, pageId: string) => void;
  setPagePattern: (studyId: string, pattern: SketchPagePattern) => void;
  updatePageHeader: (studyId: string, subject: string, title: string) => void;
  updatePageCornell: (studyId: string, cueNotes: string, summary: string) => void;

  // Acciones de bloques de texto
  addTextBlock: (studyId: string, content?: string) => void;
  updateTextBlock: (studyId: string, blockId: string, updates: Partial<SketchTextBlock>) => void;
  deleteTextBlock: (studyId: string, blockId: string) => void;
  addVerseToSketchbook: (studyId: string, verse: BibleVerse) => void;
  addPhraseToSketchbook: (studyId: string, phrase: string, verse: BibleVerse) => void;

  // Acciones de trazos
  addStroke: (studyId: string, stroke: SketchDrawingStroke) => void;
  eraseStrokesAtPoint: (studyId: string, x: number, y: number, radius?: number) => void;
  undo: (studyId: string) => void;
  redo: (studyId: string) => void;
  clearStrokes: (studyId: string) => void;
}

const DEFAULT_DEMO_PAGE: SketchPage = {
  id: 'page-1',
  pageNumber: 1,
  subject: 'ESTUDIO CORNELL • CRISTOLOGÍA',
  title: 'El Verbo Encarnado y la Victoria Espiritual',
  date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
  pattern: 'cornell',
  cueNotes: `📌 IDEAS CLAVE:\n\n• Logos (Verbo eterno)\n• Creación ex-nihilo\n• Victoria de la Verdad\n• Cautivar el pensamiento`,
  summary: `💡 RESUMEN TEOLÓGICO: Cristo es el principio y fin de toda sabiduría. El mismo Verbo creador que habló la luz en Génesis 1 reina sobre toda altivez humana llevándola a la obediencia divina.`,
  blocks: [
    {
      id: 'blk-1',
      title: '01. EL LOGOS PREEXISTENTE',
      content: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Este era en el principio con Dios. Todas las cosas por él fueron hechas, y sin él nada de lo que ha sido hecho, fue hecho.',
      fontFamily: 'serif',
      fontSize: 'lg',
      bold: false,
      color: '#1e293b',
      verseRef: {
        bookId: 'JHN',
        bookName: 'Juan',
        chapter: 1,
        verse: 1,
        version: 'RVR1960',
        text: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'blk-2',
      title: '02. NOTA MANUAL DE REFLEXIÓN',
      content: '«El Señor no solo creó el universo cósmico, sino que ahora renueva y gobierna los pensamientos de nuestra mente en nuestro hogar y matrimonio.»',
      fontFamily: 'handwriting',
      fontSize: 'xl',
      bold: true,
      color: '#88804B',
      createdAt: new Date().toISOString()
    },
    {
      id: 'blk-3',
      title: '03. LLEVAR CAUTIVO EL PENSAMIENTO',
      content: 'Derribando argumentos y toda altivez que se levanta contra el conocimiento de Dios, y llevando cautivo todo pensamiento a la obediencia a Cristo.',
      fontFamily: 'serif',
      fontSize: 'base',
      bold: false,
      color: '#1e293b',
      verseRef: {
        bookId: '2CO',
        bookName: '2 Corintios',
        chapter: 10,
        verse: 5,
        version: 'RVR1960',
        text: 'derribando argumentos y toda altivez que se levanta contra el conocimiento de Dios, y llevando cautivo todo pensamiento a la obediencia a Cristo'
      },
      createdAt: new Date().toISOString()
    }
  ],
  strokes: [
    // Pequeño boceto inicial de flecha de diagrama
    {
      id: 'sk-arrow-1',
      tool: 'pen',
      color: '#88804B',
      width: 3,
      points: [
        { x: 380, y: 155 },
        { x: 420, y: 155 },
        { x: 460, y: 155 },
        { x: 450, y: 145 },
        { x: 460, y: 155 },
        { x: 450, y: 165 }
      ]
    },
    // Subrayado estilizado
    {
      id: 'sk-high-1',
      tool: 'highlighter',
      color: '#B7D6D9',
      width: 16,
      points: [
        { x: 230, y: 195 },
        { x: 340, y: 195 },
        { x: 430, y: 195 }
      ]
    }
  ]
};

export const useSketchbookStore = create<SketchbookStoreState>()(
  persist(
    (set, get) => ({
      activeFontFamily: 'serif',
      activeFontSize: 'base',
      activeBold: false,
      activeItalic: false,
      activeTextColor: '#1e293b',

      activeDrawingTool: 'pen',
      activeStrokeColor: '#88804B', // Paleta solicitada
      activeStrokeWidth: 3,

      sketchbookByStudy: {
        'study-genesis-juan': {
          pages: [DEFAULT_DEMO_PAGE],
          activePageIndex: 0
        }
      },

      selectedBlockId: null,
      setSelectedBlockId: (blockId) => set({ selectedBlockId: blockId }),

      undoStack: [],
      redoStack: [],

      setActiveFontFamily: (font, studyId) => {
        set({ activeFontFamily: font });
        if (studyId) {
          const current = get().getStudyData(studyId);
          const pages = [...current.pages];
          const page = pages[current.activePageIndex];
          if (!page || page.blocks.length === 0) return;

          const selId = get().selectedBlockId;
          const hasSelectedBlock = selId && page.blocks.some((b) => b.id === selId);

          const updatedBlocks = page.blocks.map((b) => {
            if (hasSelectedBlock) {
              return b.id === selId ? { ...b, fontFamily: font } : b;
            }
            return { ...b, fontFamily: font };
          });

          pages[current.activePageIndex] = { ...page, blocks: updatedBlocks };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },

      setActiveFontSize: (size, studyId) => {
        set({ activeFontSize: size });
        if (studyId) {
          const current = get().getStudyData(studyId);
          const pages = [...current.pages];
          const page = pages[current.activePageIndex];
          if (!page || page.blocks.length === 0) return;

          const selId = get().selectedBlockId;
          const hasSelectedBlock = selId && page.blocks.some((b) => b.id === selId);

          const updatedBlocks = page.blocks.map((b) => {
            if (hasSelectedBlock) {
              return b.id === selId ? { ...b, fontSize: size } : b;
            }
            return { ...b, fontSize: size };
          });

          pages[current.activePageIndex] = { ...page, blocks: updatedBlocks };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },

      toggleActiveBold: (studyId) => {
        const nextBold = !get().activeBold;
        set({ activeBold: nextBold });
        if (studyId) {
          const current = get().getStudyData(studyId);
          const pages = [...current.pages];
          const page = pages[current.activePageIndex];
          if (!page || page.blocks.length === 0) return;

          const selId = get().selectedBlockId;
          const hasSelectedBlock = selId && page.blocks.some((b) => b.id === selId);

          const updatedBlocks = page.blocks.map((b) => {
            if (hasSelectedBlock) {
              return b.id === selId ? { ...b, bold: nextBold } : b;
            }
            return { ...b, bold: nextBold };
          });

          pages[current.activePageIndex] = { ...page, blocks: updatedBlocks };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },

      toggleActiveItalic: (studyId) => {
        const nextItalic = !get().activeItalic;
        set({ activeItalic: nextItalic });
        if (studyId) {
          const current = get().getStudyData(studyId);
          const pages = [...current.pages];
          const page = pages[current.activePageIndex];
          if (!page || page.blocks.length === 0) return;

          const selId = get().selectedBlockId;
          const hasSelectedBlock = selId && page.blocks.some((b) => b.id === selId);

          const updatedBlocks = page.blocks.map((b) => {
            if (hasSelectedBlock) {
              return b.id === selId ? { ...b, italic: nextItalic } : b;
            }
            return { ...b, italic: nextItalic };
          });

          pages[current.activePageIndex] = { ...page, blocks: updatedBlocks };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },

      setActiveTextColor: (color, studyId) => {
        set({ activeTextColor: color });
        if (studyId) {
          const current = get().getStudyData(studyId);
          const pages = [...current.pages];
          const page = pages[current.activePageIndex];
          if (!page || page.blocks.length === 0) return;

          const selId = get().selectedBlockId;
          const hasSelectedBlock = selId && page.blocks.some((b) => b.id === selId);

          const updatedBlocks = page.blocks.map((b) => {
            if (hasSelectedBlock) {
              return b.id === selId ? { ...b, color } : b;
            }
            return { ...b, color };
          });

          pages[current.activePageIndex] = { ...page, blocks: updatedBlocks };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },
      setActiveDrawingTool: (tool) => set({ activeDrawingTool: tool }),
      setActiveStrokeColor: (color) => set({ activeStrokeColor: color }),
      setActiveStrokeWidth: (width) => set({ activeStrokeWidth: width }),

      getStudyData: (studyId) => {
        const state = get();
        return state.sketchbookByStudy[studyId] || { pages: [DEFAULT_DEMO_PAGE], activePageIndex: 0 };
      },

      getActivePage: (studyId) => {
        const data = get().getStudyData(studyId);
        return data.pages[data.activePageIndex] || data.pages[0];
      },

      setActivePageIndex: (studyId, index) => {
        const current = get().getStudyData(studyId);
        if (index >= 0 && index < current.pages.length) {
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: {
                ...current,
                activePageIndex: index
              }
            }
          });
        }
      },

      addPage: (studyId, pattern = 'cornell') => {
        const current = get().getStudyData(studyId);
        const newPageNum = current.pages.length + 1;
        const newPage: SketchPage = {
          id: `page-${Date.now()}`,
          pageNumber: newPageNum,
          subject: 'NUEVA HOJA DE BOCETOS',
          title: `Página de Estudio ${newPageNum}`,
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          pattern,
          cueNotes: '📌 Puntos clave & glosario:',
          summary: '💡 Resumen de la sesión:',
          blocks: [],
          strokes: []
        };

        const updatedPages = [...current.pages, newPage];
        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: {
              pages: updatedPages,
              activePageIndex: updatedPages.length - 1
            }
          }
        });
      },

      deletePage: (studyId, pageId) => {
        const current = get().getStudyData(studyId);
        if (current.pages.length <= 1) return; // Mantener al menos una página

        const filtered = current.pages.filter((p) => p.id !== pageId);
        // Renumerar
        const renumbered = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
        const newIdx = Math.min(current.activePageIndex, renumbered.length - 1);

        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: {
              pages: renumbered,
              activePageIndex: newIdx
            }
          }
        });
      },

      setPagePattern: (studyId, pattern) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        pages[current.activePageIndex] = { ...page, pattern };
        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      updatePageHeader: (studyId, subject, title) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        pages[current.activePageIndex] = { ...page, subject, title };
        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      updatePageCornell: (studyId, cueNotes, summary) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        pages[current.activePageIndex] = { ...page, cueNotes, summary };
        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      addTextBlock: (studyId, content = 'Escribe aquí tu análisis o nota explicativa...') => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        const { activeFontFamily, activeFontSize, activeBold, activeItalic, activeTextColor } = get();

        const blockId = `sblk-${Date.now()}`;
        const newBlock: SketchTextBlock = {
          id: blockId,
          content,
          fontFamily: activeFontFamily,
          fontSize: activeFontSize,
          bold: activeBold,
          italic: activeItalic,
          color: activeTextColor,
          createdAt: new Date().toISOString()
        };

        pages[current.activePageIndex] = {
          ...page,
          blocks: [...page.blocks, newBlock]
        };

        set({
          selectedBlockId: blockId,
          activeDrawingTool: 'select',
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      updateTextBlock: (studyId, blockId, updates) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        pages[current.activePageIndex] = {
          ...page,
          blocks: page.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
        };

        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      deleteTextBlock: (studyId, blockId) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        pages[current.activePageIndex] = {
          ...page,
          blocks: page.blocks.filter((b) => b.id !== blockId)
        };

        set({
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      addVerseToSketchbook: (studyId, verse) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex] || pages[0];
        if (!page) return;

        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        const words = verse.text.trim().split(' ');
        const firstWord = words[0]?.replace(/[.,;:]/g, '').toUpperCase() || 'VERSÍCULO';
        const remainingText = words.slice(1).join(' ');

        const blockId = `sblk-${Date.now()}`;
        const newBlock: SketchTextBlock = {
          id: blockId,
          title: `${firstWord} — ${bookName} ${verse.chapter}:${verse.verse} (${verse.version})`,
          content: `${words[0]} ${remainingText}`,
          fontFamily: get().activeFontFamily,
          fontSize: get().activeFontSize || 'lg',
          bold: get().activeBold,
          italic: get().activeItalic,
          color: '#1e293b',
          verseRef: {
            bookId: verse.bookId,
            bookName,
            chapter: verse.chapter,
            verse: verse.verse,
            version: verse.version,
            text: verse.text
          },
          createdAt: new Date().toISOString()
        };

        pages[current.activePageIndex] = {
          ...page,
          blocks: [...page.blocks, newBlock]
        };

        set({
          selectedBlockId: blockId,
          activeDrawingTool: 'select',
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      addPhraseToSketchbook: (studyId, phrase, verse) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex] || pages[0];
        if (!page) return;

        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        const blockId = `sblk-phrase-${Date.now()}`;
        const newBlock: SketchTextBlock = {
          id: blockId,
          title: `FRASE • ${bookName} ${verse.chapter}:${verse.verse} (${verse.version})`,
          content: `«${phrase.trim()}»`,
          fontFamily: get().activeFontFamily,
          fontSize: get().activeFontSize || 'lg',
          bold: get().activeBold,
          italic: get().activeItalic,
          color: '#1e293b',
          verseRef: {
            bookId: verse.bookId,
            bookName,
            chapter: verse.chapter,
            verse: verse.verse,
            version: verse.version,
            text: verse.text
          },
          createdAt: new Date().toISOString()
        };

        pages[current.activePageIndex] = {
          ...page,
          blocks: [...page.blocks, newBlock]
        };

        set({
          selectedBlockId: blockId,
          activeDrawingTool: 'select',
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      addStroke: (studyId, stroke) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        const previousStrokes = [...page.strokes];
        pages[current.activePageIndex] = {
          ...page,
          strokes: [...page.strokes, stroke]
        };

        set({
          undoStack: [...get().undoStack, previousStrokes],
          redoStack: [],
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      eraseStrokesAtPoint: (studyId, x, y, radius = 22) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        const filtered = page.strokes.filter((stroke) => {
          return !stroke.points.some((p) => {
            const dx = p.x - x;
            const dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
          });
        });

        if (filtered.length !== page.strokes.length) {
          pages[current.activePageIndex] = {
            ...page,
            strokes: filtered
          };
          set({
            sketchbookByStudy: {
              ...get().sketchbookByStudy,
              [studyId]: { ...current, pages }
            }
          });
        }
      },

      undo: (studyId) => {
        const { undoStack, redoStack } = get();
        if (undoStack.length === 0) return;

        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        const prevStrokes = undoStack[undoStack.length - 1];
        const newUndo = undoStack.slice(0, -1);

        const currentStrokes = page.strokes;
        pages[current.activePageIndex] = {
          ...page,
          strokes: prevStrokes
        };

        set({
          undoStack: newUndo,
          redoStack: [...redoStack, currentStrokes],
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      redo: (studyId) => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return;

        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page) return;

        const nextStrokes = redoStack[redoStack.length - 1];
        const newRedo = redoStack.slice(0, -1);

        const currentStrokes = page.strokes;
        pages[current.activePageIndex] = {
          ...page,
          strokes: nextStrokes
        };

        set({
          undoStack: [...undoStack, currentStrokes],
          redoStack: newRedo,
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: { ...current, pages }
          }
        });
      },

      clearStrokes: (studyId) => {
        const current = get().getStudyData(studyId);
        const pages = [...current.pages];
        const page = pages[current.activePageIndex];
        if (!page || page.strokes.length === 0) return;

        set({
          undoStack: [...get().undoStack, page.strokes],
          redoStack: [],
          sketchbookByStudy: {
            ...get().sketchbookByStudy,
            [studyId]: {
              ...current,
              pages: pages.map((p, idx) => (idx === current.activePageIndex ? { ...p, strokes: [] } : p))
            }
          }
        });
      }
    }),
    {
      name: 'koinonia-sketchbook-store',
      partialize: (state) => ({
        activeFontFamily: state.activeFontFamily,
        activeFontSize: state.activeFontSize,
        activeBold: state.activeBold,
        activeItalic: state.activeItalic,
        activeTextColor: state.activeTextColor,
        activeDrawingTool: state.activeDrawingTool,
        activeStrokeColor: state.activeStrokeColor,
        activeStrokeWidth: state.activeStrokeWidth,
        sketchbookByStudy: state.sketchbookByStudy
      })
    }
  )
);
