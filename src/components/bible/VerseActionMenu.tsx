import React from 'react';
import { BibleVerse, HighlightColor } from '../../types/bible';
import { useBibleStore } from '../../store/useBibleStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useLexiconStore } from '../../store/useLexiconStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Bookmark, FileText, Share2, Sparkles, X, Trash2, BookMarked } from 'lucide-react';

interface VerseActionMenuProps {
  verse: BibleVerse;
  onClose: () => void;
}

const LIGHT_HIGHLIGHT_PALETTE: { color: HighlightColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: 'bg-[#fef08a] border-[#fde047]', label: 'Amarillo' },
  { color: 'green', bg: 'bg-[#bbf7d0] border-[#86efac]', label: 'Verde' },
  { color: 'blue', bg: 'bg-[#bae6fd] border-[#7dd3fc]', label: 'Celeste' },
  { color: 'pink', bg: 'bg-[#fbcfe8] border-[#f472b6]', label: 'Rosa' },
  { color: 'purple', bg: 'bg-[#e9d5ff] border-[#c084fc]', label: 'Lila' },
  { color: 'orange', bg: 'bg-[#fed7aa] border-[#fdba74]', label: 'Naranja' }
];

const DARK_FLUOR_HIGHLIGHT_PALETTE: { color: HighlightColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: 'bg-[#ffff00] border-[#fde047] shadow-[0_0_8px_rgba(255,255,0,0.8)]', label: 'Amarillo Flúor' },
  { color: 'green', bg: 'bg-[#00ff66] border-[#86efac] shadow-[0_0_8px_rgba(0,255,102,0.8)]', label: 'Verde Neón' },
  { color: 'blue', bg: 'bg-[#00f0ff] border-[#7dd3fc] shadow-[0_0_8px_rgba(0,240,255,0.8)]', label: 'Cian Neón' },
  { color: 'pink', bg: 'bg-[#ff007f] border-[#f472b6] shadow-[0_0_8px_rgba(255,0,127,0.8)]', label: 'Rosa Flúor' },
  { color: 'purple', bg: 'bg-[#bf5af2] border-[#c084fc] shadow-[0_0_8px_rgba(191,90,242,0.8)]', label: 'Morado Neón' },
  { color: 'orange', bg: 'bg-[#ff6600] border-[#fdba74] shadow-[0_0_8px_rgba(255,102,0,0.8)]', label: 'Naranja Flúor' }
];

