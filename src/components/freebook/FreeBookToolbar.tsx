import React, { useState, useRef, useEffect } from 'react';
import { useFreeBookStore } from '../../store/useFreeBookStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  PenTool,
  Highlighter,
  Eraser,
  MousePointer,
  RotateCcw,
  RotateCw,
  Trash2,
  Plus,
  ChevronDown,
  Palette,
  Check
} from 'lucide-react';

const LIGHT_COLORS = [
  { id: '#dc2626', label: 'Rojo Tinta', bg: 'bg-[#dc2626]', ring: 'ring-red-500' },
  { id: '#2563eb', label: 'Azul Estudio', bg: 'bg-[#2563eb]', ring: 'ring-blue-500' },
  { id: '#eab308', label: 'Amarillo', bg: 'bg-[#eab308]', ring: 'ring-yellow-500' },
  { id: '#16a34a', label: 'Verde', bg: 'bg-[#16a34a]', ring: 'ring-green-500' },
  { id: '#9333ea', label: 'Púrpura', bg: 'bg-[#9333ea]', ring: 'ring-purple-500' },
  { id: '#1e293b', label: 'Negro Grafito', bg: 'bg-[#1e293b]', ring: 'ring-slate-800' }
];

const DARK_COLORS = [
  { id: '#ffffff', label: 'Blanco Tiza', bg: 'bg-[#ffffff]', ring: 'ring-white' },
  { id: '#ffff00', label: 'Amarillo Flúor', bg: 'bg-[#ffff00]', ring: 'ring-yellow-400' },
  { id: '#00ff66', label: 'Verde Neón', bg: 'bg-[#00ff66]', ring: 'ring-green-400' },
  { id: '#00f0ff', label: 'Cian Neón', bg: 'bg-[#00f0ff]', ring: 'ring-cyan-400' },
  { id: '#ff007f', label: 'Rosa Flúor', bg: 'bg-[#ff007f]', ring: 'ring-pink-500' },
  { id: '#ff3344', label: 'Rojo Neón', bg: 'bg-[#ff3344]', ring: 'ring-red-500' }
];

const STROKE_WIDTHS = [
  { label: 'Fino', pen: 2, highlighter: 12 },
  { label: 'Medio', pen: 4, highlighter: 20 },
  { label: 'Grueso', pen: 7, highlighter: 30 }
];

