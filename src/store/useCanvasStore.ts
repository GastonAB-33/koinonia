import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  MarkerType
} from '@xyflow/react';
import { CanvasCustomNode, ConceptNodeData, StickyNodeData } from '../types/canvas';
import { BibleVerse } from '../types/bible';
import { BIBLE_BOOKS } from '../services/bible/mockBibleData';

interface StudyCanvasData {
  nodes: CanvasCustomNode[];
  edges: Edge[];
}

interface CanvasStoreState {
  // Mapa de lienzos indexados por ID de estudio
  canvasByStudy: Record<string, StudyCanvasData>;

  // Métodos de acceso para el estudio activo
  getStudyCanvas: (studyId: string) => StudyCanvasData;
  onNodesChange: (studyId: string, changes: NodeChange[]) => void;
  onEdgesChange: (studyId: string, changes: EdgeChange[]) => void;
  onConnect: (studyId: string, connection: Connection) => void;

  // Acciones para añadir nodos
  addVerseNodeToCanvas: (studyId: string, verse: BibleVerse) => void;
  addConceptNodeToCanvas: (studyId: string, data: ConceptNodeData) => void;
  addStickyNodeToCanvas: (studyId: string, color: StickyNodeData['color'], content?: string) => void;
  deleteNode: (studyId: string, nodeId: string) => void;
  clearCanvas: (studyId: string) => void;
  resetToDefaultLayout: (studyId: string) => void;
}

// Lienzo inicial rico para el estudio Génesis 1 + Juan 1
const DEFAULT_GENESIS_JUAN_CANVAS: StudyCanvasData = {
  nodes: [
    {
      id: 'node-gen-1',
      type: 'verseNode',
      position: { x: 50, y: 80 },
      data: {
        bookId: 'GEN',
        bookName: 'Génesis',
        chapter: 1,
        verse: 1,
        version: 'RVR1960',
        text: 'En el principio creó Dios los cielos y la tierra.',
        themeColor: '#c29b38'
      }
    },
    {
      id: 'node-concept-logos',
      type: 'conceptNode',
      position: { x: 380, y: 50 },
      data: {
        title: 'El Verbo Preexistente (Logos)',
        category: 'Doctrina',
        description: 'Cristo no fue creado en el tiempo, sino que es el Agente Eterno por medio de quien Dios ordenó toda la materia y la vida.',
        tags: ['Cristología', 'Juan 1', 'Col 1:16'],
        color: '#3b82f6'
      }
    },
    {
      id: 'node-jhn-1',
      type: 'verseNode',
      position: { x: 740, y: 80 },
      data: {
        bookId: 'JHN',
        bookName: 'Juan',
        chapter: 1,
        verse: 1,
        version: 'RVR1960',
        text: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.',
        themeColor: '#3b82f6'
      }
    },
    {
      id: 'node-jhn-14',
      type: 'verseNode',
      position: { x: 740, y: 340 },
      data: {
        bookId: 'JHN',
        bookName: 'Juan',
        chapter: 1,
        verse: 14,
        version: 'RVR1960',
        text: 'Y aquel Verbo fue hecho carne, y habitó entre nosotros (y vimos su gloria, gloria como del unigénito del Padre), lleno de gracia y de verdad.',
        themeColor: '#8b5cf6'
      }
    },
    {
      id: 'node-sticky-reflection',
      type: 'stickyNode',
      position: { x: 220, y: 350 },
      data: {
        content: '🕊️ "El que hizo las estrellas y los cielos, ahora descansa en un pesebre humano para redimir la creación caída."',
        color: 'yellow',
        author: 'Reflexión en Pareja'
      }
    }
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-gen-1',
      target: 'node-concept-logos',
      label: 'Anticipación Cósmica',
      animated: true,
      style: { stroke: '#c29b38', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#c29b38' }
    },
    {
      id: 'edge-2',
      source: 'node-concept-logos',
      target: 'node-jhn-1',
      label: 'Revelación Plena',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    },
    {
      id: 'edge-3',
      source: 'node-jhn-1',
      target: 'node-jhn-14',
      label: 'Encarnación Histórica',
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
    },
    {
      id: 'edge-4',
      source: 'node-jhn-14',
      target: 'node-sticky-reflection',
      label: 'Aplicación Pastoral',
      style: { stroke: '#64748b', strokeDasharray: '5,5' }
    }
  ]
};

