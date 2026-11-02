import React, { useRef, useState, useEffect } from 'react';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { SketchbookToolbar } from './SketchbookToolbar';
import { SketchbookCanvas } from './SketchbookCanvas';
import { SketchFontFamily, SketchFontSize } from '../../types/sketchbook';
import { Bookmark, Trash2, Edit3, Calendar, BookOpen } from 'lucide-react';

const FONT_CLASSES: Record<SketchFontFamily, string> = {
  serif: 'font-serif',
  sans: 'font-sans',
  handwriting: 'font-handwriting',
  mono: 'font-mono'
};

const SIZE_CLASSES: Record<SketchFontSize, string> = {
  sm: 'text-xs',
  base: 'text-sm sm:text-base leading-relaxed',
  lg: 'text-base sm:text-lg leading-relaxed',
  xl: 'text-xl sm:text-2xl leading-snug',
  '2xl': 'text-2xl sm:text-3xl leading-tight'
};

export const SketchbookWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeStudyId } = useStudyStore();
  const {
    getStudyData,
    getActivePage,
    setActivePageIndex,
    updatePageHeader,
    updatePageCornell,
    updateTextBlock,
    deleteTextBlock,
    activeDrawingTool,
    selectedBlockId,
    setSelectedBlockId,
    setActiveFontFamily,
    setActiveFontSize
  } = useSketchbookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const studyData = getStudyData(activeStudyId);
  const activePage = getActivePage(activeStudyId);
  const [dimensions, setDimensions] = useState({ width: 950, height: 1400 });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const toggleEditBlock = (blockId: string) => {
    setEditingBlockId((prev) => (prev === blockId ? null : blockId));
  };

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
  }, [activePage?.id, activePage?.blocks.length]);

  if (!activePage) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-400">
        No hay páginas en este sketchbook.
      </div>
    );
  }

  // Estilo de fondo según el patrón elegido
  const patternClass =
    activePage.pattern === 'grid'
      ? 'bg-pattern-grid'
      : activePage.pattern === 'dots'
      ? 'bg-pattern-dots'
      : activePage.pattern === 'cornell'
      ? 'bg-pattern-grid'
      : '';

  return (
    <div
      className={`h-full flex flex-col overflow-hidden select-none relative transition-colors ${
        isDark
          ? currentTheme === 'dark-blackout'
            ? 'bg-black text-white'
            : 'bg-[#0b1120] text-white'
          : 'bg-[#eef3f4] text-slate-800'
      }`}
    >
      {/* Barra de herramientas superior */}
      <SketchbookToolbar />

      {/* Área de la Libreta Digital (Tablet / Planner View) */}
      <div
        onClick={() => setSelectedBlockId(null)}
        className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 lg:p-8 flex justify-center items-start"
      >
        {/* Contenedor de la Hoja de Estudio */}
        <div className="flex items-start max-w-5xl w-full">
          {/* Hoja de Cuaderno */}
          <div
            ref={containerRef}
            className={`flex-1 min-h-[700px] sm:min-h-[950px] rounded-2xl sm:rounded-3xl shadow-xl p-3.5 sm:p-10 relative overflow-hidden transition-all ${
              isDark
                ? 'bg-slate-900 border-2 border-slate-700/80 text-white shadow-2xl'
                : 'bg-white border-2 border-[#d1e2e4]'
            } ${patternClass}`}
            style={{ touchAction: activeDrawingTool === 'select' ? 'auto' : 'none' }}
          >
            {/* Capa de Dibujo y Diagramación */}
            <SketchbookCanvas width={dimensions.width} height={dimensions.height} />

            {/* Cabecera de la Página estilo Cornell / Planner */}
            <div
              className={`relative z-10 pb-6 mb-6 border-b-2 flex flex-wrap items-baseline justify-between gap-4 ${
                isDark ? 'border-slate-700' : 'border-[#c4bc7b]/60'
              }`}
            >
              <div className="space-y-1 flex-1">
                <input
                  type="text"
                  value={activePage.subject}
                  onChange={(e) =>
                    updatePageHeader(activeStudyId, e.target.value, activePage.title)
                  }
                  placeholder="MATERIA / TEMA (ej. CRISTOLOGÍA & TEOLOGÍA)"
                  className={`font-bold text-[11px] tracking-[0.25em] uppercase bg-transparent border-none focus:outline-none w-full ${
                    isDark ? 'text-amber-400' : 'text-[#88804B]'
                  }`}
                />

                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) =>
                    updatePageHeader(activeStudyId, activePage.subject, e.target.value)
                  }
                  placeholder="Título de la sesión de estudio..."
                  className={`font-serif font-bold text-xl sm:text-2xl bg-transparent border-none focus:outline-none w-full ${
                    isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-300'
                  }`}
                />
              </div>

              <div
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-[#f4f8f8] text-slate-500 border-[#d3e2e4]'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#88804B]'}`} />
                <span className="font-medium">{activePage.date}</span>
                <span className={`font-bold ml-1 ${isDark ? 'text-amber-400' : 'text-[#88804B]'}`}>
                  Pág. {activePage.pageNumber}
                </span>
              </div>
            </div>

            {/* Cuerpo de la Página (Disposición Cornell o Libre) */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[650px]">
              {/* Columna Izquierda: Cue Column estilo Cornell */}
              {activePage.pattern === 'cornell' && (
                <div
                  className={`md:col-span-4 border-r-2 border-dashed pr-4 space-y-4 ${
                    isDark ? 'border-slate-700' : 'border-[#c4bc7b]/40'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-amber-400' : 'text-[#88804B]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ideas Clave & Glosario</span>
                  </div>
                  <textarea
                    value={activePage.cueNotes}
                    onChange={(e) =>
                      updatePageCornell(activeStudyId, e.target.value, activePage.summary)
                    }
                    placeholder="Anota aquí palabras clave, preguntas de repaso o números Strong..."
                    rows={12}
                    className={`w-full bg-transparent border-none focus:outline-none font-handwriting text-xl leading-relaxed resize-none p-1 ${
                      isDark ? 'text-slate-100 placeholder:text-slate-600' : 'text-slate-700 placeholder:text-slate-300'
                    }`}
                  />
                </div>
              )}

              {/* Columna Principal: Bloques de Notas y Versículos */}
              <div
                className={`${
                  activePage.pattern === 'cornell' ? 'md:col-span-8' : 'md:col-span-12'
                } space-y-8`}
              >
                {activePage.blocks.length === 0 ? (
                  <div
                    className={`h-64 flex flex-col items-center justify-center text-xs text-center border-2 border-dashed rounded-2xl p-6 ${
                      isDark
                        ? 'border-slate-800 text-slate-500'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    <p className="font-medium mb-1">Esta hoja está en blanco.</p>
                    <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                      Haz clic en un versículo en el lector para enviarlo aquí, o pulsa "+ Texto" para redactar notas.
                    </p>
                  </div>
                ) : (
                  activePage.blocks.map((block) => {
                    const fontClass = FONT_CLASSES[block.fontFamily] || FONT_CLASSES.serif;
                    const sizeClass = SIZE_CLASSES[block.fontSize] || SIZE_CLASSES.base;
                    const isSelected = selectedBlockId === block.id;

                    const handleBlockClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      setActiveFontFamily(block.fontFamily);
                      setActiveFontSize(block.fontSize);
                      useSketchbookStore.setState({
                        activeBold: !!block.bold,
                        activeItalic: !!block.italic
                      });
                    };

                    const handleBlockDoubleClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      setEditingBlockId(block.id);
                    };

                    return (
                      <div
                        key={block.id}
                        onClick={handleBlockClick}
                        onDoubleClick={handleBlockDoubleClick}
                        className={`relative group p-4 rounded-2xl transition-all border shadow-2xs cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'border-amber-500/80 ring-2 ring-amber-500/30 bg-slate-800/80 shadow-md'
                              : 'border-[#88804B]/80 ring-2 ring-[#88804B]/20 bg-amber-50/40 shadow-md'
                            : isDark
                            ? 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/80'
                            : 'hover:bg-white/80 border-transparent hover:border-slate-200/60'
                        }`}
                      >
                        {/* Acciones de bloque (visibles en modo select o cuando está seleccionado) */}
                        <div
                          className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity z-30 ${
                            isSelected || activeDrawingTool === 'select'
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEditBlock(block.id);
                            }}
                            className={`p-1.5 shadow-xs rounded-lg transition-colors ${
                              isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-500 hover:text-slate-800'
                            }`}
                            title="Editar texto"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTextBlock(activeStudyId, block.id);
                              if (selectedBlockId === block.id) setSelectedBlockId(null);
                            }}
                            className={`p-1.5 shadow-xs rounded-lg transition-colors ${
                              isDark ? 'bg-slate-800 text-slate-400 hover:text-red-400' : 'bg-white text-slate-400 hover:text-red-600'
                            }`}
                            title="Eliminar bloque"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Título opcional */}
                        {block.title && (
                          <h4
                            className={`text-xs font-bold tracking-widest uppercase mb-2 ${fontClass} ${
                              isDark ? 'text-amber-400' : 'text-[#88804B]'
                            }`}
                          >
                            {block.title}
                          </h4>
                        )}

                        {/* Contenido editable */}
                        {editingBlockId === block.id ? (
                          <textarea
                            value={block.content}
                            onChange={(e) =>
                              updateTextBlock(activeStudyId, block.id, {
                                content: e.target.value
                              })
                            }
                            rows={3}
                            className={`w-full rounded-xl p-3 focus:outline-none focus:ring-1 border ${
                              isDark
                                ? 'bg-slate-800 text-white border-slate-700 focus:ring-amber-500'
                                : 'bg-white border-slate-300 text-slate-800 focus:ring-[#88804B]'
                            } ${fontClass} ${sizeClass} ${block.bold ? 'font-bold' : 'font-normal'} ${block.italic ? 'italic' : 'not-italic'}`}
                            autoFocus
                          />
                        ) : (
                          <p
                            className={`${fontClass} ${sizeClass} ${
                              block.bold ? 'font-bold' : 'font-normal'
                            } ${block.italic ? 'italic' : 'not-italic'} leading-relaxed whitespace-pre-line ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}
                            style={{ color: isDark ? (block.color && block.color !== '#1e293b' ? block.color : '#ffffff') : block.color }}
                          >
                            {block.content}
                          </p>
                        )}

                        {/* Cita bíblica si proviene de las Escrituras */}
                        {block.verseRef && (
                          <div
                            className={`mt-3 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase ${
                              isDark ? 'text-red-400' : 'text-slate-500'
                            }`}
                          >
                            <Bookmark
                              className={`w-3 h-3 ${
                                isDark ? 'text-[#ff3344] fill-[#ff3344]' : 'text-[#88804B] fill-[#88804B]'
                              }`}
                            />
                            <span>
                              {block.verseRef.bookName} {block.verseRef.chapter}:
                              {block.verseRef.verse}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                                isDark
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                  : 'bg-[#d3e2e4] text-slate-700'
                              }`}
                            >
                              {block.verseRef.version}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pie de Página estilo Cornell: Resumen Teológico */}
            {activePage.pattern === 'cornell' && (
              <div
                className={`relative z-10 mt-8 pt-4 border-t-2 ${
                  isDark ? 'border-slate-700' : 'border-[#c4bc7b]/60'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-amber-400' : 'text-[#88804B]'
                  }`}
                >
                  <span>💡 Resumen Teológico de la Sesión</span>
                </div>
                <textarea
                  value={activePage.summary}
                  onChange={(e) =>
                    updatePageCornell(activeStudyId, activePage.cueNotes, e.target.value)
                  }
                  rows={3}
                  placeholder="Redacta las conclusiones finales o lecciones prácticas de este pasaje..."
                  className={`w-full bg-transparent border-none focus:outline-none text-xs leading-relaxed resize-none p-1 ${
                    isDark ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-700 placeholder:text-slate-300'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Pestañas de Índice Lateral (Margen derecho como libreta digital de iPad) */}
          <div className="hidden sm:flex flex-col -space-y-1 ml-1 pt-6 z-20">
            {studyData.pages.map((p, index) => {
              const isCurrent = index === studyData.activePageIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePageIndex(activeStudyId, index)}
                  className={`w-11 py-3 px-1 rounded-r-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-md flex flex-col items-center justify-center gap-1 border-y border-r ${
                    isCurrent
                      ? isDark
                        ? 'bg-amber-600 text-white border-amber-600 translate-x-1 font-extrabold z-10'
                        : 'bg-[#88804B] text-white border-[#88804B] translate-x-1 font-extrabold z-10'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                      : 'bg-white text-slate-600 border-[#d1e2e4] hover:bg-[#f4f8f8]'
                  }`}
                  title={`Ir a Página ${p.pageNumber}: ${p.title}`}
                >
                  <span className="text-[9px]">PÁG</span>
                  <span className="text-xs">{p.pageNumber}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
