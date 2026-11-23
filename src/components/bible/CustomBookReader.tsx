import React, { useState, useRef, useMemo, useEffect } from 'react';
import { CustomBook, CustomChapter, HighlightColor } from '../../types/bible';
import { useBibleStore } from '../../store/useBibleStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLexiconStore } from '../../store/useLexiconStore';
import {
  FileText,
  Copy,
  BookMarked,
  X,
  Sparkles,
  Check,
  Trash2,
  CheckSquare
} from 'lucide-react';

export interface SentenceToken {
  key: string;
  paragraphIndex: number;
  index: number;
  text: string;
}

interface CustomBookReaderProps {
  book: CustomBook;
  chapter: CustomChapter;
}

const LIGHT_COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'bg-[#fef08a]/90 text-slate-900',
  green: 'bg-[#bbf7d0]/90 text-slate-900',
  blue: 'bg-[#bae6fd]/90 text-slate-900',
  pink: 'bg-[#fbcfe8]/90 text-slate-900',
  purple: 'bg-[#e9d5ff]/90 text-slate-900',
  orange: 'bg-[#fed7aa]/90 text-slate-900'
};

const DARK_FLUOR_COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'bg-[#ffff00] !text-black font-semibold shadow-[0_0_12px_rgba(255,255,0,0.7)] px-1 rounded',
  green: 'bg-[#00ff66] !text-black font-semibold shadow-[0_0_12px_rgba(0,255,102,0.7)] px-1 rounded',
  blue: 'bg-[#00f0ff] !text-black font-semibold shadow-[0_0_12px_rgba(0,240,255,0.7)] px-1 rounded',
  pink: 'bg-[#ff007f] !text-white font-semibold shadow-[0_0_12px_rgba(255,0,127,0.7)] px-1 rounded',
  purple: 'bg-[#bf5af2] !text-white font-semibold shadow-[0_0_12px_rgba(191,90,242,0.7)] px-1 rounded',
  orange: 'bg-[#ff6600] !text-black font-semibold shadow-[0_0_12px_rgba(255,102,0,0.7)] px-1 rounded'
};

const PALETTE_SWATCHES: { color: HighlightColor; lightBg: string; darkBg: string; label: string }[] = [
  { color: 'yellow', lightBg: 'bg-[#fef08a]', darkBg: 'bg-[#ffff00]', label: 'Amarillo' },
  { color: 'green', lightBg: 'bg-[#bbf7d0]', darkBg: 'bg-[#00ff66]', label: 'Verde' },
  { color: 'blue', lightBg: 'bg-[#bae6fd]', darkBg: 'bg-[#00f0ff]', label: 'Celeste' },
  { color: 'pink', lightBg: 'bg-[#fbcfe8]', darkBg: 'bg-[#ff007f]', label: 'Rosa' },
  { color: 'purple', lightBg: 'bg-[#e9d5ff]', darkBg: 'bg-[#bf5af2]', label: 'Lila' },
  { color: 'orange', lightBg: 'bg-[#fed7aa]', darkBg: 'bg-[#ff6600]', label: 'Naranja' }
];

