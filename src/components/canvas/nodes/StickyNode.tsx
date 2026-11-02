import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StickyNodeData } from '../../../types/canvas';
import { X, Heart } from 'lucide-react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { useStudyStore } from '../../../store/useStudyStore';

const COLOR_STYLES: Record<StickyNodeData['color'], { bg: string; border: string; tape: string }> = {
  yellow: { bg: 'bg-[#fef9c3]', border: 'border-[#fef08a]', tape: 'bg-[#fef08a]/80' },
  pink: { bg: 'bg-[#fce7f3]', border: 'border-[#fbcfe8]', tape: 'bg-[#fbcfe8]/80' },
  blue: { bg: 'bg-[#e0f2fe]', border: 'border-[#bae6fd]', tape: 'bg-[#bae6fd]/80' },
  green: { bg: 'bg-[#dcfce7]', border: 'border-[#bbf7d0]', tape: 'bg-[#bbf7d0]/80' },
  purple: { bg: 'bg-[#f3e8ff]', border: 'border-[#e9d5ff]', tape: 'bg-[#e9d5ff]/80' }
};

export const StickyNode = memo(({ id, data, isConnectable }: NodeProps & { data: StickyNodeData }) => {
  const { deleteNode } = useCanvasStore();
  const { activeStudyId } = useStudyStore();
  const [content, setContent] = useState(data.content);

  const style = COLOR_STYLES[data.color] || COLOR_STYLES.yellow;

  return (
    <div className={`relative ${style.bg} ${style.border} border shadow-md hover:shadow-lg rounded-xl p-3 w-56 text-slate-800 transition-all group font-sans`}>
      {/* Cinta adhesiva decorativa simulada */}
      <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 ${style.tape} rounded-sm shadow-inner opacity-80 rotate-1`} />

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-slate-500" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-slate-500" />

      {/* Cabecera y botón cerrar */}
      <div className="flex items-center justify-between pb-1 pt-1 mb-1">
        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          {data.author || 'Nota en Pareja'}
        </span>
        <button
          onClick={() => deleteNode(activeStudyId, id)}
          className="text-slate-400 hover:text-red-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar nota adhesiva"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Área de texto de la nota */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full bg-transparent border-none focus:outline-none text-xs text-slate-800 leading-relaxed resize-none"
      />

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-slate-500" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-slate-500" />
    </div>
  );
});

StickyNode.displayName = 'StickyNode';
