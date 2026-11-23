import React, { useState, useRef, useEffect } from 'react';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  SketchFontFamily,
  SketchFontSize,
  SketchPagePattern,
  SketchDrawingTool
} from '../../types/sketchbook';
import {
  PenTool,
  Highlighter,
  Eraser,
  MousePointer,
  Hand,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bold,
  Italic,
  Type,
  LayoutGrid,
  Check,
  MoreHorizontal
} from 'lucide-react';

const LIGHT_SKETCH_COLORS = [
  { id: '#88804B', label: 'Verde Musgo', bg: 'bg-[#88804B]' },
  { id: '#C4BC7B', label: 'Mostaza Olivo', bg: 'bg-[#C4BC7B]' },
  { id: '#f43f5e', label: 'Rosa Resaltador', bg: 'bg-[#f43f5e]' },
  { id: '#fbbf24', label: 'Amarillo Pastel', bg: 'bg-[#fbbf24]' },
  { id: '#B7D6D9', label: 'Celeste Pastel', bg: 'bg-[#B7D6D9]' },
  { id: '#dc2626', label: 'Rojo Tinta', bg: 'bg-[#dc2626]' },
  { id: '#2563eb', label: 'Azul Estudio', bg: 'bg-[#2563eb]' },
  { id: '#1e293b', label: 'Grafito', bg: 'bg-[#1e293b]' }
];

const DARK_SKETCH_COLORS = [
  { id: '#ffffff', label: 'Blanco', bg: 'bg-[#ffffff]' },
  { id: '#ffff00', label: 'Amarillo Flúor', bg: 'bg-[#ffff00]' },
  { id: '#00ff66', label: 'Verde Neón', bg: 'bg-[#00ff66]' },
  { id: '#00f0ff', label: 'Cian Neón', bg: 'bg-[#00f0ff]' },
  { id: '#ff007f', label: 'Rosa Flúor', bg: 'bg-[#ff007f]' },
  { id: '#ff3344', label: 'Rojo Neón', bg: 'bg-[#ff3344]' }
];

type OpenDropdown = 'color' | 'paper' | 'text' | 'actions' | null;