export const splitParagraphIntoSentences = (
  text: string,
  paragraphIndex: number,
  bookId: string,
  chapterNum: number
): SentenceToken[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Segmentación precisa utilizando Intl.Segmenter si está disponible en el entorno
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter('es', { granularity: 'sentence' });
      const segments = Array.from(segmenter.segment(trimmed)) as { segment: string; index: number }[];
      const tokens: SentenceToken[] = [];
      let sIdx = 0;
      for (const seg of segments) {
        const segText = seg.segment.trim();
        if (segText.length > 0) {
          tokens.push({
            key: `${bookId}-${chapterNum}-${paragraphIndex}-${sIdx}`,
            paragraphIndex,
            index: sIdx,
            text: segText
          });
          sIdx++;
        }
      }
      if (tokens.length > 0) return tokens;
    } catch {
      // Fallback
    }
  }

  // Fallback con expresión regular para separar por oraciones respetando comillas y signos
  const sentenceRegex = /[^.!?…\n]+(?:[.!?…]+["'»”]?|$)/g;
  const matches = trimmed.match(sentenceRegex);
  if (!matches || matches.length === 0) {
    return [
      {
        key: `${bookId}-${chapterNum}-${paragraphIndex}-0`,
        paragraphIndex,
        index: 0,
        text: trimmed
      }
    ];
  }

  return matches
    .map((m) => m.trim())
    .filter((m) => m.length > 0)
    .map((segText, sIdx) => ({
      key: `${bookId}-${chapterNum}-${paragraphIndex}-${sIdx}`,
      paragraphIndex,
      index: sIdx,
      text: segText
    }));
};

export const CustomBookReader: React.FC<CustomBookReaderProps> = ({ book, chapter }) => {
  const { currentTheme } = useThemeStore();
  const { highlights, addSentenceHighlight, removeSentenceHighlight } = useBibleStore();
  const { studies, activeStudyId, addSentencesToActiveStudy } = useStudyStore();
  const { addPhraseToSketchbook } = useSketchbookStore();
  const { openLexicon } = useLexiconStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  // Modo Selección explícito (activado por botón o automáticamente al tener oraciones seleccionadas)
  const [manualSelectionMode, setManualSelectionMode] = useState(false);
  const [selectedSentences, setSelectedSentences] = useState<SentenceToken[]>([]);
  const isSelectionActive = manualSelectionMode || selectedSentences.length > 0;

  // Feedback de copiado o guardado
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // =========================================================================
  // DETECCIÓN RIGUROSA DE SCROLL VS TOQUE (SCROLL-LOCKOUT SHIELD)
  // =========================================================================
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Mouse desktop
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isMouseDraggingRef = useRef(false);

  // Doble toque para léxico
  const lastTapRef = useRef<{ time: number; word: string }>({ time: 0, word: '' });

  // Limpiar temporizadores pendientes
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Limpiar selección si cambia de libro o capítulo
  useEffect(() => {
    setSelectedSentences([]);
    setManualSelectionMode(false);
  }, [book.id, chapter.chapter]);

  // Mapa de oraciones extraídas en el estudio activo
  const activeStudy = useMemo(() => studies.find((s) => s.id === activeStudyId), [studies, activeStudyId]);

  const extractedSentenceKeys = useMemo(() => {
    const keys = new Set<string>();
    if (!activeStudy || !activeStudy.blocks) return keys;

    activeStudy.blocks.forEach((b) => {
      if (b.type === 'verse_quote' && b.verseRef) {
        if (b.verseRef.bookId === book.id && Number(b.verseRef.chapter) === Number(chapter.chapter)) {
          if (b.verseRef.sentenceKeys && Array.isArray(b.verseRef.sentenceKeys)) {
            b.verseRef.sentenceKeys.forEach((k) => keys.add(k));
          }
        }
      }
    });
    return keys;
  }, [activeStudy, book.id, chapter.chapter]);

  // Comprobar si una oración está extraída en el estudio
  const isSentenceExtracted = (sent: SentenceToken) => {
    if (extractedSentenceKeys.has(sent.key)) return true;
    if (!activeStudy || !activeStudy.blocks) return false;
    return activeStudy.blocks.some((b) => {
      if (b.type === 'verse_quote' && b.verseRef) {
        if (b.verseRef.bookId === book.id && Number(b.verseRef.chapter) === Number(chapter.chapter)) {
          return b.verseRef.text && b.verseRef.text.includes(sent.text);
        }
      }
      return false;
    });
  };

  // Mapa de subrayados permanentes en este capítulo
  const highlightMap = useMemo(() => {
    const map = new Map<string, HighlightColor>();
    highlights.forEach((h) => {
      if (h.bookId === book.id && h.chapter === chapter.chapter && h.sentenceKey) {
        map.set(h.sentenceKey, h.color);
      }
    });
    return map;
  }, [highlights, book.id, chapter.chapter]);

  // Alternar selección de una oración
  const toggleSentence = (sent: SentenceToken) => {
    setSelectedSentences((prev) => {
      const exists = prev.some((s) => s.key === sent.key);
      if (exists) {
        return prev.filter((s) => s.key !== sent.key);
      } else {
        return [...prev, sent];
      }
    });
  };

  // =========================================================================
  // GESTOS TÁCTILES (MÓVIL / TABLET): TOQUE SOSTENIDO SEGURO
  // =========================================================================
  const handleTouchStart = (sent: SentenceToken, e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    isScrollingRef.current = false;
    isLongPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Si NO estamos en modo de selección activa, iniciar temporizador de Long Press (350ms)
    if (!isSelectionActive) {
      longPressTimerRef.current = setTimeout(() => {
        // Solo disparar si NO hubo movimiento de scroll alguno
        if (!isScrollingRef.current) {
          isLongPressTriggeredRef.current = true;
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate(35);
            } catch {
              // ignore
            }
          }
          toggleSentence(sent);
        }
      }, 350);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const touch = e.touches[0];
    const dist = Math.hypot(
      touch.clientX - touchStartPosRef.current.x,
      touch.clientY - touchStartPosRef.current.y
    );

    // Si el dedo se movió más de 7 píxeles, es claramente un deslizamiento/scroll
    if (dist > 7) {
      isScrollingRef.current = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = (sent: SentenceToken, e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 1. Si hubo desplazamiento (scroll), IGNORAR por completo (NUNCA seleccionar ni deseleccionar)
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      touchStartPosRef.current = null;
      return;
    }
    touchStartPosRef.current = null;

    // 2. Si ya disparó el long-press en este toque, terminar
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      e.preventDefault();
      return;
    }

    // 3. Si estamos en modo de selección activa y fue un tap limpio (sin scroll):
    if (isSelectionActive) {
      e.preventDefault();
      toggleSentence(sent);
    }
  };

  // =========================================================================
  // GESTOS DE RATÓN (DESKTOP)
  // =========================================================================
  const handleMouseDown = (sent: SentenceToken, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseStartPosRef.current = { x: e.clientX, y: e.clientY };
    isMouseDraggingRef.current = false;
    isLongPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isSelectionActive) {
      longPressTimerRef.current = setTimeout(() => {
        if (!isMouseDraggingRef.current) {
          isLongPressTriggeredRef.current = true;
          toggleSentence(sent);
        }
      }, 350);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseStartPosRef.current) return;
    const dist = Math.hypot(
      e.clientX - mouseStartPosRef.current.x,
      e.clientY - mouseStartPosRef.current.y
    );
    if (dist > 6) {
      isMouseDraggingRef.current = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleMouseUp = (sent: SentenceToken) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isMouseDraggingRef.current) {
      isMouseDraggingRef.current = false;
      mouseStartPosRef.current = null;
      return;
    }
    mouseStartPosRef.current = null;

    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (isSelectionActive) {
      toggleSentence(sent);
    }
  };

  // Manejar doble toque en palabras para Léxico
  const handleWordTap = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionActive) return;

    const clean = word.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '').trim();
    if (!clean) return;

    const now = Date.now();
    if (lastTapRef.current.word === clean && now - lastTapRef.current.time < 380) {
      lastTapRef.current = { time: 0, word: '' };
      window.getSelection()?.removeAllRanges();
      openLexicon(`${book.title} Cap. ${chapter.chapter}`, clean);
      return;
    }
    lastTapRef.current = { time: now, word: clean };
  };

  // Ordenar oraciones seleccionadas según su orden de aparición en el texto
  const getSortedSelection = () => {
    return [...selectedSentences].sort((a, b) => {
      if (a.paragraphIndex !== b.paragraphIndex) {
        return a.paragraphIndex - b.paragraphIndex;
      }
      return a.index - b.index;
    });
  };

  // ACCIÓN 1: Enviar al estudio
  const handleSendToStudy = () => {
    const sorted = getSortedSelection();
    if (sorted.length === 0) return;

    addSentencesToActiveStudy(book.id, chapter.chapter, sorted);
    setToastMessage(`✓ ${sorted.length} ${sorted.length === 1 ? 'oración agregada' : 'oraciones agregadas'} al estudio`);
    setSelectedSentences([]);
    setManualSelectionMode(false);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ACCIÓN 2: Aplicar subrayado permanente con color
  const handleApplyHighlight = (color: HighlightColor) => {
    const sorted = getSortedSelection();
    sorted.forEach((sent) => {
      addSentenceHighlight(book.id, chapter.chapter, sent.key, color, sent.text);
    });
    setSelectedSentences([]);
    setManualSelectionMode(false);
  };

  // ACCIÓN 3: Quitar subrayado
  const handleRemoveHighlight = () => {
    const sorted = getSortedSelection();
    sorted.forEach((sent) => {
      removeSentenceHighlight(sent.key);
    });
    setSelectedSentences([]);
    setManualSelectionMode(false);
  };

  // ACCIÓN 4: Enviar a Sketchbook
  const handleSendToSketchbook = () => {
    const sorted = getSortedSelection();
    if (sorted.length === 0) return;

    const combined = sorted.map((s) => s.text).join(' ');
    addPhraseToSketchbook(activeStudyId, combined, {
      bookId: book.id,
      chapter: chapter.chapter,
      verse: sorted[0].paragraphIndex + 1,
      version: 'LIBRO' as any,
      text: combined
    });
    setToastMessage('✓ Enviado al Sketchbook (Cornell)');
    setSelectedSentences([]);
    setManualSelectionMode(false);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ACCIÓN 5: Copiar texto seleccionado
  const handleCopy = () => {
    const sorted = getSortedSelection();
    if (sorted.length === 0) return;

    const combined = sorted.map((s) => s.text).join(' ');
    const citation = `«${combined}» (${book.title} — Cap. ${chapter.chapter})`;
    navigator.clipboard.writeText(citation);
    setToastMessage('✓ Copiado al portapapeles');
    setSelectedSentences([]);
    setManualSelectionMode(false);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const colorPalette = isDark ? DARK_FLUOR_COLOR_MAP : LIGHT_COLOR_MAP;

  return (
    <div className="relative text-left leading-relaxed pb-32">
      {/* Toast de confirmación flotante */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA SUPERIOR DEL LIBRO: TÍTULO, CAPÍTULO Y BOTÓN DE MODO SELECCIÓN      */}
      {/* ========================================================================= */}
      <div className="mb-4 flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10 select-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {chapter.paragraphs.length} párrafos · {book.title}
        </span>

        {/* Botón explícito para activar/desactivar modo selección */}
        <button
          onClick={() => {
            if (isSelectionActive) {
              setManualSelectionMode(false);
              setSelectedSentences([]);
            } else {
              setManualSelectionMode(true);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isSelectionActive
              ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-400/40'
              : isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
          title={isSelectionActive ? 'Salir del modo selección' : 'Activar modo selección para tocar oraciones'}
        >
          {isSelectionActive ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Salir de selección</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Seleccionar oraciones</span>
            </>
          )}
        </button>
      </div>

      {/* Banner de ayuda si el modo selección está activo */}
      {isSelectionActive && (
        <div className="mb-4 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Toca cualquier oración para sumarla o quitarla de la selección. Deslizar para scroll está 100% protegido.</span>
          </div>
          <button
            onClick={() => {
              setManualSelectionMode(false);
              setSelectedSentences([]);
            }}
            className="text-amber-700 dark:text-amber-300 font-bold hover:underline ml-2 shrink-0 cursor-pointer"
          >
            Listo
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEXTO CONTINUO POR PÁRRAFOS NATURALES (SIN CAJAS, VIOLETA NI 3 PUNTOS)    */}
      {/* ========================================================================= */}
      <div className="space-y-4 sm:space-y-5">
        {chapter.paragraphs.map((paragraphText, pIdx) => {
          const sentences = splitParagraphIntoSentences(paragraphText, pIdx, book.id, chapter.chapter);

          return (
            <p
              key={`custom-p-${pIdx}`}
              className={`font-serif text-[18px] sm:text-[19px] leading-loose select-text transition-colors ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              {sentences.map((sent) => {
                const isSelected = selectedSentences.some((s) => s.key === sent.key);
                const highlightColor = highlightMap.get(sent.key);
                const isExtracted = isSentenceExtracted(sent);

                // Estilo visual de la oración según su estado
                let sentenceClass = 'transition-all duration-150 rounded cursor-pointer ';

                if (isSelected) {
                  // Resaltado de selección activa (cuando el usuario la tiene seleccionada con touch o click)
                  sentenceClass += isDark
                    ? 'bg-[#ffff00] !text-black font-semibold ring-2 ring-amber-300 shadow-[0_0_14px_rgba(255,255,0,0.9)] px-1.5 py-0.5 '
                    : 'bg-amber-300 text-amber-950 font-medium ring-2 ring-amber-500 shadow-xs px-1.5 py-0.5 ';
                } else if (highlightColor) {
                  // Resaltado permanente de color
                  sentenceClass += `${colorPalette[highlightColor]} `;
                  if (isExtracted) {
                    sentenceClass += isDark
                      ? 'ring-2 ring-emerald-400 border-b-2 border-emerald-400 '
                      : 'ring-2 ring-emerald-500 border-b-2 border-emerald-600 ';
                  }
                } else if (isExtracted) {
                  // Resaltado automático de oración extraída en el estudio
                  sentenceClass += isDark
                    ? 'bg-emerald-950/70 border-b-2 border-emerald-400 text-emerald-200 px-1 '
                    : 'bg-emerald-100/90 text-emerald-950 border-b-2 border-emerald-600 px-1 ';
                } else {
                  // Estado normal: hover sutil para indicar interactividad
                  sentenceClass += isDark
                    ? 'hover:bg-slate-800/60 active:bg-slate-700/60 '
                    : 'hover:bg-amber-50/80 active:bg-amber-100/70 ';
                }

                // Tokenizar palabras para soportar doble toque en léxico
                const words = sent.text.split(/(\s+)/);

                return (
                  <span
                    key={sent.key}
                    data-sentence-key={sent.key}
                    onTouchStart={(e) => handleTouchStart(sent, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(sent, e)}
                    onMouseDown={(e) => handleMouseDown(sent, e)}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => handleMouseUp(sent)}
                    onContextMenu={(e) => {
                      if (isSelectionActive) e.preventDefault();
                    }}
                    className={sentenceClass}
                    title={
                      isSelected
                        ? 'Oración seleccionada'
                        : isExtracted
                        ? 'Oración extraída en tu estudio actual'
                        : isSelectionActive
                        ? 'Toca para seleccionar esta oración'
                        : 'Mantén presionado para seleccionar | Doble toque para Léxico'
                    }
                  >
                    {/* Indicador de check cuando está seleccionada */}
                    {isSelected && (
                      <span className="inline-flex items-center justify-center mr-1 text-[10px] bg-amber-600 text-white dark:bg-black dark:text-yellow-300 px-1 rounded font-bold">
                        ✓
                      </span>
                    )}

                    {words.map((w, wIdx) => {
                      if (/^\s+$/.test(w)) {
                        return <React.Fragment key={wIdx}>{w}</React.Fragment>;
                      }
                      return (
                        <span
                          key={wIdx}
                          onClick={(e) => handleWordTap(w, e)}
                          className="inline select-text"
                        >
                          {w}
                        </span>
                      );
                    })}

                    {/* Distintivo si está extraída en el cuaderno de estudio */}
                    {isExtracted && !isSelected && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 mx-1 rounded-full select-none align-middle shadow-xs ${
                          isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white'
                        }`}
                        title="Esta oración forma parte de tu cuaderno de estudio actual"
                      >
                        <span>📝</span>
                        <span className="hidden sm:inline">En Estudio</span>
                      </span>
                    )}
                    {' '}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE ACCIÓN FLOTANTE (APARECE AL SELECCIONAR UNA O VARIAS ORACIONES)   */}
      {/* ========================================================================= */}
      {selectedSentences.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-lg">
          <div
            style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', opacity: 1 }}
            className={`rounded-2xl p-3 border-2 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-700 text-white shadow-[0_16px_50px_rgba(0,0,0,0.95)]' : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
            }`}
          >
            {/* Fila superior: Contador de oraciones y botón cerrar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10 dark:border-white/10 select-none">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {selectedSentences.length}{' '}
                  {selectedSentences.length === 1 ? 'oración seleccionada' : 'oraciones seleccionadas'}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSentences([]);
                  setManualSelectionMode(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                title="Deseleccionar todo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fila de acciones principales */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Botón principal: Insertar en Estudio */}
              <button
                onClick={handleSendToStudy}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                title="Insertar las oraciones seleccionadas en el cuaderno de estudio activo"
              >
                <FileText className="w-4 h-4" />
                <span>Insertar en Estudio</span>
              </button>

              {/* Botón: Sketchbook Cornell */}
              <button
                onClick={handleSendToSketchbook}
                className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-amber-950/80 border-slate-700 hover:border-amber-500 text-amber-300'
                    : 'bg-slate-100 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-amber-700'
                }`}
                title="Enviar al Sketchbook (Cornell 📓)"
              >
                <BookMarked className="w-4 h-4" />
              </button>

              {/* Botón: Copiar con cita */}
              <button
                onClick={handleCopy}
                className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Copiar texto con cita"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Fila de subrayadores rápidos */}
            <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {isDark ? '⚡ Subrayar:' : 'Subrayar:'}
              </span>
              <div className="flex items-center gap-1.5">
                {PALETTE_SWATCHES.map(({ color, lightBg, darkBg, label }) => (
                  <button
                    key={color}
                    onClick={() => handleApplyHighlight(color)}
                    title={`Subrayar en ${label}`}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-115 active:scale-95 cursor-pointer ${
                      isDark ? `${darkBg} border-white/40 shadow-xs` : `${lightBg} border-slate-300 shadow-xs`
                    }`}
                  />
                ))}
                <button
                  onClick={handleRemoveHighlight}
                  className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors ml-1 cursor-pointer"
                  title="Quitar subrayado de la selección"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