export const FreeBookToolbar: React.FC = () => {
  const { activeStudyId } = useStudyStore();
  const {
    activeTool,
    strokeColor,
    penWidth,
    setActiveTool,
    setStrokeColor,
    setPenWidth,
    setHighlighterWidth,
    undo,
    redo,
    clearStrokes,
    addNoteBlock,
    undoStack,
    redoStack
  } = useFreeBookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    };
    if (isStyleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStyleDropdownOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStyleDropdownOpen) {
        setIsStyleDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStyleDropdownOpen]);

  const handleWidthChange = (pen: number, highlighter: number) => {
    setPenWidth(pen);
    setHighlighterWidth(highlighter);
  };

  const handleToolClick = (tool: 'pen' | 'highlighter' | 'eraser' | 'select') => {
    if (tool === activeTool && (tool === 'pen' || tool === 'highlighter')) {
      setIsStyleDropdownOpen((prev) => !prev);
    } else {
      setActiveTool(tool);
      if (tool === 'eraser' || tool === 'select') {
        setIsStyleDropdownOpen(false);
      }
    }
  };

  const currentColor = colors.find((c) => c.id === strokeColor) || colors[0];

  return (
    <div
      className={`border-b px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shadow-xs z-30 select-none transition-colors ${
        isDark
          ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800'
      }`}
    >
      {/* Grupo de Herramientas de Dibujo y Selector Desplegable */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border ${
            isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          <button
            onClick={() => handleToolClick('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'pen'
                ? isDark
                  ? 'bg-slate-700 text-red-400 shadow-sm'
                  : 'bg-white text-red-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Bolígrafo / Lápiz para notas y esquemas"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Lápiz</span>
          </button>

          <button
            onClick={() => handleToolClick('highlighter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'highlighter'
                ? isDark
                  ? 'bg-slate-700 text-amber-400 shadow-sm'
                  : 'bg-white text-amber-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Resaltador translúcido sobre el texto"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Resaltador</span>
          </button>

          <button
            onClick={() => handleToolClick('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'eraser'
                ? isDark
                  ? 'bg-slate-700 text-rose-400 shadow-sm'
                  : 'bg-white text-rose-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Goma de borrar trazos"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Goma</span>
          </button>

          <button
            onClick={() => handleToolClick('select')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'select'
                ? isDark
                  ? 'bg-slate-700 text-indigo-300 shadow-sm'
                  : 'bg-white text-indigo-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Modo interactuar / seleccionar texto"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Puntero</span>
          </button>

          {/* Botón Desplegable de Color y Estilo (No expande la barra) */}
          {(activeTool === 'pen' || activeTool === 'highlighter') && (
            <div className="relative pl-1 border-l border-slate-200 dark:border-slate-700" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsStyleDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl transition-all border ${
                  isStyleDropdownOpen
                    ? isDark
                      ? 'bg-slate-700 border-amber-500 shadow-xs'
                      : 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/30'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Configurar color y grosor de tinta (desplegable)"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs inline-block shrink-0 transition-transform"
                  style={{ backgroundColor: strokeColor }}
                />
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                    isStyleDropdownOpen ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </button>

              {/* Panel Desplegable Flotante */}
              {isStyleDropdownOpen && (
                <div
                  className={`absolute top-full left-0 mt-2 z-50 w-60 p-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white shadow-black/80'
                      : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Palette className="w-3.5 h-3.5 text-amber-500" />
                      <span>{activeTool === 'highlighter' ? 'Resaltador' : 'Color de Tinta'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentColor.label}
                    </span>
                  </div>

                  {/* Cuadrícula de colores */}
                  <div className="grid grid-cols-6 gap-2 place-items-center mb-3">
                    {colors.map((c) => {
                      const isSelected = strokeColor === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setStrokeColor(c.id);
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
                                c.id === '#ffffff' || c.id === '#ffff00' || c.id === '#00ff66' || c.id === '#00f0ff'
                                  ? 'text-black font-black'
                                  : 'text-white font-black'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Grosor dentro del desplegable */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Grosor de trazo:</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {STROKE_WIDTHS.map((w) => (
                        <button
                          key={w.label}
                          type="button"
                          onClick={() => handleWidthChange(w.pen, w.highlighter)}
                          className={`py-1 rounded-xl text-xs font-semibold transition-all border ${
                            penWidth === w.pen
                              ? isDark
                                ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                                : 'bg-slate-800 text-white border-slate-700 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deshacer, Rehacer y Limpiar */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => undo(activeStudyId)}
          disabled={undoStack.length === 0}
          className={`p-1.5 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Deshacer trazo (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => redo(activeStudyId)}
          disabled={redoStack.length === 0}
          className={`p-1.5 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Rehacer trazo (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => clearStrokes(activeStudyId)}
          className={`p-1.5 rounded-xl transition-colors ml-1 ${
            isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title="Limpiar todos los trazos manuscritos"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Añadir nueva nota de texto libre */}
        <button
          onClick={() => addNoteBlock(activeStudyId)}
          className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs rounded-xl transition-colors shadow-2xs ml-1 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              : 'bg-amber-50 hover:bg-amber-100 border-amber-200/70 text-amber-900'
          }`}
          title="Insertar nueva sección de texto"
        >
          <Plus className="w-3.5 h-3.5 text-amber-500" />
          <span>+ Texto</span>
        </button>
      </div>
    </div>
  );
};