import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { BibleReader } from '../bible/BibleReader';
import { StudyEditor } from '../study/StudyEditor';
import { InfiniteCanvas } from '../canvas/InfiniteCanvas';
import { FreeBookWorkspace } from '../freebook/FreeBookWorkspace';
import { SketchbookWorkspace } from '../sketchbook/SketchbookWorkspace';
import { MobileBottomSheet, BottomSheetSnap } from './MobileBottomSheet';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useThemeStore } from '../../store/useThemeStore';
import { GripVertical } from 'lucide-react';

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
    const [mobileSnap, setMobileSnap] = useState<BottomSheetSnap>('half');

    const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

    useImperativeHandle(ref, () => ({
      setPreset: (preset) => {
        if (isMobile) {
          if (preset === 'left-only') setMobileSnap('peek');
          else if (preset === 'split-50') setMobileSnap('half');
          else if (preset === 'right-only') setMobileSnap('full');
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

    // Versión Móvil: Lector Bíblico a ancho completo + Bottom Sheet Deslizable
    if (isMobile) {
      return (
        <div className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden relative">
          {/* Lector Bíblico Móvil: Se ajusta el espacio inferior según el estado del Bottom Sheet */}
          <div
            className={`w-full h-full flex flex-col transition-all duration-300 overflow-hidden ${
              mobileSnap === 'peek'
                ? 'pb-14'
                : mobileSnap === 'half'
                ? 'pb-[52vh]'
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
          >
            <BibleReader />
          </div>

          {/* Hoja Inferior Deslizable (Bottom Sheet) */}
          <MobileBottomSheet
            rightPanelTab={rightPanelTab}
            setRightPanelTab={setRightPanelTab}
            snapState={mobileSnap}
            onSnapChange={setMobileSnap}
          />
        </div>
      );
    }

    // Versión Escritorio: Paneles Redimensionables lado a lado
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
