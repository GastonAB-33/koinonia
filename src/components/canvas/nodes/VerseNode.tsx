import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { VerseNodeData } from '../../../types/canvas';
import { BookOpen, X } from 'lucide-react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { useStudyStore } from '../../../store/useStudyStore';
import { useThemeStore } from '../../../store/useThemeStore';

export const VerseNode = memo(({ id, data, isConnectable }: NodeProps & { data: VerseNodeData }) => {
  const { deleteNode } = useCanvasStore();
  const { activeStudyId } = useStudyStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  return (
    <div
      className={`backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl border-2 p-3.5 w-64 transition-all group ${
        isDark
          ? 'bg-slate-900/95 border-amber-500/80 text-white'
          : 'bg-white/95 border-amber-400/80 text-slate-800'
      }`}
    >
      {/* Handles para conexiones dirigidas */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-amber-500" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-amber-500" />

      {/* Cabecera del nodo */}
      <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isDark ? 'border-amber-900/60' : 'border-amber-100'}`}>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span className={`font-bold text-xs font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {data.bookName} {data.chapter}:{data.verse}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
              isDark
                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {data.version}
          </span>
          <button
            onClick={() => deleteNode(activeStudyId, id)}
            className="text-slate-400 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar nodo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Texto del versículo */}
      <p className={`font-serif text-xs line-clamp-4 leading-relaxed italic ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
        "{data.text}"
      </p>

      {/* Handles de salida */}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-amber-500" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-amber-500" />
    </div>
  );
});

VerseNode.displayName = 'VerseNode';
