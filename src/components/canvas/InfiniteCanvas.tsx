import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Node,
  NodeChange
} from '@xyflow/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { VerseNode } from './nodes/VerseNode';
import { ConceptNode } from './nodes/ConceptNode';
import { StickyNode } from './nodes/StickyNode';
import { CanvasToolbar } from './CanvasToolbar';

export const InfiniteCanvas: React.FC = () => {
  const { activeStudyId } = useStudyStore();
  const { getStudyCanvas, onNodesChange, onEdgesChange, onConnect } = useCanvasStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';
  const currentCanvas = getStudyCanvas(activeStudyId);

  const nodeTypes = useMemo(
    () => ({
      verseNode: VerseNode,
      conceptNode: ConceptNode,
      stickyNode: StickyNode
    }),
    []
  );

  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none transition-colors ${
        isDark
          ? currentTheme === 'dark-blackout'
            ? 'bg-black'
            : 'bg-[#0a0f1d]'
          : 'bg-slate-50'
      }`}
    >
      {/* Barra de herramientas flotante */}
      <CanvasToolbar />

      {/* Pizarra Infinita React Flow */}
      <ReactFlow
        nodes={currentCanvas.nodes as unknown as Node[]}
        edges={currentCanvas.edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes: NodeChange[]) => onNodesChange(activeStudyId, changes)}
        onEdgesChange={(changes) => onEdgesChange(activeStudyId, changes)}
        onConnect={(connection) => onConnect(activeStudyId, connection)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={isDark ? '#334155' : '#cbd5e1'}
        />
        <Controls
          className={`!rounded-xl !overflow-hidden ${
            isDark
              ? '!bg-slate-900 !border-slate-800 !text-white'
              : '!bg-white !border-slate-200 !shadow-lg'
          }`}
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className={`!rounded-xl ${
            isDark
              ? '!bg-slate-900/90 !border-slate-800'
              : '!bg-white/80 !border-slate-200 !shadow-md'
          }`}
        />
      </ReactFlow>
    </div>
  );
};
