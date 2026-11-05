import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { BibleVerse } from '../../types/bible';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Sparkles, FileText, BookMarked, Copy, Check, X } from 'lucide-react';

export interface SelectionTargetRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

interface PhraseSelectionMenuProps {
  phrase: string;
  verse: BibleVerse;
  targetRect: SelectionTargetRect;
  onClose: () => void;
}

export const PhraseSelectionMenu: React.FC<PhraseSelectionMenuProps> = ({
  phrase,
  verse,
  targetRect,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { openLexicon } = useLexiconStore();
  const { addPhraseToActiveStudy } = useStudyStore();
  const { addPhraseToSketchbook } = useSketchbookStore();
  const { books } = useBibleStore();
  const { currentTheme } = useThemeStore();

  const [copied, setCopied] = useState(false);
  const [addedToStudy, setAddedToStudy] = useState(false);
  const [addedToSketchbook, setAddedToSketchbook] = useState(false);

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  // Coordenadas calculadas dinámicamente con auto-clamping para que NUNCA desborde los bordes
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: Math.max(65, targetRect.top - 54),
    left: Math.max(12, targetRect.left)
  });

  useLayoutEffect(() => {
    if (!menuRef.current) return;
    const menuWidth = menuRef.current.offsetWidth || 420;
    const menuHeight = menuRef.current.offsetHeight || 44;
    const padding = 14;

    // Centro horizontal del texto seleccionado
    const selectionCenter = targetRect.left + targetRect.width / 2;

    // Calcular la posición izquierda centrada con respecto a la selección
    let left = selectionCenter - menuWidth / 2;

    // Garantizar que la barra NUNCA se corte por el borde izquierdo ni por el derecho
    left = Math.max(padding, Math.min(window.innerWidth - menuWidth - padding, left));

    // Posición vertical: preferir ubicarla encima del texto seleccionado
    let top = targetRect.top - menuHeight - 8;

    // Si arriba queda oculta por la barra superior de la aplicación (< 65px), ubicarla debajo
    if (top < 65) {
      top = targetRect.bottom + 8;
    }

    // Si abajo se desborda por el final de la ventana, ajustarla al límite inferior
    if (top + menuHeight > window.innerHeight - padding) {
      top = window.innerHeight - menuHeight - padding;
    }

    setCoords({ top, left });
  }, [targetRect]);

  const book = books.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
  const bookName = book ? book.name : verse.bookId;
  const verseRef = `${bookName} ${verse.chapter}:${verse.verse}`;

  const handleLexicon = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openLexicon(verseRef, phrase.trim());
    onClose();
  };

  const handleSendToStudy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addPhraseToActiveStudy(phrase.trim(), verse);
    setAddedToStudy(true);
    setTimeout(() => {
      setAddedToStudy(false);
      onClose();
    }, 1200);
  };

  const handleSendToSketchbook = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addPhraseToSketchbook(useStudyStore.getState().activeStudyId, phrase.trim(), verse);
    setAddedToSketchbook(true);
    setTimeout(() => {
      setAddedToSketchbook(false);
      onClose();
    }, 1200);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const citation = `«${phrase.trim()}» (${verseRef} ${verse.version})`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const cleanPhrase = phrase.trim();
  const displayPhrase = cleanPhrase.length > 20 ? `${cleanPhrase.slice(0, 18)}…` : cleanPhrase;

  const content = (
    <div
      ref={menuRef}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`
      }}
      className={`fixed z-[9999] flex items-center gap-1.5 p-2 rounded-2xl border-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none max-w-[calc(100vw-28px)] overflow-x-auto ${
        isDark
          ? 'bg-slate-800/98 border-slate-600 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/20 text-white'
          : 'bg-white/98 border-slate-300 text-slate-800 shadow-2xl ring-1 ring-black/5'
      }`}
      onMouseDown={(e) => {
        // Evita que el clic en el menú deseleccione el texto antes de ejecutar la acción
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        // Evita que el toque en el menú en móviles deseleccione el texto
        e.stopPropagation();
      }}
    >
      {/* Etiqueta de la selección */}
      <div
        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border max-w-[130px] sm:max-w-[170px] truncate ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-xs'
            : 'bg-slate-100 border-slate-200 text-slate-800 shadow-xs'
        }`}
        title={`Selección: "${cleanPhrase}" (${verseRef})`}
      >
        <span className="truncate italic">«{displayPhrase}»</span>
        <span
          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
            isDark
              ? 'bg-[#ff3344] text-white shadow-[0_0_8px_rgba(255,51,68,0.7)]'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {verse.chapter}:{verse.verse}
        </span>
      </div>

      <div className={`h-4 w-px mx-0.5 shrink-0 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />

      {/* Botón: Análisis Léxico Griego / Hebreo */}
      <button
        onClick={handleLexicon}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shrink-0 ${
          isDark
            ? 'bg-purple-900/90 border-purple-500/80 text-purple-100 hover:bg-purple-800 hover:text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]'
            : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-2xs'
        }`}
        title={`Analizar "${cleanPhrase}" en lengua original (Griego/Hebreo) con Strong`}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
        <span>Léxico</span>
      </button>

      {/* Botón: Enviar al Cuaderno de Estudio */}
      <button
        onClick={handleSendToStudy}
        disabled={addedToStudy}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shrink-0 ${
          addedToStudy
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : isDark
            ? 'bg-emerald-900/90 border-emerald-500/80 text-emerald-100 hover:bg-emerald-800 hover:text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs'
        }`}
        title="Insertar cita textual de la frase en el Cuaderno de Estudio activo"
      >
        {addedToStudy ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>¡Guardado!</span>
          </>
        ) : (
          <>
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">A Estudio</span>
          </>
        )}
      </button>

      {/* Botón: Enviar a Sketchbook */}
      <button
        onClick={handleSendToSketchbook}
        disabled={addedToSketchbook}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shrink-0 ${
          addedToSketchbook
            ? 'bg-amber-600 border-amber-500 text-white'
            : isDark
            ? 'bg-amber-900/90 border-amber-500/80 text-amber-100 hover:bg-amber-800 hover:text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]'
            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300 shadow-2xs'
        }`}
        title="Insertar frase en la hoja del Sketchbook / Cornell"
      >
        {addedToSketchbook ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>¡Guardado!</span>
          </>
        ) : (
          <>
            <BookMarked className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Sketchbook</span>
          </>
        )}
      </button>

      {/* Botón: Copiar frase con cita */}
      <button
        onClick={handleCopy}
        className={`p-1.5 rounded-xl transition-colors border shrink-0 ${
          isDark
            ? 'border-slate-600 bg-slate-700/80 hover:bg-slate-600 text-white'
            : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
        }`}
        title="Copiar frase con referencia bíblica"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-slate-300" />
        )}
      </button>

      {/* Botón: Cerrar menú flotante */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        className={`p-1.5 rounded-xl transition-colors border shrink-0 ${
          isDark ? 'border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700' : 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title="Cerrar barra de selección"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return createPortal(content, document.body);
};