export const SketchbookToolbar: React.FC = () => {
  const { activeStudyId } = useStudyStore();
  const {
    getStudyData,
    getActivePage,
    setActivePageIndex,
    addPage,
    setPagePattern,
    addTextBlock,
    activeFontFamily,
    setActiveFontFamily,
    activeFontSize,
    setActiveFontSize,
    activeBold,
    toggleActiveBold,
    activeItalic,
    toggleActiveItalic,
    activeDrawingTool,
    setActiveDrawingTool,
    activeStrokeColor,
    setActiveStrokeColor,
    undo,
    redo,
    clearStrokes,
    undoStack,
    redoStack
  } = useSketchbookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';
  const colors = isDark ? DARK_SKETCH_COLORS : LIGHT_SKETCH_COLORS;

  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (name: 'color' | 'paper' | 'text' | 'actions') => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Cerrar desplegables al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Cerrar desplegable con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const studyData = getStudyData(activeStudyId);
  const activePage = getActivePage(activeStudyId);
  const currentPageIndex = studyData.activePageIndex;
  const totalPages = studyData.pages.length;

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setActivePageIndex(activeStudyId, currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setActivePageIndex(activeStudyId, currentPageIndex + 1);
    }
  };

  const handleToolClick = (toolId: SketchDrawingTool) => {
    if (toolId === activeDrawingTool && (toolId === 'pen' || toolId === 'highlighter')) {
      // Si se vuelve a tocar la herramienta de dibujo activa, desplegar paleta de color
      toggleDropdown('color');
    } else {
      setActiveDrawingTool(toolId);
      if (toolId === 'eraser' || toolId === 'select' || toolId === 'hand') {
        if (openDropdown === 'color') setOpenDropdown(null);
      }
    }
  };

  const currentColorObj = colors.find((c) => c.id === activeStrokeColor) || colors[0];

  const patternLabels: Record<SketchPagePattern, { label: string; desc: string }> = {
    cornell: { label: 'Cornell', desc: 'Apuntes con columna lateral y resumen' },
    grid: { label: 'Cuadrícula', desc: 'Papel cuadriculado para esquemas' },
    dots: { label: 'Puntos', desc: 'Puntos bullet journal minimalista' },
    blank: { label: 'En Blanco', desc: 'Página lisa sin guías' }
  };

  const currentPattern = activePage?.pattern || 'cornell';

  return (
    <div
      ref={toolbarRef}
      className={`border-b px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shadow-xs z-30 select-none transition-colors ${
        isDark
          ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800'
      }`}
    >
      {/* ======================================================== */}
      {/* 1. SECTOR IZQUIERDO: Paginación & Selector de Plantilla */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Paginación compacta */}
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border ${
            isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className={`p-1 rounded-xl disabled:opacity-30 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className={`text-xs font-bold px-1.5 min-w-[70px] text-center ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            {currentPageIndex + 1} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === totalPages - 1}
            className={`p-1 rounded-xl disabled:opacity-30 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => addPage(activeStudyId, currentPattern)}
            className={`flex items-center gap-1 px-2 py-1 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors ml-0.5 ${
              isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#88804B] hover:bg-[#726b3e]'
            }`}
            title="Crear nueva hoja de estudio"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Hoja</span>
          </button>
        </div>

        {/* Desplegable de Plantilla / Papel */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('paper')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-2xl text-xs font-semibold transition-all ${
              openDropdown === 'paper'
                ? isDark
                  ? 'bg-slate-700 border-amber-500 text-amber-300 shadow-xs'
                  : 'bg-white border-amber-500 text-[#88804B] shadow-xs ring-1 ring-amber-500/30'
                : isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200/90 hover:bg-white text-slate-700'
            }`}
            title="Seleccionar estilo y plantilla de hoja (menú desplegable)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
            <span>Papel: {patternLabels[currentPattern]?.label || 'Cornell'}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-150 ${
                openDropdown === 'paper' ? 'rotate-180 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Menú Flotante de Plantillas */}
          {openDropdown === 'paper' && (
            <div
              className={`absolute top-full left-0 mt-2 z-50 w-64 p-2 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Estilo de Cuaderno
              </div>
              <div className="py-1 space-y-1">
                {(['cornell', 'grid', 'dots', 'blank'] as SketchPagePattern[]).map((pat) => {
                  const isSelected = currentPattern === pat;
                  return (
                    <button
                      key={pat}
                      onClick={() => {
                        setPagePattern(activeStudyId, pat);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-amber-950/60 text-amber-300 font-bold border border-amber-800/80'
                            : 'bg-amber-50 text-[#88804B] font-bold border border-amber-200'
                          : isDark
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{patternLabels[pat].label}</div>
                        <div className="text-[10px] text-slate-400">{patternLabels[pat].desc}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTOR CENTRAL: LAS ÚNICAS HERRAMIENTAS SIEMPRE DIRECTAMENTE VISIBLES   */}
      {/*    PUNTERO, LÁPIZ, MARCADOR, GOMA (+ selector de color desplegable)       */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 shrink-0 justify-center">
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border shadow-2xs relative ${
            isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          {/* A. PUNTERO (Selección y desplazamiento seguro - Evita rayones involuntarios) */}
          <button
            onClick={() => handleToolClick('select')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDrawingTool === 'select'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-xs font-bold ring-1 ring-amber-400/30'
                  : 'bg-white text-[#88804B] shadow-xs font-bold ring-1 ring-[#88804B]/30'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Puntero: seleccionar texto y bloques"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Puntero</span>
          </button>

          {/* B. MANO / MOVER (Desplazamiento libre tipo pizarra) */}
          <button
            onClick={() => handleToolClick('hand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDrawingTool === 'hand'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-xs font-bold ring-1 ring-amber-400/30'
                  : 'bg-white text-[#88804B] shadow-xs font-bold ring-1 ring-[#88804B]/30'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mover (Mano): arrastrar para desplazarse libremente por la hoja infinita"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mover</span>
          </button>

          {/* B. LÁPIZ (Dibujo fino) */}
          <button
            onClick={() => handleToolClick('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDrawingTool === 'pen'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-xs font-bold ring-1 ring-amber-400/30'
                  : 'bg-white text-[#88804B] shadow-xs font-bold ring-1 ring-[#88804B]/30'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Lápiz: dibujo libre y notas manuscritas (pulsa de nuevo para cambiar color)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lápiz</span>
          </button>

          {/* D. MARCADOR (Resaltador translúcido) */}
          <button
            onClick={() => handleToolClick('highlighter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDrawingTool === 'highlighter'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-xs font-bold ring-1 ring-amber-400/30'
                  : 'bg-white text-[#88804B] shadow-xs font-bold ring-1 ring-[#88804B]/30'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Marcador: resaltador translúcido para textos y versículos"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marcador</span>
          </button>

          {/* E. GOMA (Borrador de trazos) */}
          <button
            onClick={() => handleToolClick('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeDrawingTool === 'eraser'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-xs font-bold ring-1 ring-amber-400/30'
                  : 'bg-white text-[#88804B] shadow-xs font-bold ring-1 ring-[#88804B]/30'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Goma de borrar: eliminar trazos dibujados"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Goma</span>
          </button>

          {/* E. MENÚ DESPLEGABLE DE COLOR (Activo únicamente al usar Lápiz o Marcador) */}
          {(activeDrawingTool === 'pen' || activeDrawingTool === 'highlighter') && (
            <div className="relative pl-1 border-l border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => toggleDropdown('color')}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl transition-all border ${
                  openDropdown === 'color'
                    ? isDark
                      ? 'bg-slate-700 border-amber-500 shadow-xs'
                      : 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Paleta desplegable de colores"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs inline-block shrink-0 transition-transform"
                  style={{ backgroundColor: activeStrokeColor }}
                />
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    openDropdown === 'color' ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </button>

              {/* Panel Flotante Desplegable de Colores */}
              {openDropdown === 'color' && (
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 p-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                      : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold">
                      {activeDrawingTool === 'highlighter' ? 'Color de Marcador' : 'Color de Lápiz'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[95px]">
                      {currentColorObj.label}
                    </span>
                  </div>

                  {/* Cuadrícula de muestras de color */}
                  <div className="grid grid-cols-6 gap-2 place-items-center">
                    {colors.map((c) => {
                      const isSelected = activeStrokeColor === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setActiveStrokeColor(c.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${c.bg} ${
                            isSelected
                              ? isDark
                                ? 'scale-110 ring-2 ring-offset-2 ring-white ring-offset-slate-900 shadow-md'
                                : 'scale-110 ring-2 ring-offset-2 ring-slate-800 ring-offset-white shadow-md'
                              : 'hover:scale-110 opacity-90 hover:opacity-100'
                          }`}
                          title={c.label}
                        >
                          {isSelected && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                c.id === '#ffffff' ||
                                c.id === '#ffff00' ||
                                c.id === '#00ff66' ||
                                c.id === '#00f0ff' ||
                                c.id === '#B7D6D9' ||
                                c.id === '#C4BC7B'
                                  ? 'text-black font-black'
                                  : 'text-white font-black'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECTOR DERECHO: MENÚS DESPLEGABLES DE TEXTO Y ACCIONES                */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 shrink-0">
        {/* A. MENÚ DESPLEGABLE DE TEXTO (+ Bloques, Tipografía, Tamaño y Estilo) */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-2xl text-xs font-semibold transition-all ${
              openDropdown === 'text'
                ? isDark
                  ? 'bg-slate-700 border-amber-500 text-amber-300 shadow-xs'
                  : 'bg-white border-amber-500 text-[#88804B] shadow-xs ring-1 ring-amber-500/30'
                : isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200/90 hover:bg-white text-slate-700'
            }`}
            title="Formato de texto, fuente, tamaño y nuevo bloque (menú desplegable)"
          >
            <Type className="w-3.5 h-3.5 text-amber-500" />
            <span>Texto</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-150 ${
                openDropdown === 'text' ? 'rotate-180 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Menú Flotante de Configuración de Texto */}
          {openDropdown === 'text' && (
            <div
              className={`absolute top-full right-0 mt-2 z-50 w-72 p-3.5 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-500" />
                  Herramientas de Texto
                </span>
              </div>

              {/* Botón principal: Insertar bloque de texto */}
              <button
                onClick={() => {
                  addTextBlock(activeStudyId);
                  setActiveDrawingTool('select');
                  setOpenDropdown(null);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-xs transition-colors mb-3 ${
                  isDark
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-[#88804B] hover:bg-[#726b3e]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir Bloque de Texto</span>
              </button>

              <div className="space-y-3">
                {/* 1. Selector de Fuente */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tipografía
                  </label>
                  <select
                    value={activeFontFamily}
                    onChange={(e) => {
                      const font = e.target.value as SketchFontFamily;
                      setActiveFontFamily(font, activeStudyId);
                      setActiveDrawingTool('select');
                    }}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 border transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:ring-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-[#88804B]'
                    }`}
                  >
                    <option value="serif">Serif Clásica (Elegante)</option>
                    <option value="sans">Sans Moderna (Limpia)</option>
                    <option value="handwriting">Caligráfica / Planner</option>
                    <option value="mono">Máquina de Escribir (Mono)</option>
                  </select>
                </div>

                {/* 2. Selector de Tamaño y Estilos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Tamaño
                    </label>
                    <select
                      value={activeFontSize}
                      onChange={(e) => {
                        const size = e.target.value as SketchFontSize;
                        setActiveFontSize(size, activeStudyId);
                        setActiveDrawingTool('select');
                      }}
                      className={`w-full rounded-xl px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 border transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:ring-amber-500'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-[#88804B]'
                      }`}
                    >
                      <option value="sm">Pequeño</option>
                      <option value="base">Normal</option>
                      <option value="lg">Grande</option>
                      <option value="xl">Titular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Estilo
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          toggleActiveBold(activeStudyId);
                          setActiveDrawingTool('select');
                        }}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${
                          activeBold
                            ? isDark
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-800 text-white border-slate-800'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                        title="Negrita"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          toggleActiveItalic(activeStudyId);
                          setActiveDrawingTool('select');
                        }}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center italic text-xs transition-colors ${
                          activeItalic
                            ? isDark
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-800 text-white border-slate-800'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                        title="Cursiva"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* B. MENÚ DESPLEGABLE DE ACCIONES (Deshacer, Rehacer y Limpiar) */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('actions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-2xl text-xs font-semibold transition-all ${
              openDropdown === 'actions'
                ? isDark
                  ? 'bg-slate-700 border-amber-500 text-amber-300 shadow-xs'
                  : 'bg-white border-amber-500 text-[#88804B] shadow-xs ring-1 ring-amber-500/30'
                : isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200/90 hover:bg-white text-slate-700'
            }`}
            title="Acciones adicionales de dibujo e historial (menú desplegable)"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Acciones</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-150 ${
                openDropdown === 'actions' ? 'rotate-180 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Menú Flotante de Acciones */}
          {openDropdown === 'actions' && (
            <div
              className={`absolute top-full right-0 mt-2 z-50 w-56 p-2 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Historial y Limpieza
              </div>
              <div className="py-1 space-y-1">
                <button
                  onClick={() => {
                    undo(activeStudyId);
                  }}
                  disabled={undoStack.length === 0}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-35 ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-200'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Deshacer trazo</span>
                </button>

                <button
                  onClick={() => {
                    redo(activeStudyId);
                  }}
                  disabled={redoStack.length === 0}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-35 ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-200'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rehacer trazo</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    clearStrokes(activeStudyId);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isDark
                      ? 'text-red-400 hover:bg-red-950/40'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Borrar dibujos de la página</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
