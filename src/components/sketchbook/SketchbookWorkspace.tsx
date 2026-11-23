import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { SketchbookToolbar } from './SketchbookToolbar';
import { SketchbookCanvas } from './SketchbookCanvas';
import { SketchFontFamily, SketchFontSize } from '../../types/sketchbook';
import {
  Bookmark,
  Trash2,
  Edit3,
  Calendar,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  PenTool
} from 'lucide-react';

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
  const workspaceRef = useRef<HTMLDivElement>(null);
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
    setActiveDrawingTool,
    selectedBlockId,
    setSelectedBlockId,
    setActiveFontFamily,
    setActiveFontSize
  } = useSketchbookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const studyData = getStudyData(activeStudyId);
  const activePage = getActivePage(activeStudyId);

  // Estado de la cámara de la pizarra infinita (Pan y Zoom)
  const [pan, setPan] = useState({ x: 60, y: 30 });
  const [zoom, setZoom] = useState(1);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const hasInitializedPosRef = useRef(false);

  // Al montar o ingresar a la sección de estudio, activar por defecto el puntero
  useEffect(() => {
    setActiveDrawingTool('select');
  }, [setActiveDrawingTool]);

  const toggleEditBlock = (blockId: string) => {
    setEditingBlockId((prev) => (prev === blockId ? null : blockId));
  };

  // Centrar la hoja en el viewport
  const handleCenter = useCallback(() => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const w = rect.width;
    const sheetWidth = 960;
    // Si la pantalla es más angosta que la hoja (ej. celular o tablet), ajustar el zoom para encajar perfectamente
    const targetZoom = w < 1000 ? Math.max(0.35, Math.min(1.0, (w - 32) / sheetWidth)) : 1.0;
    const targetPanX = Math.max(16, (w - sheetWidth * targetZoom) / 2);
    const targetPanY = 32;

    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, []);

  // Posicionamiento inicial centrado
  useEffect(() => {
    if (!hasInitializedPosRef.current && workspaceRef.current) {
      handleCenter();
      hasInitializedPosRef.current = true;
    }
  }, [handleCenter, activePage?.id]);

  // Controles de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.2));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Fondo infinito adaptable según el patrón de la página (cuadrícula, puntos, cornell, blanco)
  const infiniteBgStyle = useMemo(() => {
    if (!activePage) return {};
    const isDots = activePage.pattern === 'dots';
    const isCornellOrGrid = activePage.pattern === 'cornell' || activePage.pattern === 'grid';
    const bgSize = `${28 * zoom}px ${28 * zoom}px`;
    const bgPos = `${pan.x}px ${pan.y}px`;

    if (isDots) {
      return {
        backgroundColor: isDark
          ? currentTheme === 'dark-blackout'
            ? '#000000'
            : '#0b1120'
          : '#f8fbfc',
        backgroundImage: isDark
          ? 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.2px, transparent 1.2px)'
          : 'radial-gradient(circle, rgba(136, 128, 75, 0.22) 1.2px, transparent 1.2px)',
        backgroundSize: bgSize,
        backgroundPosition: bgPos
      };
    }

    if (isCornellOrGrid) {
      return {
        backgroundColor: isDark
          ? currentTheme === 'dark-blackout'
            ? '#000000'
            : '#0b1120'
          : '#f8fbfc',
        backgroundImage: isDark
          ? 'linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)'
          : 'linear-gradient(to right, rgba(183, 214, 217, 0.32) 1px, transparent 1px), linear-gradient(to bottom, rgba(183, 214, 217, 0.32) 1px, transparent 1px)',
        backgroundSize: bgSize,
        backgroundPosition: bgPos
      };
    }

    return {
      backgroundColor: isDark
        ? currentTheme === 'dark-blackout'
          ? '#000000'
          : '#0b1120'
        : '#fcfcfc'
    };
  }, [activePage?.pattern, isDark, currentTheme, zoom, pan.x, pan.y]);

  // Arrastre sobre el fondo cuando la herramienta es puntero
  const handleWorkspacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDrawingTool === 'select') {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const initialPan = { ...pan };

      const handlePointerMove = (moveEv: PointerEvent) => {
        setPan({
          x: initialPan.x + (moveEv.clientX - startX),
          y: initialPan.y + (moveEv.clientY - startY)
        });
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
  };

  if (!activePage) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-400">
        No hay páginas en este sketchbook.
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col overflow-hidden select-none relative transition-colors ${
        isDark
          ? currentTheme === 'dark-blackout'
            ? 'bg-black text-white'
            : 'bg-[#0b1120] text-white'
          : 'bg-[#f4f8f8] text-slate-800'
      }`}
    >
      {/* 1. Barra de herramientas superior */}
      <SketchbookToolbar />

      {/* 2. Área de Pizarra Infinita (Sin límites de hoja, movimiento libre y dibujo libre) */}
      <div
        ref={workspaceRef}
        onPointerDown={handleWorkspacePointerDown}
        style={infiniteBgStyle}
        className="flex-1 relative overflow-hidden w-full h-full touch-none select-none"
      >
        {/* Capa de Dibujo y Diagramación en Coordenadas Globales Infinitas */}
        <SketchbookCanvas
          pan={pan}
          zoom={zoom}
          onPanChange={setPan}
          onZoomChange={setZoom}
          containerRef={workspaceRef}
        />

        {/* Capa de Contenido de la Hoja de Estudio (Estructura Cornell y Bloques de Texto) */}
        <div
          onClick={() => setSelectedBlockId(null)}
          className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '960px',
            pointerEvents: activeDrawingTool === 'select' ? 'auto' : 'none'
          }}
        >
          {/* Hoja de Cuaderno Cornell / Estudio Digital (Sin recorte overflow-hidden para dibujo totalmente libre) */}
          <div
            className={`w-full min-h-[1400px] p-5 sm:p-10 rounded-3xl transition-all relative ${
              isDark
                ? 'bg-slate-900/85 border border-slate-700/80 text-white shadow-2xl'
                : 'bg-white/90 border border-[#d1e2e4] text-slate-800 shadow-xl'
            }`}
            style={{
              boxShadow: isDark
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
                : '0 25px 60px -15px rgba(183, 214, 217, 0.35)'
            }}
          >
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
                    isDark
                      ? 'text-white placeholder:text-slate-600'
                      : 'text-slate-800 placeholder:text-slate-300'
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
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[700px]">
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
                    rows={14}
                    className={`w-full bg-transparent border-none focus:outline-none font-handwriting text-xl leading-relaxed resize-none p-1 ${
                      isDark
                        ? 'text-slate-100 placeholder:text-slate-600'
                        : 'text-slate-700 placeholder:text-slate-300'
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
                        {/* Acciones de bloque */}
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
                              isDark
                                ? 'bg-slate-800 text-slate-300 hover:text-white'
                                : 'bg-white text-slate-500 hover:text-slate-800'
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
                              isDark
                                ? 'bg-slate-800 text-slate-400 hover:text-red-400'
                                : 'bg-white text-slate-400 hover:text-red-600'
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
                            } ${fontClass} ${sizeClass} ${block.bold ? 'font-bold' : 'font-normal'} ${
                              block.italic ? 'italic' : 'not-italic'
                            }`}
                            autoFocus
                          />
                        ) : (
                          <p
                            className={`${fontClass} ${sizeClass} ${
                              block.bold ? 'font-bold' : 'font-normal'
                            } ${block.italic ? 'italic' : 'not-italic'} leading-relaxed whitespace-pre-line ${
                              isDark ? 'text-white' : 'text-slate-800'
                            }`}
                            style={{
                              color: isDark
                                ? block.color && block.color !== '#1e293b'
                                  ? block.color
                                  : '#ffffff'
                                : block.color
                            }}
                          >
                            {block.content}
                          </p>
                        )}

                        {/* Cita bíblica */}
                        {block.verseRef && (
                          <div
                            className={`mt-3 flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase ${
                              isDark ? 'text-red-400' : 'text-slate-500'
                            }`}
                          >
                            <Bookmark
                              className={`w-3 h-3 ${
                                isDark
                                  ? 'text-[#ff3344] fill-[#ff3344]'
                                  : 'text-[#88804B] fill-[#88804B]'
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
                    isDark
                      ? 'text-slate-200 placeholder:text-slate-600'
                      : 'text-slate-700 placeholder:text-slate-300'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Pestañas de Índice Lateral Flotantes (Margen derecho como libreta digital de iPad) */}
        <div className="absolute right-2 top-16 z-30 hidden sm:flex flex-col -space-y-1">
          {studyData.pages.map((p, index) => {
            const isCurrent = index === studyData.activePageIndex;
            return (
              <button
                key={p.id}
                onClick={() => setActivePageIndex(activeStudyId, index)}
                className={`w-11 py-3 px-1 rounded-l-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-md flex flex-col items-center justify-center gap-1 border-y border-l ${
                  isCurrent
                    ? isDark
                      ? 'bg-amber-600 text-white border-amber-600 -translate-x-1 font-extrabold z-10'
                      : 'bg-[#88804B] text-white border-[#88804B] -translate-x-1 font-extrabold z-10'
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

        {/* 4. Barra Flotante de Navegación y Zoom (Estilo Modo Pizarra) */}
        <div
          className={`absolute bottom-4 left-4 z-30 flex items-center gap-1 p-1.5 rounded-2xl shadow-xl backdrop-blur-md border text-xs select-none transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-700 text-white shadow-black/70'
              : 'bg-white/95 border-slate-200 text-slate-800 shadow-lg'
          }`}
        >
          <button
            onClick={handleZoomIn}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Acercar (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className={`px-2 py-1 rounded-xl text-[11px] font-bold font-mono transition-colors min-w-[46px] text-center ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Restablecer zoom al 100%"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={handleZoomOut}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Alejar (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

          <button
            onClick={handleCenter}
            className={`p-1.5 rounded-xl transition-colors flex items-center gap-1 text-[11px] font-medium ${
              isDark ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Ajustar y centrar hoja de estudio"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Centrar</span>
          </button>

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

          {/* Selector rápido entre Puntero, Mano y Lápiz */}
          <div className="flex items-center gap-0.5 pl-0.5">
            <button
              onClick={() => setActiveDrawingTool('select')}
              className={`p-1.5 rounded-xl transition-all ${
                activeDrawingTool === 'select'
                  ? isDark
                    ? 'bg-slate-700 text-amber-400 font-bold'
                    : 'bg-slate-100 text-[#88804B] font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Herramienta Puntero: seleccionar texto"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveDrawingTool('hand')}
              className={`p-1.5 rounded-xl transition-all ${
                activeDrawingTool === 'hand'
                  ? isDark
                    ? 'bg-slate-700 text-amber-400 font-bold'
                    : 'bg-slate-100 text-[#88804B] font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Herramienta Mano: arrastrar y mover libremente como en la pizarra"
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveDrawingTool('pen')}
              className={`p-1.5 rounded-xl transition-all ${
                activeDrawingTool === 'pen'
                  ? isDark
                    ? 'bg-slate-700 text-amber-400 font-bold'
                    : 'bg-slate-100 text-[#88804B] font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Herramienta Lápiz: dibujar libremente"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
