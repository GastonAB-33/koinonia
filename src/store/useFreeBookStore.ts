import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DrawingStroke, FreeBlock, FreeDrawingTool } from '../types/freebook';
import { BibleVerse } from '../types/bible';
import { BIBLE_BOOKS } from '../services/bible/mockBibleData';

interface StudyFreeBookData {
  strokes: DrawingStroke[];
  blocks: FreeBlock[];
}

interface FreeBookStoreState {
  // Configuración de herramientas
  activeTool: FreeDrawingTool;
  strokeColor: string;
  penWidth: number;
  highlighterWidth: number;

  // Datos por estudio
  freeBookByStudy: Record<string, StudyFreeBookData>;

  // Pilas de Deshacer / Rehacer en memoria de sesión
  undoStack: DrawingStroke[][];
  redoStack: DrawingStroke[][];

  // Acciones de configuración
  setActiveTool: (tool: FreeDrawingTool) => void;
  setStrokeColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setHighlighterWidth: (width: number) => void;

  // Acciones de trazos
  getStudyData: (studyId: string) => StudyFreeBookData;
  addStroke: (studyId: string, stroke: DrawingStroke) => void;
  eraseStrokesAtPoint: (studyId: string, x: number, y: number, radius?: number) => void;
  undo: (studyId: string) => void;
  redo: (studyId: string) => void;
  clearStrokes: (studyId: string) => void;

  // Acciones de bloques
  addVerseBlock: (studyId: string, verse: BibleVerse) => void;
  addNoteBlock: (studyId: string, content?: string) => void;
  updateBlockContent: (studyId: string, blockId: string, content: string) => void;
  updateBlockTitle: (studyId: string, blockId: string, title: string) => void;
  deleteBlock: (studyId: string, blockId: string) => void;
}

