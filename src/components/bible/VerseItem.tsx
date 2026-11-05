import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BibleVerse, HighlightColor } from '../../types/bible';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLexiconStore } from '../../store/useLexiconStore';
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
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; word: string }>({ time: 0, word: '' });

  const { highlights, currentBookId, currentChapterNum, currentVersion, targetVerseNum, books } = useBibleStore();
  const { currentTheme } = useThemeStore();
  const { openLexicon } = useLexiconStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const isTarget =
    targetVerseNum === verse.verse &&
    currentBookId === verse.bookId &&
    currentChapterNum === verse.chapter;

  const highlight = highlights.find(
    (h) => h.bookId === verse.bookId && h.chapter === verse.chapter && h.verse === verse.verse
  );

  const colorPalette = isDark ? DARK_FLUOR_COLOR_MAP : LIGHT_COLOR_MAP;
  const highlightClass = isTarget
    ? isDark
      ? 'ring-2 ring-[#ff3344] ring-offset-2 ring-offset-slate-950 bg-[#ff3344]/30 animate-pulse'
      : 'ring-2 ring-amber-500 ring-offset-2 ring-offset-amber-50 bg-amber-200/80 animate-pulse'
    : highlight
    ? colorPalette[highlight.color]
    : isDark
    ? 'hover:bg-slate-800/80'
    : 'hover:bg-amber-50/70';

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

  // Limpiar temporizador pendiente al desmontar
  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
  }, []);

  const triggerLexicon = (rawWord: string) => {
    const clean = rawWord.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '').trim();
    if (!clean) return;

    const book = books.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
    const bookName = book ? book.name : verse.bookId;
    const verseRef = `${bookName} ${verse.chapter}:${verse.verse}`;

    // Disparar apertura del léxico
    openLexicon(verseRef, clean);
  };

  // Manejar interacción en palabra: toque simple abre menú de versículo, doble toque abre léxico
  const handleWordClick = (e: React.MouseEvent, tokenWord: string) => {
    e.stopPropagation();

    // Si el usuario está seleccionando texto para copiar/enviar a estudio, no interferir
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 1) {
      return;
    }

    const cleanWord = tokenWord.replace(/^[«“"'\s.,;:!?¿¡()[\]{}—\-]+|[»”"'\s.,;:!?¿¡()[\]{}—\-]+$/g, '').trim();
    if (!cleanWord) return;

    const now = Date.now();
    const timeSinceLast = now - lastTapRef.current.time;
    const isSameWord = lastTapRef.current.word === cleanWord;

    // DETECCIÓN DE DOBLE TOQUE (DOBLE TAP): Ocurre dentro de 380ms en la misma palabra
    if (isSameWord && timeSinceLast > 0 && timeSinceLast < 380) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = { time: 0, word: '' };

      // Limpiar selección nativa que pueda haber provocado el doble toque en el navegador
      window.getSelection()?.removeAllRanges();

      // Abrir Léxico directamente con la palabra seleccionada
      triggerLexicon(cleanWord);
      return;
    }

    // PRIMER TOQUE: Registrar tiempo y esperar 260ms antes de abrir el menú de versículo
    lastTapRef.current = { time: now, word: cleanWord };

    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
    }

    singleTapTimerRef.current = setTimeout(() => {
      const currentSel = window.getSelection();
      if (currentSel && currentSel.toString().trim().length > 1) {
        return;
      }
      setShowMenu((prev) => !prev);
      singleTapTimerRef.current = null;
    }, 260);
  };

  // Doble clic nativo en desktop
  const handleWordDoubleClick = (e: React.MouseEvent, tokenWord: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
    }
    lastTapRef.current = { time: 0, word: '' };
    window.getSelection()?.removeAllRanges();
    triggerLexicon(tokenWord);
  };

  // Tokenizar el texto del versículo preservando espacios para separar palabras
  const tokens = useMemo(() => {
    return verse.text.split(/(\s+)/);
  }, [verse.text]);

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
      className="relative inline-block leading-relaxed mr-1.5 my-0.5 group scroll-mt-28"
    >
      <span
        className={`cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 inline ${highlightClass}`}
        title={`Doble toque en cualquier palabra para Léxico | Toque en el número para opciones de ${verse.chapter}:${verse.verse}`}
      >
        {/* Número de versículo: Clic directo abre/cierra las opciones del versículo */}
        <sup
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          className={`font-sans text-[11px] mr-1 select-none transition-all cursor-pointer hover:scale-110 active:scale-95 inline-block ${
            isDark
              ? 'bible-verse-num text-[#ff3344] font-black drop-shadow-[0_0_6px_rgba(255,51,68,0.75)]'
              : 'font-bold text-amber-700/80 hover:text-amber-900'
          }`}
          title={`Opciones del versículo ${verse.verse}`}
        >
          {verse.verse}
        </sup>

        {/* Texto de las Escrituras: Palabras interactivas con soporte de Doble Tap para Léxico */}
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
                className="inline transition-colors active:opacity-70 select-text"
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