export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get) => ({
      canvasByStudy: {
        'study-genesis-juan': DEFAULT_GENESIS_JUAN_CANVAS
      },

      getStudyCanvas: (studyId: string) => {
        const state = get();
        return state.canvasByStudy[studyId] || { nodes: [], edges: [] };
      },

      onNodesChange: (studyId: string, changes: NodeChange[]) => {
        const current = get().getStudyCanvas(studyId);
        const updatedNodes = applyNodeChanges(changes, current.nodes) as unknown as CanvasCustomNode[];
        
        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              nodes: updatedNodes
            }
          }
        });
      },

      onEdgesChange: (studyId: string, changes: EdgeChange[]) => {
        const current = get().getStudyCanvas(studyId);
        const updatedEdges = applyEdgeChanges(changes, current.edges);

        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              edges: updatedEdges
            }
          }
        });
      },

      onConnect: (studyId: string, connection: Connection) => {
        const current = get().getStudyCanvas(studyId);
        const newEdge: Edge = {
          ...connection,
          id: `edge-${Date.now()}`,
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' }
        };

        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              edges: addEdge(newEdge, current.edges)
            }
          }
        });
      },

      addVerseNodeToCanvas: (studyId: string, verse: BibleVerse) => {
        const current = get().getStudyCanvas(studyId);
        const book = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
        const bookName = book ? book.name : verse.bookId;

        const offset = (current.nodes.length % 5) * 40;

        const newNode: CanvasCustomNode = {
          id: `verse-node-${Date.now()}`,
          type: 'verseNode',
          position: { x: 120 + offset, y: 150 + offset },
          data: {
            bookId: verse.bookId,
            bookName,
            chapter: verse.chapter,
            verse: verse.verse,
            version: verse.version,
            text: verse.text,
            themeColor: '#0284c7'
          }
        };

        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              nodes: [...current.nodes, newNode]
            }
          }
        });
      },

      addConceptNodeToCanvas: (studyId: string, data: ConceptNodeData) => {
        const current = get().getStudyCanvas(studyId);
        const offset = (current.nodes.length % 5) * 35;

        const newNode: CanvasCustomNode = {
          id: `concept-node-${Date.now()}`,
          type: 'conceptNode',
          position: { x: 250 + offset, y: 200 + offset },
          data
        };

        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              nodes: [...current.nodes, newNode]
            }
          }
        });
      },

      addStickyNodeToCanvas: (studyId: string, color: StickyNodeData['color'], content = 'Nueva nota de estudio...') => {
        const current = get().getStudyCanvas(studyId);
        const offset = (current.nodes.length % 5) * 30;

        const newNode: CanvasCustomNode = {
          id: `sticky-node-${Date.now()}`,
          type: 'stickyNode',
          position: { x: 180 + offset, y: 280 + offset },
          data: {
            content,
            color,
            author: 'Alejandro & Esposa'
          }
        };

        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              ...current,
              nodes: [...current.nodes, newNode]
            }
          }
        });
      },

      deleteNode: (studyId: string, nodeId: string) => {
        const current = get().getStudyCanvas(studyId);
        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: {
              nodes: current.nodes.filter((n) => n.id !== nodeId),
              edges: current.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
            }
          }
        });
      },

      clearCanvas: (studyId: string) => {
        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: { nodes: [], edges: [] }
          }
        });
      },

      resetToDefaultLayout: (studyId: string) => {
        set({
          canvasByStudy: {
            ...get().canvasByStudy,
            [studyId]: DEFAULT_GENESIS_JUAN_CANVAS
          }
        });
      }
    }),
    {
      name: 'koinonia-canvas-store',
      partialize: (state) => ({
        canvasByStudy: state.canvasByStudy
      })
    }
  )
);
