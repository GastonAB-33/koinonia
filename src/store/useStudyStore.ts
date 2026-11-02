import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Study, StudyBlock } from '../types/study';
import { BibleVerse } from '../types/bible';
import { BIBLE_BOOKS } from '../services/bible/mockBibleData';

interface StudyState {
  studies: Study[];
  activeStudyId: string;

  // Acciones
  getActiveStudy: () => Study | undefined;
  setActiveStudyId: (id: string) => void;
  createStudy: (title: string, tags?: string[]) => Study;
  updateStudyTitle: (id: string, title: string) => void;
  updateStudyDescription: (id: string, description: string) => void;
  addTagToStudy: (id: string, tag: string) => void;
  removeTagFromStudy: (id: string, tag: string) => void;
  
  // Gestión de bloques
  addVerseToActiveStudy: (verse: BibleVerse) => void;
  addPhraseToActiveStudy: (phrase: string, verse: BibleVerse) => void;
  addTextBlockToActiveStudy: (content: string, type?: StudyBlock['type']) => void;
  updateBlockContent: (blockId: string, content: string) => void;
  removeBlock: (blockId: string) => void;
  
  // Exportar estudio
  exportActiveStudyAsMarkdown: () => string;
}

const INITIAL_STUDIES: Study[] = [
  {
    id: 'study-genesis-juan',
    title: 'El Verbo Encarnado y la Creación: Génesis 1 y Juan 1',
    description: 'Estudio cristológico comparativo sobre la preexistencia y gloria creadora de Jesús.',
    tags: ['Cristología', 'Creación', 'Tipología', 'Estudio en Pareja'],
    createdAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    updatedAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    author: 'Alejandro y Esposa',
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        content: 'I. La correspondencia primordial: "En el principio"',
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-2',
        type: 'text',
        content: 'Moisés y Juan inician sus libros con la mismísima frase. Pero mientras Moisés mira hacia el inicio del tiempo y del universo creado ("creó los cielos y la tierra"), Juan trasciende el tiempo y mira la eternidad: antes de que nada fuese hecho, el Verbo ya existía cara a cara con Dios.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-3',
        type: 'verse_quote',
        content: 'El texto fundacional del Génesis.',
        verseRef: {
          bookId: 'GEN',
          bookName: 'Génesis',
          chapter: 1,
          verse: 1,
          version: 'RVR1960',
          text: 'En el principio creó Dios los cielos y la tierra.'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-4',
        type: 'verse_quote',
        content: 'La respuesta apostólica y cristológica de Juan.',
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
        id: 'block-5',
        type: 'theological_insight',
        content: 'Nota Teológica: Juan utiliza el imperfecto griego "ἦν" (era/estaba), que denota existencia continua sin punto de origen en contraste con "ἐγένετο" (llegó a ser / fue hecho) usado para la creación en el versículo 3.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-6',
        type: 'verse_quote',
        content: 'La cumbre de la revelación: La Encarnación.',
        verseRef: {
          bookId: 'JHN',
          bookName: 'Juan',
          chapter: 1,
          verse: 14,
          version: 'RVR1960',
          text: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-7',
        type: 'reflection',
        content: 'Pregunta para reflexionar juntos: ¿Cómo transforma nuestra adoración diaria saber que el mismo Dios que ordenó con su voz la luz en medio del caos de Génesis 1, habitó en debilidad humana para salvarnos?',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'study-romanos-8',
    title: 'Seguridad Eterna y Esperanza en el Espíritu: Romanos 8',
    description: 'Análisis de la victoria del creyente y la obra intercesora del Espíritu Santo.',
    tags: ['Neumatología', 'Seguridad', 'Romanos'],
    createdAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    updatedAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    author: 'Alejandro y Esposa',
    blocks: [
      {
        id: 'block-rom-1',
        type: 'heading',
        content: 'La ausencia de condenación y el testimonio del Espíritu',
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-rom-2',
        type: 'verse_quote',
        content: 'La declaración forense del creyente.',
        verseRef: {
          bookId: 'ROM',
          bookName: 'Romanos',
          chapter: 8,
          verse: 1,
          version: 'RVR1960',
          text: 'Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús...'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'block-rom-3',
        type: 'verse_quote',
        content: 'La gran promesa de la soberanía de Dios.',
        verseRef: {
          bookId: 'ROM',
          bookName: 'Romanos',
          chapter: 8,
          verse: 28,
          version: 'RVR1960',
          text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.'
        },
        createdAt: new Date().toISOString()
      }
    ]
  }
];

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      studies: INITIAL_STUDIES,
      activeStudyId: 'study-genesis-juan',

      getActiveStudy: () => {
        return get().studies.find((s) => s.id === get().activeStudyId) || get().studies[0];
      },

      setActiveStudyId: (id: string) => {
        set({ activeStudyId: id });
      },

      createStudy: (title: string, tags: string[] = ['Personal']) => {
        const id = `study-${Date.now()}`;
        const newStudy: Study = {
          id,
          title: title.trim() || 'Nuevo Estudio Bíblico',
          description: 'Notas y reflexiones compartidas.',
          tags,
          createdAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
          updatedAt: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
          author: 'Alejandro y Esposa',
          blocks: [
            {
              id: `blk-${Date.now()}`,
              type: 'text',
              content: 'Comienza escribiendo aquí tus observaciones, o inserta versículos directamente desde el lector bíblico...',
              createdAt: new Date().toISOString()
            }
          ]
        };

        set({
          studies: [newStudy, ...get().studies],
          activeStudyId: id
        });

        return newStudy;
      },

      updateStudyTitle: (id: string, title: string) => {
        set({
          studies: get().studies.map((s) => (s.id === id ? { ...s, title, updatedAt: 'Recién editado' } : s))
        });
      },

      updateStudyDescription: (id: string, description: string) => {
        set({
          studies: get().studies.map((s) => (s.id === id ? { ...s, description, updatedAt: 'Recién editado' } : s))
        });
      },

      addTagToStudy: (id: string, tag: string) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        set({
          studies: get().studies.map((s) => {
            if (s.id === id && !s.tags.includes(cleanTag)) {
              return { ...s, tags: [...s.tags, cleanTag] };
            }
            return s;
          })
        });
      },

      removeTagFromStudy: (id: string, tag: string) => {
        set({
          studies: get().studies.map((s) => {
            if (s.id === id) {
              return { ...s, tags: s.tags.filter((t) => t !== tag) };
            }
            return s;
          })
        });
      },

      addVerseToActiveStudy: (verse: BibleVerse) => {
        const activeStudy = get().getActiveStudy();
        if (!activeStudy) return;

        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        const newBlock: StudyBlock = {
          id: `verse-block-${Date.now()}`,
          type: 'verse_quote',
          content: '',
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
          studies: get().studies.map((s) => {
            if (s.id === activeStudy.id) {
              return {
                ...s,
                blocks: [...s.blocks, newBlock],
                updatedAt: 'Recién editado'
              };
            }
            return s;
          })
        });
      },

      addPhraseToActiveStudy: (phrase: string, verse: BibleVerse) => {
        const activeStudy = get().getActiveStudy();
        if (!activeStudy) return;

        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        const newBlock: StudyBlock = {
          id: `phrase-block-${Date.now()}`,
          type: 'verse_quote',
          content: `Frase destacada: «${phrase.trim()}»`,
          verseRef: {
            bookId: verse.bookId,
            bookName,
            chapter: verse.chapter,
            verse: verse.verse,
            version: verse.version,
            text: `"...${phrase.trim()}..." (${bookName} ${verse.chapter}:${verse.verse} ${verse.version})`
          },
          createdAt: new Date().toISOString()
        };

        set({
          studies: get().studies.map((s) => {
            if (s.id === activeStudy.id) {
              return {
                ...s,
                blocks: [...s.blocks, newBlock],
                updatedAt: 'Recién editado'
              };
            }
            return s;
          })
        });
      },

      addTextBlockToActiveStudy: (content: string, type: StudyBlock['type'] = 'text') => {
        const activeStudy = get().getActiveStudy();
        if (!activeStudy) return;

        const newBlock: StudyBlock = {
          id: `block-${Date.now()}`,
          type,
          content,
          createdAt: new Date().toISOString()
        };

        set({
          studies: get().studies.map((s) => {
            if (s.id === activeStudy.id) {
              return {
                ...s,
                blocks: [...s.blocks, newBlock],
                updatedAt: 'Recién editado'
              };
            }
            return s;
          })
        });
      },

      updateBlockContent: (blockId: string, content: string) => {
        const activeStudy = get().getActiveStudy();
        if (!activeStudy) return;

        set({
          studies: get().studies.map((s) => {
            if (s.id === activeStudy.id) {
              return {
                ...s,
                blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, content } : b))
              };
            }
            return s;
          })
        });
      },

      removeBlock: (blockId: string) => {
        const activeStudy = get().getActiveStudy();
        if (!activeStudy) return;

        set({
          studies: get().studies.map((s) => {
            if (s.id === activeStudy.id) {
              return {
                ...s,
                blocks: s.blocks.filter((b) => b.id !== blockId)
              };
            }
            return s;
          })
        });
      },

      exportActiveStudyAsMarkdown: () => {
        const study = get().getActiveStudy();
        if (!study) return '';

        let md = `# ${study.title}\n`;
        md += `*Fecha: ${study.createdAt} | Autores: ${study.author}*\n`;
        md += `*Etiquetas: ${study.tags.join(', ')}*\n\n`;
        if (study.description) {
          md += `> ${study.description}\n\n`;
        }
        md += `---\n\n`;

        study.blocks.forEach((b) => {
          if (b.type === 'heading') {
            md += `### ${b.content}\n\n`;
          } else if (b.type === 'verse_quote' && b.verseRef) {
            md += `> **${b.verseRef.bookName} ${b.verseRef.chapter}:${b.verseRef.verse} (${b.verseRef.version})**\n`;
            md += `> "${b.verseRef.text}"\n\n`;
            if (b.content) {
              md += `*Comentario:* ${b.content}\n\n`;
            }
          } else if (b.type === 'theological_insight') {
            md += `💡 **Aporte Teológico:** ${b.content}\n\n`;
          } else if (b.type === 'reflection') {
            md += `💭 **Reflexión:** ${b.content}\n\n`;
          } else {
            md += `${b.content}\n\n`;
          }
        });

        return md;
      }
    }),
    {
      name: 'koinonia-study-store',
      partialize: (state) => ({
        studies: state.studies,
        activeStudyId: state.activeStudyId
      })
    }
  )
);
