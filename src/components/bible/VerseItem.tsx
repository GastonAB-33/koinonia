import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BibleVerse, HighlightColor } from '../../types/bible';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useStudyStore } from '../../store/useStudyStore';
import { VerseActionMenu } from './VerseActionMenu';

interface VerseItemProps {
  verse: BibleVerse;
}

const LIGHT_COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'bg-[#fef08a]/80 text-slate-900',
  green: 'bg-[#bbf7d0]/80 text-slate-900',
  blue: 'bg-[#bae6fd]/80 text-slate-900',
  pink: 'bg-[#fbcfe8]/80 text-slate-900',
  purple: 'bg-[#e9d5ff]/80 text-slate-900',
  orange: 'bg-[#fed7aa]/80 text-slate-900'
};

const DARK_FLUOR_COLOR_MAP: Record<HighlightColor, string> = {
  yellow: 'bg-[#ffff00] !text-black font-semibold shadow-[0_0_14px_rgba(255,255,0,0.7)] px-1 rounded',
  green: 'bg-[#00ff66] !text-black font-semibold shadow-[0_0_14px_rgba(0,255,102,0.7)] px-1 rounded',
  blue: 'bg-[#00f0ff] !text-black font-semibold shadow-[0_0_14px_rgba(0,240,255,0.7)] px-1 rounded',
  pink: 'bg-[#ff007f] !text-white font-semibold shadow-[0_0_14px_rgba(255,0,127,0.7)] px-1 rounded',
  purple: 'bg-[#bf5af2] !text-white font-semibold shadow-[0_0_14px_rgba(191,90,242,0.7)] px-1 rounded',
  orange: 'bg-[#ff6600] !text-black font-semibold shadow-[0_0_14px_rgba(255,102,0,0.7)] px-1 rounded'
};