// Bloques y trazos iniciales inspirados directamente en la imagen de referencia (2 Corintios 10:5)
const INITIAL_DEMO_DATA: StudyFreeBookData = {
  blocks: [
    {
      id: 'block-2cor-10-5',
      type: 'verse',
      title: 'DERRIBANDO',
      content: 'argumentos y toda altivez que se levanta contra el conocimiento de Dios,\n\ny llevando cautivo todo pensamiento a la obediencia a Cristo.',
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
    // Trazo de subrayado ondulado sobre "DERRIBANDO"
    {
      id: 'demo-stroke-1',
      tool: 'pen',
      color: '#dc2626',
      width: 3.5,
      points: [
        { x: 42, y: 72 },
        { x: 65, y: 76 },
        { x: 90, y: 71 },
        { x: 120, y: 77 },
        { x: 155, y: 72 },
        { x: 175, y: 75 }
      ]
    },
    // Subrayado sutil sobre "toda altivez"
    {
      id: 'demo-stroke-2',
      tool: 'pen',
      color: '#dc2626',
      width: 3,
      points: [
        { x: 235, y: 136 },
        { x: 270, y: 138 },
        { x: 310, y: 137 },
        { x: 345, y: 139 }
      ]
    },
    // Óvalo / círculo manual alrededor de "conocimiento de Dios"
    {
      id: 'demo-stroke-3',
      tool: 'pen',
      color: '#dc2626',
      width: 3,
      points: [
        { x: 220, y: 178 },
        { x: 200, y: 185 },
        { x: 230, y: 198 },
        { x: 320, y: 202 },
        { x: 420, y: 195 },
        { x: 440, y: 180 },
        { x: 425, y: 168 },
        { x: 330, y: 165 },
        { x: 250, y: 168 },
        { x: 210, y: 180 },
        { x: 230, y: 195 }
      ]
    },
    // Recuadro manual alrededor de "cautivo"
    {
      id: 'demo-stroke-4',
      tool: 'pen',
      color: '#dc2626',
      width: 2.8,
      points: [
        // Arriba
        { x: 228, y: 238 },
        { x: 285, y: 238 },
        // Derecha abajo
        { x: 285, y: 265 },
        // Abajo
        { x: 228, y: 265 },
        // Izquierda arriba
        { x: 228, y: 238 }
      ]
    }
  ]
};

export const useFreeBookStore = create<FreeBookStoreState>()(
  persist(
    (set, get) => ({
      activeTool: 'pen',
      strokeColor: '#dc2626', // Rojo carmín idéntico a la imagen de referencia
      penWidth: 3,
      highlighterWidth: 18,

      freeBookByStudy: {
        'study-genesis-juan': INITIAL_DEMO_DATA
      },

      undoStack: [],
      redoStack: [],

      setActiveTool: (tool) => set({ activeTool: tool }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setPenWidth: (width) => set({ penWidth: width }),
      setHighlighterWidth: (width) => set({ highlighterWidth: width }),

      getStudyData: (studyId) => {
        const state = get();
        return state.freeBookByStudy[studyId] || { strokes: [], blocks: [] };
      },

      addStroke: (studyId, stroke) => {
        const currentData = get().getStudyData(studyId);
        const newStrokes = [...currentData.strokes, stroke];

        // Guardar para deshacer
        set({
          undoStack: [...get().undoStack, currentData.strokes],
          redoStack: [],
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              strokes: newStrokes
            }
          }
        });
      },

      eraseStrokesAtPoint: (studyId, x, y, radius = 20) => {
        const currentData = get().getStudyData(studyId);
        const filteredStrokes = currentData.strokes.filter((stroke) => {
          // Comprobar si algún punto del trazo está a una distancia menor que radius del borrador
          const hit = stroke.points.some((p) => {
            const dx = p.x - x;
            const dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
          });
          return !hit;
        });

        if (filteredStrokes.length !== currentData.strokes.length) {
          set({
            undoStack: [...get().undoStack, currentData.strokes],
            redoStack: [],
            freeBookByStudy: {
              ...get().freeBookByStudy,
              [studyId]: {
                ...currentData,
                strokes: filteredStrokes
              }
            }
          });
        }
      },

      undo: (studyId) => {
        const { undoStack, redoStack } = get();
        if (undoStack.length === 0) return;

        const currentData = get().getStudyData(studyId);
        const previousStrokes = undoStack[undoStack.length - 1];
        const newUndo = undoStack.slice(0, -1);

        set({
          undoStack: newUndo,
          redoStack: [...redoStack, currentData.strokes],
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              strokes: previousStrokes
            }
          }
        });
      },

      redo: (studyId) => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return;

        const currentData = get().getStudyData(studyId);
        const nextStrokes = redoStack[redoStack.length - 1];
        const newRedo = redoStack.slice(0, -1);

        set({
          undoStack: [...undoStack, currentData.strokes],
          redoStack: newRedo,
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              strokes: nextStrokes
            }
          }
        });
      },

      clearStrokes: (studyId) => {
        const currentData = get().getStudyData(studyId);
        if (currentData.strokes.length === 0) return;

        set({
          undoStack: [...get().undoStack, currentData.strokes],
          redoStack: [],
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              strokes: []
            }
          }
        });
      },

      addVerseBlock: (studyId, verse) => {
        const currentData = get().getStudyData(studyId);
        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        // Extraer la primera palabra para darle formato editorial como en el ejemplo ("DERRIBANDO")
        const words = verse.text.trim().split(' ');
        const firstWord = words[0]?.replace(/[.,;:]/g, '').toUpperCase() || 'VERSÍCULO';
        const remainingText = words.slice(1).join(' ');

        const newBlock: FreeBlock = {
          id: `fblock-${Date.now()}`,
          type: 'verse',
          title: firstWord,
          content: remainingText,
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

        set({
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              blocks: [...currentData.blocks, newBlock]
            }
          }
        });
      },

      addNoteBlock: (studyId, content = 'Escribe aquí tu meditación personal o revelación...') => {
        const currentData = get().getStudyData(studyId);
        const newBlock: FreeBlock = {
          id: `fblock-${Date.now()}`,
          type: 'note',
          title: 'REFLEXIÓN',
          content,
          createdAt: new Date().toISOString()
        };

        set({
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              blocks: [...currentData.blocks, newBlock]
            }
          }
        });
      },

      updateBlockContent: (studyId, blockId, content) => {
        const currentData = get().getStudyData(studyId);
        set({
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              blocks: currentData.blocks.map((b) => (b.id === blockId ? { ...b, content } : b))
            }
          }
        });
      },

      updateBlockTitle: (studyId, blockId, title) => {
        const currentData = get().getStudyData(studyId);
        set({
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              blocks: currentData.blocks.map((b) => (b.id === blockId ? { ...b, title } : b))
            }
          }
        });
      },

      deleteBlock: (studyId, blockId) => {
        const currentData = get().getStudyData(studyId);
        set({
          freeBookByStudy: {
            ...get().freeBookByStudy,
            [studyId]: {
              ...currentData,
              blocks: currentData.blocks.filter((b) => b.id !== blockId)
            }
          }
        });
      }
    }),
    {
      name: 'koinonia-freebook-store',
      partialize: (state) => ({
        activeTool: state.activeTool,
        strokeColor: state.strokeColor,
        penWidth: state.penWidth,
        highlighterWidth: state.highlighterWidth,
        freeBookByStudy: state.freeBookByStudy
      })
    }
  )
);
