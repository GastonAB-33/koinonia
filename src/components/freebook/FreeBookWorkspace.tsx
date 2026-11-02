import React, { useRef, useState, useEffect } from 'react';
import { useFreeBookStore } from '../../store/useFreeBookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { FreeBookToolbar } from './FreeBookToolbar';
import { FreeBookCanvas } from './FreeBookCanvas';
import { Bookmark, Trash2, Edit3 } from 'lucide-react';

export const FreeBookWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeStudyId } = useStudyStore();
  const {
    getStudyData,
    updateBlockContent,
    updateBlockTitle,
    deleteBlock,
    activeTool
  } = useFreeBookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const studyData = getStudyData(activeStudyId);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1600 });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Observador para sincronizar dimensiones del canvas con el contenido del papel
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.scrollWidth;
        const h = Math.max(containerRef.current.scrollHeight, 1400);
        setDimensions({ width: w, height: h });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [studyData.blocks.length]);

  return (
    <div
      className={`h-full flex flex-col overflow-hidden select-none relative transition-colors ${
        isDark
          ? currentTheme === 'dark-blackout'
            ? 'bg-black text-white'
            : 'bg-[#0b1120] text-white'
          : 'bg-[#fbf9f5] text-slate-800'
      }`}
    >
      {/* Barra de herramientas superior de dibujo y personalización */}
      <FreeBookToolbar />

      {/* Contenedor de papel / lienzo libre */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative p-8 sm:p-12 lg:p-16"
        style={{ touchAction: activeTool === 'select' ? 'auto' : 'none' }}
      >
        {/* Capa de dibujo interactiva HTML5 Canvas */}
        <FreeBookCanvas
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
        />

        {/* Capa de Contenido Editorial (Textos y Versículos) */}
        <div className="max-w-3xl mx-auto space-y-16 relative z-10">
          {studyData.blocks.map((block) => (
            <div
              key={block.id}
              className={`relative group p-6 rounded-2xl transition-all border ${
                isDark
                  ? 'border-transparent hover:bg-slate-900/60 hover:border-slate-800/80'
                  : 'hover:bg-white/40 border-transparent hover:border-slate-200/50'
              }`}
            >
              {/* Botón para eliminar bloque (visible en modo select) */}
              {activeTool === 'select' && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      setEditingBlockId(editingBlockId === block.id ? null : block.id)
                    }
                    className={`p-1.5 shadow-xs rounded-lg transition-colors ${
                      isDark
                        ? 'bg-slate-800 text-slate-300 hover:text-white'
                        : 'bg-white text-slate-400 hover:text-slate-700'
                    }`}
                    title="Editar texto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBlock(activeStudyId, block.id)}
                    className={`p-1.5 shadow-xs rounded-lg transition-colors ${
                      isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-red-400'
                        : 'bg-white text-slate-400 hover:text-red-600'
                    }`}
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Título editorial en versalitas (ej. "DERRIBANDO") */}
              {block.title && (
                <div className="mb-4">
                  {editingBlockId === block.id ? (
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) =>
                        updateBlockTitle(activeStudyId, block.id, e.target.value)
                      }
                      className={`text-xs font-bold tracking-[0.25em] uppercase rounded px-2 py-1 w-full border ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    />
                  ) : (
                    <span
                      className={`font-serif text-sm font-bold tracking-[0.3em] uppercase select-text ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {block.title}
                    </span>
                  )}
                </div>
              )}

              {/* Cuerpo del versículo o texto con tipografía espaciosa para anotaciones */}
              {editingBlockId === block.id ? (
                <textarea
                  value={block.content}
                  onChange={(e) =>
                    updateBlockContent(activeStudyId, block.id, e.target.value)
                  }
                  rows={4}
                  className={`w-full font-serif text-[20px] leading-[2.2] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-amber-500 border ${
                    isDark
                      ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                />
              ) : (
                <div
                  className={`font-serif text-[21px] sm:text-[23px] leading-[2.3] tracking-wide select-text whitespace-pre-line ${
                    isDark ? 'text-[#ffffff] font-normal' : 'text-slate-800'
                  }`}
                >
                  {block.content}
                </div>
              )}

              {/* Referencia bíblica elegante al pie (ej. 🚩 2 CORINTIOS 10:5) */}
              {block.verseRef && (
                <div
                  className={`mt-6 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase ${
                    isDark ? 'text-red-400' : 'text-slate-500'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      isDark ? 'text-[#ff3344] fill-[#ff3344]' : 'text-amber-700 fill-amber-700'
                    }`}
                  />
                  <span className="select-text">
                    {block.verseRef.bookName} {block.verseRef.chapter}:{block.verseRef.verse}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {block.verseRef.version}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Indicación de ayuda sutil al final */}
          <div
            className={`text-center pt-8 pb-16 text-xs font-serif italic border-t ${
              isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200/50'
            }`}
          >
            Utiliza el lápiz o resaltador para trazar círculos, subrayar o hacer notas manuscritas sobre los versículos.
          </div>
        </div>
      </div>
    </div>
  );
};
