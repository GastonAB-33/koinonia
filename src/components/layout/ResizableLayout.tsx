import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { BibleReader } from '../bible/BibleReader';
import { StudyEditor } from '../study/StudyEditor';
import { InfiniteCanvas } from '../canvas/InfiniteCanvas';
import { FreeBookWorkspace } from '../freebook/FreeBookWorkspace';
import { SketchbookWorkspace } from '../sketchbook/SketchbookWorkspace';
import { MobileMenuView } from './MobileMenuView';
import { MobileNavigationBar, MobileNavView } from './MobileNavigationBar';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useThemeStore } from '../../store/useThemeStore';
import { GripVertical, ArrowLeft, BookMarked, FileText, Palette } from 'lucide-react';

export interface ResizableLayoutHandle {
  setPreset: (preset: 'left-only' | 'split-50' | 'right-only') => void;
}

interface ResizableLayoutProps {
  rightPanelTab: 'editor' | 'freebook' | 'sketchbook' | 'canvas';
  setRightPanelTab?: (tab: 'editor' | 'freebook' | 'sketchbook' | 'canvas') => void;
}

export const ResizableLayout = forwardRef<ResizableLayoutHandle, ResizableLayoutProps>(
  ({ rightPanelTab, setRightPanelTab }, ref) => {
    const leftPanelRef = useRef<ImperativePanelHandle>(null);
    const rightPanelRef = useRef<ImperativePanelHandle>(null);
    const { currentTheme } = useThemeStore();
    const isMobile = useIsMobile();

    // Estado de la vista activa en móvil: 'menu' (0) | 'bible' (1) | 'study' (2)
    const [mobileView, setMobileView] = useState<MobileNavView>('bible');

    const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

    // Manejo de gestos táctiles de deslizamiento (Swipe)
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isHorizontalSwipe = useRef<boolean>(false);

    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isHorizontalSwipe.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Verificar que el movimiento sea principalmente horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > 20) {
        isHorizontalSwipe.current = true;
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      touchStartY.current = null;

      if (!isHorizontalSwipe.current) return;
      isHorizontalSwipe.current = false;

      const SWIPE_THRESHOLD = 45;

      if (deltaX < -SWIPE_THRESHOLD) {
        // Deslizar de DERECHA a IZQUIERDA (<-)
        // Avanza hacia la pantalla de la derecha:
        // - En menú (0) pasa a biblia (1)
        // - En biblia (1) pasa a herramientas de estudio (2)
        if (mobileView === 'bible') {
          setMobileView('study');
        } else if (mobileView === 'menu') {
          setMobileView('bible');
        }
      } else if (deltaX > SWIPE_THRESHOLD) {
        // Deslizar de IZQUIERDA a DERECHA (->)
        // Retrocede hacia la pantalla de la izquierda:
        // - En herramientas de estudio (2) vuelve a biblia (1)
        // - En biblia (1) pasa a menú (0)
        if (mobileView === 'bible') {
          setMobileView('menu');
        } else if (mobileView === 'study') {
          setMobileView('bible');
        }
      }
    };

    useImperativeHandle(ref, () => ({
      setPreset: (preset) => {
        if (isMobile) {
          if (preset === 'left-only') setMobileView('bible');
          else if (preset === 'right-only') setMobileView('study');
          else if (preset === 'split-50') setMobileView('bible');
        } else {
          if (preset === 'left-only') {
            leftPanelRef.current?.resize(100);
            rightPanelRef.current?.resize(0);
          } else if (preset === 'split-50') {
            leftPanelRef.current?.resize(50);
            rightPanelRef.current?.resize(50);
          } else if (preset === 'right-only') {
            leftPanelRef.current?.resize(0);
            rightPanelRef.current?.resize(100);
          }
        }
      }
    }));

    // =========================================================================
    // VERSIÓN MÓVIL (Con carrusel animado de 3 pantallas: Menú <- Biblia -> Estudio)
    // =========================================================================
    if (isMobile) {
      return (
        <div
          className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative flex flex-col select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Contenedor con animación horizontal deslizante (Slide Animation) */}
          <div className="flex-1 w-full overflow-hidden relative">
            <div
              className="flex w-[300%] h-full transition-transform duration-300 ease-out"
              style={{
                transform:
                  mobileView === 'menu'
                    ? 'translateX(0%)'
                    : mobileView === 'bible'
                    ? 'translateX(-33.333333%)'
                    : 'translateX(-66.666667%)'
              }}
            >
              {/* 1. Vista Menú (0% - Izquierda) */}
              <div className="w-1/3 h-full flex-shrink-0 overflow-hidden">
                <MobileMenuView
                  onGoToBible={() => setMobileView('bible')}
                  onGoToStudy={() => setMobileView('study')}
                />
              </div>

              {/* 2. Vista Lector Bíblico (33.33% - Centro, con comparación mitad superior e inferior) */}
              <div
                className="w-1/3 h-full flex-shrink-0 flex flex-col transition-colors overflow-hidden"
                style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
              >
                <BibleReader />
              </div>

              {/* 3. Vista Herramientas de Estudio (66.66% - Derecha, pantalla completa) */}
              <div
                className={`w-1/3 h-full flex-shrink-0 flex flex-col overflow-hidden transition-colors ${
                  isDark
                    ? currentTheme === 'dark-blackout'
                      ? 'bg-black text-white'
                      : 'bg-slate-950 text-white'
                    : 'bg-white text-slate-800'
                }`}
              >
                {/* Cabecera superior de Herramientas de Estudio */}
                <div
                  className={`px-3 py-2 border-b flex items-center justify-between shrink-0 select-none z-20 backdrop-blur-md ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/95 border-slate-200'
                  }`}
                  // Capturar swipe en el header de herramientas para volver a biblia
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <button
                    onClick={() => setMobileView('bible')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                    title="Volver a la Biblia"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Biblia</span>
                  </button>

                  {/* Selector de pestañas de estudio */}
                  {setRightPanelTab && (
                    <div
                      className={`flex items-center p-0.5 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => setRightPanelTab('sketchbook')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                          rightPanelTab === 'sketchbook'
                            ? isDark
                              ? 'bg-slate-700 text-amber-400 font-bold shadow-xs'
                              : 'bg-white text-amber-900 font-bold shadow-xs'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        <BookMarked className="w-3.5 h-3.5 text-[#C4BC7B]" />
                        <span>Cornell</span>
                      </button>
                      <button
                        onClick={() => setRightPanelTab('editor')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                          rightPanelTab === 'editor'
                            ? isDark
                              ? 'bg-slate-700 text-emerald-400 font-bold shadow-xs'
                              : 'bg-white text-emerald-900 font-bold shadow-xs'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Notas</span>
                      </button>
                      <button
                        onClick={() => setRightPanelTab('canvas')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                          rightPanelTab === 'canvas'
                            ? isDark
                              ? 'bg-slate-700 text-blue-400 font-bold shadow-xs'
                              : 'bg-white text-blue-900 font-bold shadow-xs'
                            : isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5 text-blue-500" />
                        <span>Pizarra</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido de Herramientas de Estudio a Pantalla Completa */}
                <div className="flex-1 overflow-hidden relative">
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
            </div>
          </div>

          {/* Barra de Navegación Inferior Móvil */}
          <MobileNavigationBar
            activeView={mobileView}
            onViewChange={setMobileView}
            rightPanelTab={rightPanelTab}
          />
        </div>
      );
    }

    // =========================================================================
    // VERSIÓN ESCRITORIO (Paneles Redimensionables lado a lado con react-resizable-panels)
    // =========================================================================
    return (
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="koinonia-split-layout">
          {/* Panel Izquierdo: Lector Bíblico */}
          <Panel
            ref={leftPanelRef}
            defaultSize={50}
            minSize={25}
            collapsible
            className="flex flex-col h-full transition-colors"
            style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
          >
            <BibleReader />
          </Panel>

          {/* Divisor Redimensionable con Tirador Táctil */}
          <PanelResizeHandle
            className={`w-2.5 transition-colors flex items-center justify-center cursor-col-resize group relative shadow-inner ${
              isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-amber-100/60'
            }`}
          >
            <div
              className={`w-1 h-8 rounded-full transition-colors flex items-center justify-center ${
                isDark ? 'bg-slate-700 group-hover:bg-amber-400' : 'bg-slate-300 group-hover:bg-amber-500'
              }`}
            >
              <GripVertical
                className={`w-3 h-3 opacity-60 ${
                  isDark ? 'text-slate-400 group-hover:text-amber-300' : 'text-slate-400 group-hover:text-amber-700'
                }`}
              />
            </div>
          </PanelResizeHandle>

          {/* Panel Derecho: Alternable entre Editor, Cuaderno Libre, Sketchbook y Pizarra */}
          <Panel
            ref={rightPanelRef}
            defaultSize={50}
            minSize={25}
            collapsible
            className={`flex flex-col h-full relative transition-colors ${
              isDark ? (currentTheme === 'dark-blackout' ? 'bg-black' : 'bg-slate-950') : 'bg-white'
            }`}
          >
            {rightPanelTab === 'editor' ? (
              <StudyEditor />
            ) : rightPanelTab === 'freebook' ? (
              <FreeBookWorkspace />
            ) : rightPanelTab === 'sketchbook' ? (
              <SketchbookWorkspace />
            ) : (
              <InfiniteCanvas />
            )}
          </Panel>
        </PanelGroup>
      </div>
    );
  }
);

ResizableLayout.displayName = 'ResizableLayout';
