import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { StickyNodeData } from '../../types/canvas';
import { StickyNote, Sparkles, RotateCcw, Trash2, Check } from 'lucide-react';

export const CanvasToolbar: React.FC = () => {
  const { addConceptNodeToCanvas, addStickyNodeToCanvas, clearCanvas, resetToDefaultLayout } = useCanvasStore();
  const { activeStudyId } = useStudyStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [showConceptModal, setShowConceptModal] = useState(false);
  const [conceptTitle, setConceptTitle] = useState('');
  const [conceptCategory, setConceptCategory] = useState<'Doctrina' | 'Tipología' | 'Contexto Histórico' | 'Pregunta' | 'Principio Práctico'>('Doctrina');
  const [conceptDesc, setConceptDesc] = useState('');

  const handleAddConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptTitle.trim()) return;

    addConceptNodeToCanvas(activeStudyId, {
      title: conceptTitle.trim(),
      category: conceptCategory,
      description: conceptDesc.trim() || 'Concepto clave identificado en la lectura bíblica.',
      color: '#3b82f6'
    });

    setConceptTitle('');
    setConceptDesc('');
    setShowConceptModal(false);
  };

  const handleAddSticky = (color: StickyNodeData['color']) => {
    addStickyNodeToCanvas(activeStudyId, color, 'Escribe aquí tu meditación personal o en pareja...');
  };

  return (
    <>
      <div
        className={`absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 backdrop-blur-md border shadow-xl rounded-2xl p-2 text-xs transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-700 text-white'
            : 'bg-white/90 border-slate-200 text-slate-800'
        }`}
      >
        {/* Botón para añadir Concepto */}
        <button
          onClick={() => setShowConceptModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-xl transition-colors ${
            isDark
              ? 'bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
          title="Añadir tarjeta de concepto o doctrina teológica"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>+ Concepto</span>
        </button>

        {/* Botones para añadir notas adhesivas de colores */}
        <div className={`flex items-center gap-1 pl-1 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <span className={`text-[11px] font-medium px-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            <StickyNote className="w-3 h-3" /> Post-it:
          </span>
          <button
            onClick={() => handleAddSticky('yellow')}
            className="w-5 h-5 rounded-full bg-[#fef08a] border border-[#fde047] hover:scale-110 transition-transform shadow-xs"
            title="Nota amarilla"
          />
          <button
            onClick={() => handleAddSticky('pink')}
            className="w-5 h-5 rounded-full bg-[#fbcfe8] border border-[#f472b6] hover:scale-110 transition-transform shadow-xs"
            title="Nota rosa"
          />
          <button
            onClick={() => handleAddSticky('blue')}
            className="w-5 h-5 rounded-full bg-[#bae6fd] border border-[#7dd3fc] hover:scale-110 transition-transform shadow-xs"
            title="Nota celeste"
          />
          <button
            onClick={() => handleAddSticky('green')}
            className="w-5 h-5 rounded-full bg-[#bbf7d0] border border-[#86efac] hover:scale-110 transition-transform shadow-xs"
            title="Nota verde"
          />
        </div>

        {/* Acciones de gestión */}
        <div className={`flex items-center gap-1 pl-2 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={() => resetToDefaultLayout(activeStudyId)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Restablecer esquema de ejemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => clearCanvas(activeStudyId)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title="Limpiar pizarra"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal para añadir concepto */}
      {showConceptModal &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowConceptModal(false);
            }}
          >
            <div
              className={`rounded-2xl shadow-2xl border w-full max-w-md p-5 transition-colors ${
                isDark ? 'bg-slate-900 border-slate-700 text-white shadow-black/80' : 'bg-white border-slate-200 text-slate-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles className="w-4 h-4 text-blue-500" />
                Nuevo Concepto Teológico
              </h3>

              <form onSubmit={handleAddConcept} className="space-y-3 text-xs">
                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Título / Doctrina:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. La Deidad y Preexistencia de Cristo"
                    value={conceptTitle}
                    onChange={(e) => setConceptTitle(e.target.value)}
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'border-slate-200 text-slate-800'
                    }`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Categoría:
                  </label>
                  <select
                    value={conceptCategory}
                    onChange={(e) => setConceptCategory(e.target.value as any)}
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Doctrina" className={isDark ? 'bg-slate-900 text-white' : ''}>Doctrina</option>
                    <option value="Tipología" className={isDark ? 'bg-slate-900 text-white' : ''}>Tipología (Sombra y Cumplimiento)</option>
                    <option value="Contexto Histórico" className={isDark ? 'bg-slate-900 text-white' : ''}>Contexto Histórico / Geográfico</option>
                    <option value="Pregunta" className={isDark ? 'bg-slate-900 text-white' : ''}>Pregunta / Dilema Exegético</option>
                    <option value="Principio Práctico" className={isDark ? 'bg-slate-900 text-white' : ''}>Principio Práctico / Pastoral</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Descripción o Conclusiones:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Explica la relevancia teológica o relación con otros pasajes..."
                    value={conceptDesc}
                    onChange={(e) => setConceptDesc(e.target.value)}
                    className={`w-full p-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConceptModal(false)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Crear Nodo
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
