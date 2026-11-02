import React, { useEffect, useState } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleNavigation } from './BibleNavigation';
import { VerseItem } from './VerseItem';
import { PhraseSelectionMenu } from './PhraseSelectionMenu';
import { BibleVerse, BibleVersion } from '../../types/bible';
import { Loader2 } from 'lucide-react';

export const BibleReader: React.FC = () => {
  const {
    fetchBooks,
    chapterData,
    parallelChapterData,
    isParallelMode,
    currentVersion,
    parallelVersion,
    isLoading
  } = useBibleStore();
  const { currentTheme } = useThemeStore();

  const [selectedPhraseData, setSelectedPhraseData] = useState<{
    phrase: string;
    verse: BibleVerse;
    targetRect: {
      top: number;
      bottom: number;
      left: number;
      right: number;
      width: number;
      height: number;
    };
  } | null>(null);

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Manejar detección de texto/frases seleccionadas en el lector bíblico
  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length === 0) {
        return;
      }

      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode && !focusNode) return;

      const verseElement =
        (anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement)?.closest('[data-verse-ref]') ||
        (focusNode instanceof HTMLElement ? focusNode : focusNode?.parentElement)?.closest('[data-verse-ref]');

      if (!verseElement) {
        return;
      }

      const bookId = verseElement.getAttribute('data-verse-book') || '';
      const chapter = parseInt(verseElement.getAttribute('data-verse-chapter') || '1', 10);
      const verseNum = parseInt(verseElement.getAttribute('data-verse-num') || '1', 10);
      const version = (verseElement.getAttribute('data-verse-version') || currentVersion) as BibleVersion;

      if (!bookId) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedPhraseData({
        phrase: text,
        verse: {
          bookId,
          chapter,
          verse: verseNum,
          version,
          text: verseElement.textContent || text
        },
        targetRect: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        }
      });
    }, 30);
  };

  // Cerrar el menú flotante cuando el usuario hace scroll en el texto
  const handleScroll = () => {
    if (selectedPhraseData) {
      setSelectedPhraseData(null);
    }
  };

  // Limpiar menú flotante cuando se deselecciona el texto
  useEffect(() => {
    const handleDocumentSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
        // No cerrar de inmediato para permitir hacer clic en los botones del menú flotante
      }
    };

    document.addEventListener('selectionchange', handleDocumentSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleDocumentSelectionChange);
    };
  }, []);

  return (
    <div
      className="h-full flex flex-col select-text overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
    >
      {/* Barra de navegación superior del lector */}
      <BibleNavigation />

      {/* Contenedor de lectura con soporte de comparación */}
      <div
        className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium">Cargando Sagradas Escrituras...</p>
          </div>
        ) : !chapterData ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Selecciona un libro y capítulo para comenzar la lectura.
          </div>
        ) : (
          <div className={`max-w-6xl mx-auto ${isParallelMode ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'max-w-3xl'}`}>
            {/* Columna Principal / Versión Primaria */}
            <div className="space-y-4">
              <div
                className={`pb-3 border-b flex items-baseline justify-between ${
                  isDark ? 'border-slate-800' : 'border-amber-200/50'
                }`}
              >
                <div>
                  <h2
                    className={`text-2xl font-serif font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {chapterData.bookName} {chapterData.chapter}
                  </h2>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${
                      isDark
                        ? 'text-amber-300 bg-amber-950/80 border border-amber-800/60'
                        : 'text-amber-700 bg-amber-100/70'
                    }`}
                  >
                    {currentVersion}
                  </span>
                </div>
                <span className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                  {chapterData.verses.length} versículos
                </span>
              </div>

              {/* Versículos de la columna principal */}
              <div className="text-left sm:text-justify leading-loose space-y-1">
                {chapterData.verses.map((verse) => (
                  <VerseItem key={`v-${verse.bookId}-${verse.chapter}-${verse.verse}`} verse={verse} />
                ))}
              </div>
            </div>

            {/* Columna Secundaria / Modo Paralelo */}
            {isParallelMode && parallelChapterData && (
              <div
                className={`space-y-4 border-t md:border-t-0 md:border-l md:pl-8 pt-6 md:pt-0 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div
                  className={`pb-3 border-b flex items-baseline justify-between ${
                    isDark ? 'border-slate-800' : 'border-blue-200/50'
                  }`}
                >
                  <div>
                    <h2
                      className={`text-2xl font-serif font-bold tracking-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {parallelChapterData.bookName} {parallelChapterData.chapter}
                    </h2>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${
                        isDark
                          ? 'text-blue-300 bg-blue-950/80 border border-blue-800/60'
                          : 'text-blue-700 bg-blue-100/70'
                      }`}
                    >
                      {parallelVersion} (Comparación)
                    </span>
                  </div>
                  <span className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {parallelChapterData.verses.length} versículos
                  </span>
                </div>

                {/* Versículos de la columna comparativa */}
                <div className="text-left sm:text-justify leading-loose space-y-1">
                  {parallelChapterData.verses.map((verse) => (
                    <VerseItem key={`pv-${verse.bookId}-${verse.chapter}-${verse.verse}`} verse={verse} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menú Flotante para frases o palabras seleccionadas */}
      {selectedPhraseData && (
        <PhraseSelectionMenu
          phrase={selectedPhraseData.phrase}
          verse={selectedPhraseData.verse}
          targetRect={selectedPhraseData.targetRect}
          onClose={() => {
            setSelectedPhraseData(null);
          }}
        />
      )}
    </div>
  );
};
