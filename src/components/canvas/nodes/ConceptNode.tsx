import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ConceptNodeData } from '../../../types/canvas';
import { Sparkles, X, Tag } from 'lucide-react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { useStudyStore } from '../../../store/useStudyStore';
import { useThemeStore } from '../../../store/useThemeStore';

const CATEGORY_COLORS: Record<ConceptNodeData['category'], { border: string; bg: string; text: string }> = {
  Doctrina: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
  Tipología: { border: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Contexto Histórico': { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Pregunta: { border: 'border-rose-400', bg: 'bg-rose-50', text: 'text-rose-700' },
  'Principio Práctico': { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' }
};

export const ConceptNode = memo(({ id, data, isConnectable }: NodeProps & { data: ConceptNodeData }) => {
  const { deleteNode } = useCanvasStore();
  const { activeStudyId } = useStudyStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';
  const style = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.Doctrina;

  return (
    <div
      className={`backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl border-2 ${style.border} p-3.5 w-64 transition-all group ${
        isDark ? 'bg-slate-900/95 text-white' : 'bg-white/95 text-slate-800'
      }`}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-blue-600" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!bg-blue-600" />

      {/* Categoría y botón eliminar */}
      <div className="flex items-center justify-between pb-1 mb-1">
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isDark ? 'bg-slate-800 text-blue-300 border border-slate-700' : `${style.bg} ${style.text}`
          }`}
        >
          <Sparkles className="w-2.5 h-2.5" />
          {data.category}
        </span>
        <button
          onClick={() => deleteNode(activeStudyId, id)}
          className="text-slate-400 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar nodo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Título del concepto */}
      <h4 className={`font-bold text-xs mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.title}</h4>

      {/* Descripción */}
      <p className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>{data.description}</p>

      {/* Etiquetas opcionales */}
      {data.tags && data.tags.length > 0 && (
        <div className={`flex flex-wrap gap-1 pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {data.tags.map((t) => (
            <span
              key={t}
              className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Tag className="w-2 h-2" />
              {t}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!bg-blue-600" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-blue-600" />
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';
