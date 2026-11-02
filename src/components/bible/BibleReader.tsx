import React, { useEffect, useState } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleNavigation } from './BibleNavigation';
import { VerseItem } from './VerseItem';
import { PhraseSelectionMenu } from './PhraseSelectionMenu';
import { BibleVerse, BibleVersion } from '../../types/bible';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Loader2, Link2 } from 'lucide-react';

const VERSIONS: { id: BibleVersion; label: string }[] = [
  { id: 'RVR1960', label: 'RVR 1960' },
  { id: 'NVI', label: 'NVI' },
  { id: 'DHH', label: 'DHH' },
  { id: 'LBLA', label: 'LBLA' },
];

export const BibleReader: React.FC = () => {
  const {
    fetchBooks,
    chapterData,
    parallelChapterData,
    isParallelMode,
    currentVersion,
    parallelVersion,
    setParallelVersion,
    isLoading
  } = useBibleStore();
  const { currentTheme } = useThemeStore();
  const isMobile = useIsMobile();

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

  // Refs para el scroll sincronizado en paralelo
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const bottomScrollRef = React.useRef<HTMLDivElement>(null);
  const isSyncingTop = React.useRef(false);
  const isSyncingBottom = React.useRef(false);

  // Sincronización precisa basada en versículos (alineación versículo a versículo)
  const syncScrollByVerse = (
    sourceEl: HTMLDivElement,
    targetEl: HTMLDivElement,
    targetFlag: React.MutableRefObject<boolean>
  ) => {
    // Si está en el tope superior
    if (sourceEl.scrollTop <= 4) {
      targetFlag.current = true;
      targetEl.scrollTop = 0;
      return;
    }

    const sourceMax = sourceEl.scrollHeight - sourceEl.clientHeight;
    // Si está en el tope inferior
    if (sourceMax > 0 && sourceEl.scrollTop >= sourceMax - 4) {
      targetFlag.current = true;
      targetEl.scrollTop = targetEl.scrollHeight - targetEl.clientHeight;
      return;
    }

    const sourceRect = sourceEl.getBoundingClientRect();
    const sourcePaddingTop = parseFloat(window.getComputedStyle(sourceEl).paddingTop) || 14;
    const refTop = sourceRect.top + sourcePaddingTop;

    const sourceVerses = sourceEl.querySelectorAll<HTMLElement>('[data-verse-num]');
    if (!sourceVerses.length) return;

    let currentVerseNum = 1;
    let progressInVerse = 0;
    let matched = false;

    // Localizar qué versículo encabeza la vista actual en sourceEl
    for (let i = 0; i < sourceVerses.length; i++) {
      const el = sourceVerses[i];
      const rect = el.getBoundingClientRect();
      if (rect.bottom >= refTop) {
        currentVerseNum = parseInt(el.getAttribute('data-verse-num') || '1', 10);
        const h = rect.height;
        if (h > 0) {
          progressInVerse = Math.max(0, Math.min(1, (refTop - rect.top) / h));
        }
        matched = true;
        break;
      }
    }

    if (!matched && sourceVerses.length > 0) {
      const last = sourceVerses[sourceVerses.length - 1];
      currentVerseNum = parseInt(last.getAttribute('data-verse-num') || '1', 10);
    }

    // Buscar exactamente el mismo versículo en el contenedor targetEl
    const targetVerseEl = targetEl.querySelector<HTMLElement>(`[data-verse-num="${currentVerseNum}"]`);
    if (!targetVerseEl) {
      // Fallback proporcional si el versículo no existe en la otra traducción
      const targetMax = targetEl.scrollHeight - targetEl.clientHeight;
      if (sourceMax > 0 && targetMax > 0) {
        targetFlag.current = true;
        targetEl.scrollTop = (sourceEl.scrollTop / sourceMax) * targetMax;
      }
      return;
    }

    const targetVerseRect = targetVerseEl.getBoundingClientRect();
    const targetContainerRect = targetEl.getBoundingClientRect();
    const targetPaddingTop = parseFloat(window.getComputedStyle(targetEl).paddingTop) || 14;

    const currentOffsetFromContainer = targetVerseRect.top - targetContainerRect.top;
    const desiredOffsetFromContainer = targetPaddingTop - progressInVerse * targetVerseRect.height;
    const delta = currentOffsetFromContainer - desiredOffsetFromContainer;

    if (Math.abs(delta) > 0.5) {
      targetFlag.current = true;
      targetEl.scrollTop += delta;
    }
  };

  // Sincronizar scroll desde la mitad superior a la inferior
  const handleTopScroll = () => {
    if (selectedPhraseData) setSelectedPhraseData(null);
    if (isSyncingTop.current) {
      isSyncingTop.current = false;
      return;
    }
    const topEl = topScrollRef.current;
    const bottomEl = bottomScrollRef.current;
    if (!topEl || !bottomEl) return;

    syncScrollByVerse(topEl, bottomEl, isSyncingBottom);
  };

  // Sincronizar scroll desde la mitad inferior a la superior
  const handleBottomScroll = () => {
    if (selectedPhraseData) setSelectedPhraseData(null);
    if (isSyncingBottom.current) {
      isSyncingBottom.current = false;
      return;
    }
    const topEl = topScrollRef.current;
    const bottomEl = bottomScrollRef.current;
    if (!topEl || !bottomEl) return;

    syncScrollByVerse(bottomEl, topEl, isSyncingTop);
  };

  // Reiniciar scroll a 0 al cambiar de libro o capítulo
  useEffect(() => {
    if (topScrollRef.current) topScrollRef.current.scrollTop = 0;
    if (bottomScrollRef.current) bottomScrollRef.current.scrollTop = 0;
  }, [chapterData?.bookId, chapterData?.chapter, currentVersion, parallelVersion]);

  // Si hay un versículo objetivo (ej. seleccionado del selector), alinear ambas versiones en él
  const { targetVerseNum } = useBibleStore();
  useEffect(() => {
    if (targetVerseNum) {
      setTimeout(() => {
        const topVerseEl = topScrollRef.current?.querySelector<HTMLElement>(`[data-verse-num="${targetVerseNum}"]`);
        const botVerseEl = bottomScrollRef.current?.querySelector<HTMLElement>(`[data-verse-num="${targetVerseNum}"]`);
        if (topVerseEl && topScrollRef.current) {
          const topContainerRect = topScrollRef.current.getBoundingClientRect();
          const rect = topVerseEl.getBoundingClientRect();
          topScrollRef.current.scrollTop += (rect.top - topContainerRect.top - 14);
        }
        if (botVerseEl && bottomScrollRef.current) {
          const botContainerRect = bottomScrollRef.current.getBoundingClientRect();
          const rect = botVerseEl.getBoundingClientRect();
          bottomScrollRef.current.scrollTop += (rect.top - botContainerRect.top - 14);
        }
      }, 100);
    }
  }, [targetVerseNum, chapterData?.bookId, chapterData?.chapter]);

  // Cerrar el menú flotante cuando el usuario hace scroll en el texto
  const handleScroll = () => {
    if (selectedPhraseData) {
      setSelectedPhraseData(null);
    }
  };

  return (
    <div
      className="h-full flex flex-col select-text overflow-hidden transition-colors"
      style={{ backgroundColor: 'var(--bg-reader, #fdfbf7)' }}
    >
      {/* Barra de navegación superior del lector */}
      <BibleNavigation />

      {/* Estados de Carga o Sin Datos */}
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium">Cargando Sagradas Escrituras...</p>
        </div>
      ) : !chapterData ? (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
          Selecciona un libro y capítulo para comenzar la lectura.
        </div>
      ) : isParallelMode && isMobile ? (
        /* ========================================================================= */
        /* MODO COMPARACIÓN EN MÓVIL: MITAD SUPERIOR (50%) + MITAD INFERIOR (50%)     */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* 1. Mitad Superior: Versión Primaria (50% de altura, scroll independiente) */}
          <div className="flex-1 h-1/2 flex flex-col overflow-hidden border-b border-amber-300/40 dark:border-slate-800">
            {/* Cabecera compacta de la versión superior */}
            <div
              className={`px-3.5 py-1.5 flex items-center justify-between border-b shrink-0 select-none ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-amber-50/90 border-amber-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-serif font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {chapterData.bookName} {chapterData.chapter}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'text-amber-300 bg-amber-950/80 border border-amber-800/60'
                      : 'text-amber-800 bg-amber-100/90 border border-amber-200'
                  }`}
                >
                  {currentVersion}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans">
                {chapterData.verses.length} versículos
              </span>
            </div>

            {/* Lista de versículos versión 1 (scroll sincronizado) */}
            <div
              ref={topScrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-1 text-left leading-loose"
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              onScroll={handleTopScroll}
            >
              {chapterData.verses.map((verse) => (
                <VerseItem key={`top-v-${verse.bookId}-${verse.chapter}-${verse.verse}`} verse={verse} />
              ))}
            </div>
          </div>

          {/* Divisor sutil entre ambas mitades con indicador de scroll sincronizado */}
          <div
            className={`py-1 px-3.5 shrink-0 flex items-center justify-between border-y text-[10px] select-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <Link2 className="w-3.5 h-3.5" />
              <span>Desplazamiento en paralelo sincronizado</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
              1:1
            </span>
          </div>

          {/* 2. Mitad Inferior: Versión Secundaria (50% de altura, scroll sincronizado) */}
          <div className="flex-1 h-1/2 flex flex-col overflow-hidden">
            {/* Cabecera compacta con selector de versión paralela */}
            <div
              className={`px-3.5 py-1.5 flex items-center justify-between border-b shrink-0 select-none ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-blue-50/90 border-blue-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-serif font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {parallelChapterData?.bookName || chapterData.bookName} {parallelChapterData?.chapter || chapterData.chapter}
                </span>

                {/* Selector rápido de versión secundaria */}
                <select
                  value={parallelVersion}
                  onChange={(e) => setParallelVersion(e.target.value as BibleVersion)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border focus:outline-none ${
                    isDark
                      ? 'text-blue-300 bg-blue-950/80 border-blue-800/60'
                      : 'text-blue-800 bg-blue-100/90 border-blue-200'
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
              <span className="text-[11px] text-slate-400 font-sans">
                {parallelChapterData?.verses.length || 0} versículos
              </span>
            </div>

            {/* Lista de versículos versión 2 (scroll sincronizado) */}
            <div
              ref={bottomScrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-1 text-left leading-loose"
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              onScroll={handleBottomScroll}
            >
              {parallelChapterData ? (
                parallelChapterData.verses.map((verse) => (
                  <VerseItem key={`bot-pv-${verse.bookId}-${verse.chapter}-${verse.verse}`} verse={verse} />
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Cargando versión de comparación...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODO NORMAL O ESCRITORIO (Lectura estándar a pantalla completa o 2 cols)   */
        /* ========================================================================= */
        <div
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          onScroll={handleScroll}
        >
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

            {/* Columna Secundaria / Modo Paralelo en Escritorio */}
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
        </div>
      )}

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