export const VerseItem: React.FC<VerseItemProps> = ({ verse }) => {
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const lastTapRef = useRef<{ time: number; word: string }>({ time: 0, word: '' });
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Escudo contra falsos toques durante el scroll
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isScrollingRef = useRef(false);

  const { highlights, currentBookId, currentChapterNum, currentVersion, targetVerseNum, books, customBooks } = useBibleStore();
  const { currentTheme } = useThemeStore();
  const { openLexicon } = useLexiconStore();
  const { studies, activeStudyId } = useStudyStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const isTarget =
    targetVerseNum === verse.verse &&
    currentBookId === verse.bookId &&
    currentChapterNum === verse.chapter;

  const highlight = highlights.find(
    (h) => h.bookId === verse.bookId && h.chapter === verse.chapter && h.verse === verse.verse
  );

  const activeStudy = useMemo(() => studies.find((s) => s.id === activeStudyId), [studies, activeStudyId]);

  // Determinar si este versículo está extraído en el cuaderno de estudio activo
  const isExtractedInStudy = useMemo(() => {
    if (!activeStudy || !activeStudy.blocks) return false;
    return activeStudy.blocks.some((b) => {
      if (b.type === 'verse_quote' && b.verseRef) {
        return (
          b.verseRef.bookId.toUpperCase() === verse.bookId.toUpperCase() &&
          Number(b.verseRef.chapter) === Number(verse.chapter) &&
          Number(b.verseRef.verse) === Number(verse.verse)
        );
      }
      return false;
    });
  }, [activeStudy, verse.bookId, verse.chapter, verse.verse]);

  const colorPalette = isDark ? DARK_FLUOR_COLOR_MAP : LIGHT_COLOR_MAP;

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const triggerLexicon = (rawWord: string) => {
    const clean = rawWord.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '').trim();
    if (!clean) return;

    const customBook = customBooks?.find((cb) => cb.id === verse.bookId);
    const book = books.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
    const bookName = customBook ? customBook.title : (book ? book.name : verse.bookId);
    const verseRef = customBook
      ? `${bookName} Cap. ${verse.chapter} (§ ${verse.verse})`
      : `${bookName} ${verse.chapter}:${verse.verse}`;

    let target = clean;
    if (verse.strongTokens && verse.strongTokens.length > 0) {
      const match = verse.strongTokens.find(
        (t) =>
          t.word.toLowerCase() === clean.toLowerCase() ||
          clean.toLowerCase().includes(t.word.toLowerCase()) ||
          t.word.toLowerCase().includes(clean.toLowerCase())
      );
      if (match) {
        const prefix = verse.originalLanguage === 'greek' ? 'G' : 'H';
        target = `${prefix}${match.strong}`;
      }
    }

    openLexicon(verseRef, target);
  };

  // =========================================================================
  // GESTIÓN DE TOQUE EN EL VERSÍCULO:
  // - UN TOQUE SIMPLE abre las herramientas del versículo (resaltar, estudio, etc.)
  // - UN DOBLE TOQUE en una palabra abre el Léxico griego/hebreo
  // - EL SCROLL queda 100% protegido (nunca abre menú por deslizar)
  // - EL MENÚ NATIVO DE GOOGLE/ANDROID queda completamente bloqueado
  // =========================================================================

  const handleWordClick = (e: React.MouseEvent, tokenWord: string) => {
    e.stopPropagation();

    // Si el usuario estaba deslizando (scroll), ignorar
    if (isScrollingRef.current) {
      return;
    }

    const cleanWord = tokenWord.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '').trim();
    if (!cleanWord) return;

    const now = Date.now();
    const timeSinceLast = now - lastTapRef.current.time;
    const isSameWord = lastTapRef.current.word === cleanWord;

    // DETECCIÓN DE DOBLE TOQUE: Doble tap en <320ms abre el Léxico
    if (isSameWord && timeSinceLast > 0 && timeSinceLast < 320) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      lastTapRef.current = { time: 0, word: '' };
      window.getSelection()?.removeAllRanges();
      triggerLexicon(cleanWord);
      return;
    }

    // PRIMER TOQUE (UN TOQUE EN EL VERSÍCULO):
    lastTapRef.current = { time: now, word: cleanWord };

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      // Si no hubo segundo toque para léxico, es un toque en el versículo -> abrir/cerrar opciones
      setShowMenu((prev) => !prev);
      clickTimerRef.current = null;
    }, 260);
  };

  // Doble clic nativo en desktop para Léxico
  const handleWordDoubleClick = (e: React.MouseEvent, tokenWord: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    lastTapRef.current = { time: 0, word: '' };
    window.getSelection()?.removeAllRanges();
    triggerLexicon(tokenWord);
  };

  // Toque directo en el número de versículo o fondo del versículo
  const handleVerseDirectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isScrollingRef.current) return;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    setShowMenu((prev) => !prev);
  };

  // Escudo de scroll táctil: si se mueve > 7px es scroll, no tap
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const dist = Math.hypot(
      e.touches[0].clientX - touchStartPosRef.current.x,
      e.touches[0].clientY - touchStartPosRef.current.y
    );
    if (dist > 7) {
      isScrollingRef.current = true;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (isScrollingRef.current) {
      // Si fue scroll, resetear bandera y abortar cualquier acción
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
    touchStartPosRef.current = null;
  };

  // Tokenizar el texto del versículo preservando espacios para separar palabras
  const tokens = useMemo(() => {
    return verse.text.split(/(\s+)/);
  }, [verse.text]);

  // =========================================================================
  // RENDERIZADO PARA VERSÍCULOS BÍBLICOS CANÓNICOS (INLINE CON DISTINTIVO)
  // =========================================================================
  let highlightClass = isTarget
    ? isDark
      ? 'ring-2 ring-[#ff3344] ring-offset-2 ring-offset-slate-950 bg-[#ff3344]/30 animate-pulse'
      : 'ring-2 ring-amber-500 ring-offset-2 ring-offset-amber-50 bg-amber-200/80 animate-pulse'
    : highlight
    ? colorPalette[highlight.color]
    : isExtractedInStudy
    ? isDark
      ? 'bg-emerald-950/70 border-b-2 border-emerald-400 text-emerald-200 shadow-xs'
      : 'bg-emerald-100/90 text-emerald-950 border-b-2 border-emerald-600 shadow-xs'
    : isDark
    ? 'hover:bg-slate-800/80'
    : 'hover:bg-amber-50/70';

  if (highlight && isExtractedInStudy) {
    highlightClass += isDark
      ? ' ring-2 ring-emerald-400 border-b-2 border-emerald-400'
      : ' ring-2 ring-emerald-500 border-b-2 border-emerald-600';
  }

  return (
    <span
      ref={containerRef}
      id={
        verse.version === currentVersion
          ? `verse-${verse.bookId}-${verse.chapter}-${verse.verse}`
          : `verse-${verse.version}-${verse.bookId}-${verse.chapter}-${verse.verse}`
      }
      data-verse-ref={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
      data-verse-book={verse.bookId}
      data-verse-chapter={verse.chapter}
      data-verse-num={verse.verse}
      data-verse-version={verse.version}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        // Bloquear el menú contextual nativo de Android/Google
        e.preventDefault();
      }}
      className="relative inline-block leading-relaxed mr-1.5 my-0.5 group scroll-mt-28 select-none"
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      <span
        onClick={handleVerseDirectClick}
        className={`cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 inline ${highlightClass}`}
        title={`Toca para opciones del versículo ${verse.verse} | Doble toque en cualquier palabra para Léxico`}
      >
        {/* Número de versículo */}
        <sup
          onClick={handleVerseDirectClick}
          className={`font-sans text-[11px] mr-1 select-none transition-all cursor-pointer hover:scale-125 active:scale-95 inline-block px-0.5 ${
            isDark
              ? 'bible-verse-num text-[#ff3344] font-black drop-shadow-[0_0_6px_rgba(255,51,68,0.75)]'
              : 'font-bold text-amber-700/80 hover:text-amber-900'
          }`}
          title={`Opciones del versículo ${verse.verse}`}
        >
          {verse.verse}
        </sup>

        {/* Distintivo de versículo extraído en el estudio actual */}
        {isExtractedInStudy && (
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 mx-0.5 rounded-full select-none align-middle shadow-xs ${
              isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}
            title="Este versículo está extraído en tu cuaderno de estudio actual"
          >
            <span>📝</span>
            <span className="hidden sm:inline">En Estudio</span>
          </span>
        )}

        {/* Texto del versículo: Palabras interactivas con soporte de Doble Tap para Léxico y un toque para opciones */}
        <span
          className={`font-serif text-[18px] transition-colors ${
            isDark ? 'bible-verse-text text-white font-normal' : 'text-slate-800'
          }`}
        >
          {tokens.map((token, idx) => {
            if (/^\s+$/.test(token)) {
              return <React.Fragment key={idx}>{token}</React.Fragment>;
            }
            return (
              <span
                key={idx}
                onClick={(e) => handleWordClick(e, token)}
                onDoubleClick={(e) => handleWordDoubleClick(e, token)}
                className="inline transition-colors hover:underline/30 cursor-pointer"
              >
                {token}
              </span>
            );
          })}
        </span>
      </span>

      {showMenu && (
        <div className="absolute top-full left-0 mt-1.5 z-50">
          <VerseActionMenu verse={verse} onClose={() => setShowMenu(false)} />
        </div>
      )}
    </span>
  );
};
