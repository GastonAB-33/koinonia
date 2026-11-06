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
  Palette,
  Check,
  Camera
} from 'lucide-react';
import { StudyCameraModal } from '../study/StudyCameraModal';

const LIGHT_SKETCH_COLORS = [
  { id: '#88804B', label: 'Verde Musgo', bg: 'bg-[#88804B]' },
  { id: '#C4BC7B', label: 'Mostaza Olivo', bg: 'bg-[#C4BC7B]' },
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

  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColorDropdownOpen(false);
      }
    };

    if (isColorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorDropdownOpen]);

  // Cerrar desplegable con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isColorDropdownOpen) {
        setIsColorDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isColorDropdownOpen]);

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
      // Si se pulsa de nuevo la herramienta ya activa, desplegar u ocultar su paleta de color
      setIsColorDropdownOpen((prev) => !prev);
    } else {
      setActiveDrawingTool(toolId);
      if (toolId === 'eraser' || toolId === 'select') {
        setIsColorDropdownOpen(false);
      }
    }
  };

  const currentColorObj = colors.find((c) => c.id === activeStrokeColor) || colors[0];

  return (
    <div
      className={`border-b px-3 sm:px-4 py-2 flex flex-col gap-2 shadow-xs z-30 select-none transition-colors ${
        isDark
          ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800'
      }`}
    >
      {/* ========================================== */}
      {/* FILA 1: Paginación y Selector de Hoja      */}
      {/* ========================================== */}
      <div className="flex items-center justify-between gap-2 w-full overflow-x-auto py-0.5">
        {/* 1. Navegación y Paginación de la Libreta */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
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

          <span className={`text-xs font-bold px-2 min-w-[85px] text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Pág. {currentPageIndex + 1} de {totalPages}
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
            onClick={() => addPage(activeStudyId, 'cornell')}
            className={`flex items-center gap-1 px-2.5 py-1 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors ml-1 ${
              isDark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[#88804B] hover:bg-[#726b3e]'
            }`}
            title="Crear nueva hoja de sketchbook"
          >
            <Plus className="w-3 h-3" />
            <span>Nueva Hoja</span>
          </button>
        </div>

        {/* 2. Selector de Estilo de Hoja (Cornell, Cuadrícula, Puntos, En Blanco) */}
        <div
          className={`flex items-center gap-1 px-2 py-1 border rounded-2xl text-xs ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Papel:</span>
          {(['cornell', 'grid', 'dots', 'blank'] as SketchPagePattern[]).map((pat) => (
            <button
              key={pat}
              onClick={() => setPagePattern(activeStudyId, pat)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                activePage?.pattern === pat
                  ? isDark
                    ? 'bg-slate-700 text-white shadow-2xs font-bold border border-slate-600'
                    : 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {pat === 'cornell' ? 'Cornell' : pat === 'grid' ? 'Cuadrícula' : pat === 'dots' ? 'Puntos' : 'Lisa'}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILA 2: Tipografía, Herramientas de Dibujo y Acciones    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-2 w-full overflow-x-auto py-1 border-t border-slate-100/90 dark:border-slate-800/80">
        {/* 3. Selector de Fuentes & Formato de Texto */}
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border text-xs ${
            isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {/* Selector de Fuente */}
          <select
            value={activeFontFamily}
            onChange={(e) => {
              const font = e.target.value as SketchFontFamily;
              setActiveFontFamily(font, activeStudyId);
              setActiveDrawingTool('select');
            }}
            className={`rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 border ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white focus:ring-amber-500'
                : 'bg-white border-slate-200 text-slate-800 focus:ring-[#88804B]'
            }`}
            title="Tipografía de texto y versículos"
          >
            <option value="serif" className={isDark ? 'bg-slate-800 text-white' : ''}>Serif Clásica</option>
            <option value="sans" className={isDark ? 'bg-slate-800 text-white' : ''}>Sans Moderna</option>
            <option value="handwriting" className={isDark ? 'bg-slate-800 text-white' : ''}>Caligráfica / Planner</option>
            <option value="mono" className={isDark ? 'bg-slate-800 text-white' : ''}>Máquina de Escribir</option>
          </select>

          {/* Selector de Tamaño */}
          <select
            value={activeFontSize}
            onChange={(e) => {
              const size = e.target.value as SketchFontSize;
              setActiveFontSize(size, activeStudyId);
              setActiveDrawingTool('select');
            }}
            className={`rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 border ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white focus:ring-amber-500'
                : 'bg-white border-slate-200 text-slate-800 focus:ring-[#88804B]'
            }`}
            title="Tamaño de letra"
          >
            <option value="sm" className={isDark ? 'bg-slate-800 text-white' : ''}>Pequeño</option>
            <option value="base" className={isDark ? 'bg-slate-800 text-white' : ''}>Normal</option>
            <option value="lg" className={isDark ? 'bg-slate-800 text-white' : ''}>Grande</option>
            <option value="xl" className={isDark ? 'bg-slate-800 text-white' : ''}>Titular</option>
          </select>

          <button
            onClick={() => {
              toggleActiveBold(activeStudyId);
              setActiveDrawingTool('select');
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              activeBold
                ? isDark
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-white'
                : isDark
                ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                : 'text-slate-600 hover:bg-white'
            }`}
            title="Negrita"
          >
            <Bold className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              toggleActiveItalic(activeStudyId);
              setActiveDrawingTool('select');
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              activeItalic
                ? isDark
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-white'
                : isDark
                ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                : 'text-slate-600 hover:bg-white'
            }`}
            title="Cursiva"
          >
            <Italic className="w-3 h-3" />
          </button>

          <button
            onClick={() => addTextBlock(activeStudyId)}
            className={`flex items-center gap-1 px-2.5 py-1 font-semibold rounded-lg shadow-2xs transition-colors ml-1 border ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Añadir nuevo bloque de texto a la hoja"
          >
            <Plus className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-[#88804B]'}`} />
            <span>Texto</span>
          </button>

          <button
            onClick={() => setIsCameraModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 font-semibold rounded-lg shadow-2xs transition-colors border ${
              isDark
                ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-800 text-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
            title="Escanear notas físicas o capturar foto con la cámara"
          >
            <Camera className="w-3 h-3 text-amber-500" />
            <span>Escanear</span>
          </button>
        </div>

        {/* Grupo de Herramientas y Acciones de Historial */}
        <div className="flex items-center gap-2">
          {/* 4. Herramientas de Dibujo & Diagramas */}
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border relative ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
            }`}
          >
            {(
              [
                { id: 'pen', icon: PenTool, label: 'Lápiz / Dibujo' },
                { id: 'highlighter', icon: Highlighter, label: 'Resaltador' },
                { id: 'eraser', icon: Eraser, label: 'Goma de borrar' },
                { id: 'select', icon: MousePointer, label: 'Puntero / Selección' }
              ] as { id: SketchDrawingTool; icon: any; label: string }[]
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleToolClick(id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeDrawingTool === id
                    ? isDark
                      ? 'bg-slate-700 text-amber-400 shadow-sm font-bold'
                      : 'bg-white text-[#88804B] shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}

            {/* BOTÓN DESPLEGABLE DE COLOR (Reemplaza los círculos en línea para no expandir el panel) */}
            {(activeDrawingTool === 'pen' || activeDrawingTool === 'highlighter') && (
              <div className="relative pl-1 border-l border-slate-200 dark:border-slate-700" ref={colorDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsColorDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl transition-all border ${
                    isColorDropdownOpen
                      ? isDark
                        ? 'bg-slate-700 border-amber-500 shadow-xs'
                        : 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Elegir color (desplegable)"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs inline-block shrink-0 transition-transform"
                    style={{ backgroundColor: activeStrokeColor }}
                  />
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                      isColorDropdownOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {/* Panel Flotante Desplegable de Colores */}
                {isColorDropdownOpen && (
                  <div
                    className={`absolute top-full right-0 mt-2 z-50 w-56 p-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Palette className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#88804B]'}`} />
                        <span>{activeDrawingTool === 'highlighter' ? 'Resaltador' : 'Color de Trazo'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[95px]">
                        {currentColorObj.label}
                      </span>
                    </div>

                    {/* Muestras de colores en cuadrícula compacta */}
                    <div className="grid grid-cols-6 gap-2 place-items-center">
                      {colors.map((c) => {
                        const isSelected = activeStrokeColor === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setActiveStrokeColor(c.id);
                              setIsColorDropdownOpen(false);
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

          {/* 5. Acciones de Deshacer, Rehacer y Limpiar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => undo(activeStudyId)}
              disabled={undoStack.length === 0}
              className={`p-1.5 rounded-xl transition-colors disabled:opacity-30 ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Deshacer trazo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => redo(activeStudyId)}
              disabled={redoStack.length === 0}
              className={`p-1.5 rounded-xl transition-colors disabled:opacity-30 ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Rehacer trazo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => clearStrokes(activeStudyId)}
              className={`p-1.5 rounded-xl transition-colors ${
                isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Limpiar dibujos de esta página"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Transcripción con Cámara */}
      <StudyCameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} />
    </div>
  );
};