import React, { useState } from 'react';
import { useStudyStore } from '../../store/useStudyStore';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useThemeStore } from '../../store/useThemeStore';
import { StudyListModal } from '../study/StudyListModal';
import { ThemeDropdown } from './ThemeDropdown';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  Users,
  Layout,
  Maximize2,
  Minimize2,
  Palette,
  FileText,
  // PenTool, // Oculto temporalmente junto con Cuaderno Libre
  BookMarked
} from 'lucide-react';

interface HeaderProps {
  rightPanelTab: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
  setRightPanelTab: (tab: 'editor' | 'freebook' | 'sketchbook' | 'canvas') => void;
  onLayoutPreset: (preset: 'left-only' | 'split-50' | 'right-only') => void;
}

export const Header: React.FC<HeaderProps> = ({
  rightPanelTab,
  setRightPanelTab,
  onLayoutPreset
}) => {
  const { getActiveStudy } = useStudyStore();
  const { openLexicon } = useLexiconStore();
  const { currentTheme } = useThemeStore();
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);

  const activeStudy = getActiveStudy();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  return (
    <header
      className={`h-14 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0 z-40 select-none shadow-xs border-b transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/90 border-slate-200/90 text-slate-800'
      }`}
    >
      {/* Logotipo y Título de la Aplicación */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className={`font-serif font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Koinonía
            </h1>
            <span
              className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded ${
                isDark ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-900'
              }`}
            >
              Estudio
            </span>
          </div>
          <span className={`text-[10px] hidden sm:block -mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            Lectura bíblica & análisis colaborativo
          </span>
        </div>
      </div>

      {/* Selector Central de Estudio Activo */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => setIsStudyModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs max-w-sm ${
            isDark
              ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200'
              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800'
          }`}
          title="Cambiar o crear estudio temático"
        >
          <span className={`font-normal ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Estudio:</span>
          <span className={`truncate max-w-[200px] font-bold ${isDark ? 'text-amber-400' : 'text-indigo-900'}`}>
            {activeStudy?.title || 'Seleccionar Estudio'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Acciones y Pestañas de la Derecha */}
      <div className="flex items-center gap-2 text-xs">
        {/* Selector de pestañas para el panel derecho (en móvil se gestiona desde el Bottom Sheet) */}
        <div
          className={`hidden md:flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          <button
            onClick={() => setRightPanelTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'editor'
                ? isDark
                  ? 'bg-slate-800 text-emerald-400 shadow-xs font-bold'
                  : 'bg-white text-indigo-900 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cuaderno</span>
          </button>
          {/* Cuaderno Libre ocultado temporalmente ya que el Sketchbook funciona mejor */}
          {/* <button
            onClick={() => setRightPanelTab('freebook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'freebook'
                ? isDark
                  ? 'bg-slate-800 text-red-400 shadow-xs font-bold'
                  : 'bg-white text-red-700 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Cuaderno libre con anotaciones manuscritas, dibujos y subrayados"
          >
            <PenTool className="w-3.5 h-3.5 text-[#ff3344]" />
            <span>Cuaderno Libre ✍️</span>
          </button> */}
          <button
            onClick={() => setRightPanelTab('sketchbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'sketchbook'
                ? isDark
                  ? 'bg-slate-800 text-amber-400 shadow-xs font-bold'
                  : 'bg-white text-[#88804B] shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Sketchbook estilo Cornell: texto editable, gráficos y hojas de estudio"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#C4BC7B]" />
            <span>Sketchbook 📓</span>
          </button>
          <button
            onClick={() => setRightPanelTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              rightPanelTab === 'canvas'
                ? isDark
                  ? 'bg-slate-800 text-blue-400 shadow-xs font-bold'
                  : 'bg-white text-indigo-900 shadow-xs font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            <span>Pizarra</span>
          </button>
        </div>

        {/* Selector Desplegable de Temas y Paletas de Cuaderno Digital */}
        <ThemeDropdown />

        {/* Acceso Rápido al Panel Léxico */}
        <button
          onClick={() => openLexicon('Juan 1:1', 'Verbo')}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-medium transition-colors ${
            isDark
              ? 'border-purple-800 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300'
              : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}
          title="Abrir análisis léxico (Griego/Hebreo)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Léxico Original</span>
        </button>

        {/* Indicador de Colaboración */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 border rounded-full font-medium text-[11px] ${
            isDark
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          }`}
          title="Modo Colaborativo: Pareja conectada y sincronizada"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Modo Pareja</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Presets de tamaño de pantalla dividida */}
        <div className={`hidden lg:flex items-center gap-0.5 border-l pl-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => onLayoutPreset('left-only')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Lector bíblico a pantalla completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLayoutPreset('split-50')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Pantalla dividida 50% / 50%"
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onLayoutPreset('right-only')}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Estudio / Pizarra a pantalla completa"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de lista de estudios */}
      <StudyListModal isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} />
    </header>
  );
};