export const VerseActionMenu: React.FC<VerseActionMenuProps> = ({ verse, onClose }) => {
  const { addHighlight, removeHighlight, highlights, books } = useBibleStore();
  const { addVerseToActiveStudy, activeStudyId } = useStudyStore();
  const { addVerseNodeToCanvas } = useCanvasStore();
  const { openLexicon } = useLexiconStore();
  const { addVerseToSketchbook } = useSketchbookStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const currentHighlight = highlights.find(
    (h) => h.bookId === verse.bookId && h.chapter === verse.chapter && h.verse === verse.verse
  );

  const palette = isDark ? DARK_FLUOR_HIGHLIGHT_PALETTE : LIGHT_HIGHLIGHT_PALETTE;

  const handleHighlight = (color: HighlightColor) => {
    addHighlight(verse, color);
    onClose();
  };

  const handleRemoveHighlight = () => {
    removeHighlight(verse.bookId, verse.chapter, verse.verse);
    onClose();
  };

  const handleInsertInStudy = () => {
    addVerseToActiveStudy(verse);
    onClose();
  };

  const handleSendToSketchbook = () => {
    addVerseToSketchbook(activeStudyId, verse);
    onClose();
  };

  const handleSendToCanvas = () => {
    addVerseNodeToCanvas(activeStudyId, verse);
    onClose();
  };

  const handleOpenLexicon = () => {
    const book = books.find((b) => b.id.toUpperCase() === verse.bookId.toUpperCase());
    const bookName = book ? book.name : verse.bookId;
    const words = verse.text.split(' ');
    const firstWord = words.find((w) => w.length > 4) || words[0] || 'principio';
    const verseRef = `${bookName} ${verse.chapter}:${verse.verse}`;
    openLexicon(verseRef, firstWord.replace(/[.,;:]/g, ''));
    onClose();
  };

  return (
    <div className="relative">
      {/* Triángulo indicador superior */}
      <div
        className={`w-3 h-3 rotate-45 absolute -top-1.5 left-5 border-t-2 border-l-2 z-10 ${
          isDark
            ? 'bg-slate-800 border-slate-600 shadow-md'
            : 'bg-white border-slate-200'
        }`}
      />

      <div
        className={`rounded-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 w-72 max-w-[calc(100vw-32px)] shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-800/98 border-2 border-slate-600 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/20 text-white'
            : 'bg-white/98 backdrop-blur-md border border-slate-200/90 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Encabezado del menú */}
        <div
          className={`flex items-center justify-between pb-2 mb-2.5 border-b ${
            isDark ? 'border-slate-700' : 'border-slate-100'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#ff3344] drop-shadow-[0_0_6px_rgba(255,51,68,0.7)]" />
            <span>Versículo {verse.chapter}:{verse.verse}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                isDark ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {verse.version}
            </span>
          </span>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Cerrar menú"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Paleta de Subrayadores (Flúor Neón en modo oscuro) */}
        <div className="mb-3">
          <div className="text-[11px] font-bold mb-1.5 flex items-center justify-between">
            <span className={isDark ? 'text-slate-200' : 'text-slate-600'}>
              {isDark ? '⚡ Resaltar en Flúor Neón:' : 'Subrayar en texto:'}
            </span>
            {currentHighlight && (
              <button
                onClick={handleRemoveHighlight}
                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3 h-3" /> Quitar
              </button>
            )}
          </div>
          <div
            className={`flex items-center justify-between gap-1 p-1.5 rounded-xl border ${
              isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            {palette.map(({ color, bg, label }) => (
              <button
                key={color}
                onClick={() => handleHighlight(color)}
                title={label}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-115 active:scale-95 ${bg} ${
                  currentHighlight?.color === color
                    ? isDark
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                      : 'ring-2 ring-slate-800 ring-offset-2 scale-110'
                    : 'opacity-90 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Acciones principales como tarjetas con alto contraste */}
        <div className="flex flex-col gap-1.5 text-xs">
          <button
            onClick={handleInsertInStudy}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left font-semibold border ${
              isDark
                ? 'bg-slate-700/60 hover:bg-emerald-950/70 border-slate-600 hover:border-emerald-500 text-slate-100 hover:text-white shadow-xs'
                : 'bg-slate-50 hover:bg-emerald-50 border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-950'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Insertar en cuaderno estructurado</span>
          </button>

          <button
            onClick={handleSendToSketchbook}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left font-semibold border ${
              isDark
                ? 'bg-slate-700/60 hover:bg-amber-950/70 border-slate-600 hover:border-amber-500 text-slate-100 hover:text-white shadow-xs'
                : 'bg-slate-50 hover:bg-amber-50 border-slate-200/80 hover:border-amber-300 text-slate-700 hover:text-amber-950'
            }`}
          >
            <BookMarked className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Enviar a Sketchbook (Cornell 📓)</span>
          </button>

          <button
            onClick={handleSendToCanvas}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left font-semibold border ${
              isDark
                ? 'bg-slate-700/60 hover:bg-blue-950/70 border-slate-600 hover:border-blue-500 text-slate-100 hover:text-white shadow-xs'
                : 'bg-slate-50 hover:bg-blue-50 border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-blue-950'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Enviar tarjeta a la pizarra</span>
          </button>

          <button
            onClick={handleOpenLexicon}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left font-semibold border ${
              isDark
                ? 'bg-slate-700/60 hover:bg-purple-950/70 border-slate-600 hover:border-purple-500 text-slate-100 hover:text-white shadow-xs'
                : 'bg-slate-50 hover:bg-purple-50 border-slate-200/80 hover:border-purple-300 text-slate-700 hover:text-purple-950'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Estudio Léxico (Griego / Hebreo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};