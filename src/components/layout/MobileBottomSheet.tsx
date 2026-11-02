import React, { useState, useRef } from 'react';
import { StudyEditor } from '../study/StudyEditor';
import { InfiniteCanvas } from '../canvas/InfiniteCanvas';
import { FreeBookWorkspace } from '../freebook/FreeBookWorkspace';
import { SketchbookWorkspace } from '../sketchbook/SketchbookWorkspace';
import { useThemeStore } from '../../store/useThemeStore';
import {
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  FileText,
  BookMarked,
  Palette,
  Columns
} from 'lucide-react';

export type BottomSheetSnap = 'peek' | 'half' | 'full';

interface MobileBottomSheetProps {
  rightPanelTab: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
  setRightPanelTab?: (tab: 'editor' | 'freebook' | 'sketchbook' | 'canvas') => void;
  snapState?: BottomSheetSnap;
  onSnapChange?: (snap: BottomSheetSnap) => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  rightPanelTab,
  setRightPanelTab,
  snapState: controlledSnap,
  onSnapChange
}) => {
  const [internalSnap, setInternalSnap] = useState<BottomSheetSnap>('peek');
  const snap = controlledSnap !== undefined ? controlledSnap : internalSnap;
  const setSnap = (newSnap: BottomSheetSnap) => {
    setInternalSnap(newSnap);
    onSnapChange?.(newSnap);
  };

  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - touchStartY.current;
    touchStartY.current = null;

    if (deltaY < -40) {
      // Swipe hacia arriba
      if (snap === 'peek') setSnap('half');
      else if (snap === 'half') setSnap('full');
    } else if (deltaY > 40) {
      // Swipe hacia abajo
      if (snap === 'full') setSnap('half');
      else if (snap === 'half') setSnap('peek');
    }
  };

  // Alturas dinámicas según el snap point
  const heightClasses: Record<BottomSheetSnap, string> = {
    peek: 'h-14',
    half: 'h-[52vh]',
    full: 'h-[calc(100vh-3.5rem)]'
  };

  const tabLabels: Record<'editor' | 'freebook' | 'sketchbook' | 'canvas', { label: string; icon: any }> = {
    sketchbook: { label: 'Sketchbook Cornell', icon: BookMarked },
    editor: { label: 'Cuaderno', icon: FileText },
    canvas: { label: 'Pizarra', icon: Palette },
    freebook: { label: 'Cuaderno Libre', icon: FileText }
  };

  const ActiveIcon = tabLabels[rightPanelTab].icon;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 ease-out flex flex-col rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t overflow-hidden ${
        heightClasses[snap]
      } ${
        isDark
          ? currentTheme === 'dark-blackout'
            ? 'bg-black border-slate-800 text-white'
            : 'bg-slate-950 border-slate-800 text-white'
          : 'bg-white border-slate-200/90 text-slate-800'
      }`}
    >
      {/* Tirador y Barra de Control Superior del Bottom Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (snap === 'peek') setSnap('half');
        }}
        className={`shrink-0 px-4 py-2 flex items-center justify-between cursor-pointer border-b select-none transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-800/90'
            : 'bg-slate-50/95 border-slate-200/80 hover:bg-slate-100/90'
        }`}
      >
        {/* Lado izquierdo: Tirador + Título del panel activo */}
        <div className="flex items-center gap-2.5">
          {/* Indicador de arrastre táctil (pill) */}
          <div className="flex flex-col items-center justify-center -ml-1 pr-1">
            <span className={`w-9 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-xs">
            <ActiveIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className="tracking-tight">{tabLabels[rightPanelTab].label}</span>
          </div>

          {/* Selector de pestañas móvil cuando está abierto */}
          {snap !== 'peek' && setRightPanelTab && (
            <div
              className={`flex items-center p-0.5 ml-2 rounded-xl border text-[11px] ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setRightPanelTab('sketchbook')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  rightPanelTab === 'sketchbook'
                    ? isDark
                      ? 'bg-slate-700 text-amber-400 font-bold shadow-2xs'
                      : 'bg-white text-amber-900 font-bold shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sketchbook
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('editor')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  rightPanelTab === 'editor'
                    ? isDark
                      ? 'bg-slate-700 text-emerald-400 font-bold shadow-2xs'
                      : 'bg-white text-indigo-900 font-bold shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cuaderno
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('canvas')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  rightPanelTab === 'canvas'
                    ? isDark
                      ? 'bg-slate-700 text-blue-400 font-bold shadow-2xs'
                      : 'bg-white text-blue-900 font-bold shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pizarra
              </button>
            </div>
          )}
        </div>

        {/* Lado derecho: Botones de control de altura (Minimizar / 50% / Max) */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {snap === 'peek' && (
            <>
              <button
                type="button"
                onClick={() => setSnap('half')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                    : 'bg-amber-100/70 border-amber-300/80 text-amber-900 hover:bg-amber-100'
                }`}
                title="Abrir a mitad de pantalla para consultar versículos y anotar"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Mitad</span>
              </button>
              <button
                type="button"
                onClick={() => setSnap('full')}
                className={`p-1.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Abrir a pantalla completa"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </>
          )}

          {snap === 'half' && (
            <>
              <button
                type="button"
                onClick={() => setSnap('full')}
                className={`p-1.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Expandir a pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSnap('peek')}
                className={`p-1.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Minimizar al fondo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}

          {snap === 'full' && (
            <>
              <button
                type="button"
                onClick={() => setSnap('half')}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Reducir a mitad de pantalla"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Mitad</span>
              </button>
              <button
                type="button"
                onClick={() => setSnap('peek')}
                className={`p-1.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Minimizar al fondo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenido del Panel Activo (visible en snap half y full) */}
      <div className={`flex-1 overflow-hidden relative ${snap === 'peek' ? 'hidden' : 'block'}`}>
        {rightPanelTab === 'editor' ? (
          <StudyEditor />
        ) : rightPanelTab === 'freebook' ? (
          <FreeBookWorkspace />
        ) : rightPanelTab === 'sketchbook' ? (
          <SketchbookWorkspace />
        ) : (
          <InfiniteCanvas />
        )}
      </div>
    </div>
  );
};
