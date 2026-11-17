import React, { useState } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { VerseItem } from './VerseItem';
import { PhraseSelectionMenu } from './PhraseSelectionMenu';
import { BibleVerse, BibleVersion } from '../../types/bible';
import { Loader2, BookOpen } from 'lucide-react';

const VERSIONS: { id: BibleVersion; label: string }[] = [
  { id: 'RVR1960', label: 'RVR 1960' },
  { id: 'RVR1909', label: 'RVR+ (Strong)' },
  { id: 'LBLA', label: 'LBLA' },
  { id: 'NVI', label: 'NVI' },
  { id: 'DHH', label: 'DHH' },
];

export const BibleParallelReader: React.FC = () => {
  const {
    chapterData,
    parallelChapterData,
    parallelVersion,
    setParallelVersion,
    isLoading
  } = useBibleStore();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

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

  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      if (!text) return;

      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode && !focusNode) return;

      const verseElement =
        (anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement)?.closest('[data-verse-ref]') ||
        (focusNode instanceof HTMLElement ? focusNode : focusNode?.parentElement)?.closest('[data-verse-ref]');

      if (!verseElement) return;

      const bookId = verseElement.getAttribute('data-verse-book') || '';
      const chapter = parseInt(verseElement.getAttribute('data-verse-chapter') || '1', 10);
      const verseNum = parseInt(verseElement.getAttribute('data-verse-num') || '1', 10);
      const version = (verseElement.getAttribute('data-verse-version') || parallelVersion) as BibleVersion;

      if (!bookId) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedPhraseData({
        phrase: text,
        verse: {
          bookId,
          chapter,
          verse: verseNum,
          text: verseElement.textContent || '',
          version
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
    }, 50);
  };

  return (
    <div
      className="h-full flex flex-col select-text overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
    >
      {/* Cabecera superior de la lectura de comparación */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b shrink-0 select-none ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-amber-50/90 border-amber-200/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className={`font-serif font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {parallelChapterData?.bookName || chapterData?.bookName || ''}{' '}
            {parallelChapterData?.chapter || chapterData?.chapter || ''}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
            Comparación
          </span>
        </div>

        {/* Selector de versión */}
        <select
          value={parallelVersion}
          onChange={(e) => setParallelVersion(e.target.value as BibleVersion)}
          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl border focus:outline-none transition-all ${
            isDark
              ? 'text-amber-300 bg-amber-950/80 border-amber-800/60'
              : 'text-amber-900 bg-white border-amber-300 shadow-2xs'
          }`}
          title="Cambiar versión para comparar"
        >
          {VERSIONS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Contenido de la lectura de comparación */}
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium">Cargando versión de comparación...</p>
        </div>
      ) : parallelChapterData ? (
        <div
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-1 text-left leading-loose"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          <div className="max-w-3xl mx-auto space-y-3">
            <div
              className={`pb-2 border-b flex items-baseline justify-between ${
                isDark ? 'border-slate-800' : 'border-amber-200/50'
              }`}
            >
              <h2
                className={`text-2xl font-serif font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {parallelChapterData.bookName} {parallelChapterData.chapter}
              </h2>
              <span className="text-xs text-slate-400 font-sans">
                {parallelChapterData.verses.length} versículos ({parallelVersion})
              </span>
            </div>

            <div className="space-y-1">
              {parallelChapterData.verses.map((verse) => (
                <VerseItem
                  key={`parallel-full-${verse.bookId}-${verse.chapter}-${verse.verse}`}
                  verse={verse}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
          No hay datos disponibles para la versión seleccionada.
        </div>
      )}

      {/* Menú contextual flotante para selección de frases */}
      {selectedPhraseData && (
        <PhraseSelectionMenu
          phrase={selectedPhraseData.phrase}
          verse={selectedPhraseData.verse}
          targetRect={selectedPhraseData.targetRect}
          onClose={() => setSelectedPhraseData(null)}
        />
      )}
    </div>
  );
};
