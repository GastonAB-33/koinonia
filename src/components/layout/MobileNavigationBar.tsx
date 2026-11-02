import React from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Menu, BookOpen, BookMarked, FileText, Palette } from 'lucide-react';

export type MobileNavView = 'menu' | 'bible' | 'study';

interface MobileNavigationBarProps {
  activeView: MobileNavView;
  onViewChange: (view: MobileNavView) => void;
  rightPanelTab: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
}

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  activeView,
  onViewChange,
  rightPanelTab
}) => {
  const { isParallelMode } = useBibleStore();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const StudyIcon =
    rightPanelTab === 'sketchbook'
      ? BookMarked
      : rightPanelTab === 'editor'
      ? FileText
      : Palette;

  return (
    <div
      className={`shrink-0 h-14 border-t px-2 flex items-center justify-around z-30 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-colors ${
        isDark
          ? 'bg-slate-950/95 backdrop-blur-md border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800'
      }`}
    >
      {/* 1. Botón Menú (Izquierda) */}
      <button
        type="button"
        onClick={() => onViewChange('menu')}
        className={`flex-1 py-1 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeView === 'menu'
            ? isDark
              ? 'bg-slate-800 text-amber-400 font-bold shadow-xs'
              : 'bg-amber-100/70 text-amber-900 font-bold shadow-xs'
            : isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Abrir Menú (deslizar izquierda)"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">Menú</span>
      </button>

      {/* 2. Botón Lector Bíblico (Centro) */}
      <button
        type="button"
        onClick={() => onViewChange('bible')}
        className={`flex-[1.2] py-1 px-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 relative transition-all ${
          activeView === 'bible'
            ? isDark
              ? 'bg-amber-600 text-white font-bold shadow-md'
              : 'bg-amber-600 text-white font-bold shadow-md'
            : isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Lector Bíblico"
      >
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {isParallelMode && (
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                activeView === 'bible'
                  ? 'bg-white/25 text-white'
                  : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
              }`}
              title="Modo Comparación activo (Mitad superior / inferior)"
            >
              1/2
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">
          {isParallelMode ? 'Comparación' : 'Biblia'}
        </span>
      </button>

      {/* 3. Botón Herramientas de Estudio (Derecha) */}
      <button
        type="button"
        onClick={() => onViewChange('study')}
        className={`flex-1 py-1 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all ${
          activeView === 'study'
            ? isDark
              ? 'bg-slate-800 text-amber-400 font-bold shadow-xs'
              : 'bg-amber-100/70 text-amber-900 font-bold shadow-xs'
            : isDark
            ? 'text-slate-400 hover:text-white'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="Herramientas de Estudio (deslizar derecha)"
      >
        <StudyIcon className="w-4 h-4" />
        <span className="text-[10px] tracking-tight">
          {rightPanelTab === 'sketchbook'
            ? 'Sketchbook'
            : rightPanelTab === 'editor'
            ? 'Cuaderno'
            : 'Pizarra'}
        </span>
      </button>
    </div>
  );
};
