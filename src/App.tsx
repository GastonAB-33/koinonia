import React, { useState, useRef } from 'react';
import { Header } from './components/layout/Header';
import { ResizableLayout, ResizableLayoutHandle } from './components/layout/ResizableLayout';
import { LexiconDrawer } from './components/lexicon/LexiconDrawer';
import { useThemeStore } from './store/useThemeStore';
import { useSketchbookStore } from './store/useSketchbookStore';

export const App: React.FC = () => {
  const [rightPanelTab, setRightPanelTab] = useState<'editor' | 'freebook' | 'sketchbook' | 'canvas'>('sketchbook');
  const layoutRef = useRef<ResizableLayoutHandle>(null);
  const { currentTheme } = useThemeStore();
  const { setActiveDrawingTool } = useSketchbookStore();

  const handleSetRightPanelTab = (tab: 'editor' | 'freebook' | 'sketchbook' | 'canvas') => {
    setActiveDrawingTool('select');
    setRightPanelTab(tab);
  };

  const handleLayoutPreset = (preset: 'left-only' | 'split-50' | 'right-only') => {
    layoutRef.current?.setPreset(preset);
  };

  return (
    <div
      data-theme={currentTheme}
      className={`h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden font-sans transition-colors duration-200 theme-${currentTheme}`}
      style={{
        backgroundColor: 'var(--bg-app, #f2f7f7)',
        color: 'var(--text-main, #1e293b)'
      }}
    >
      {/* Barra de cabecera superior moderna con selector de temas y pestañas */}
      <Header
        rightPanelTab={rightPanelTab}
        setRightPanelTab={handleSetRightPanelTab}
        onLayoutPreset={handleLayoutPreset}
      />

      {/* Panel dividido redimensionable principal */}
      <ResizableLayout
        ref={layoutRef}
        rightPanelTab={rightPanelTab}
        setRightPanelTab={handleSetRightPanelTab}
      />

      {/* Drawer lateral para estudio léxico en Hebreo y Griego (Mock Gemini) */}
      <LexiconDrawer />
    </div>
  );
};

export default App;
