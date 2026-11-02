import React from 'react';
import { BibleVerse, HighlightColor } from '../../types/bible';
import { useBibleStore } from '../../store/useBibleStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useLexiconStore } from '../../store/useLexiconStore';
// import { useFreeBookStore } from '../../store/useFreeBookStore';
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
  // const { addVerseBlock } = useFreeBookStore();
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

  /* const handleSendToFreeBook = () => {
    addVerseBlock(activeStudyId, verse);
    onClose();
  }; */

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
    <div
      className={`rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 w-72 shadow-2xl transition-colors ${
        isDark
          ? 'bg-slate-900/98 border border-slate-700 text-white'
          : 'bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800'
      }`}
    >
      {/* Encabezado del menú */}
      <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-slate-500'}`}>
          <Bookmark className="w-3.5 h-3.5 text-[#ff3344]" />
          Versículo {verse.chapter}:{verse.verse} ({verse.version})
        </span>
        <button
          onClick={onClose}
          className={`p-0.5 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          title="Cerrar menú"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Paleta de Subrayadores (Flúor Neón en modo oscuro) */}
      <div className="mb-3">
        <div className="text-[11px] font-medium mb-1.5 flex items-center justify-between">
          <span className={isDark ? 'text-slate-300 font-semibold' : 'text-slate-400'}>
            {isDark ? '⚡ Resaltar en Flúor Neón' : 'Subrayar en texto'}
          </span>
          {currentHighlight && (
            <button
              onClick={handleRemoveHighlight}
              className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 font-normal"
            >
              <Trash2 className="w-3 h-3" /> Quitar
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {palette.map(({ color, bg, label }) => (
            <button
              key={color}
              onClick={() => handleHighlight(color)}
              title={label}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${bg} ${
                currentHighlight?.color === color ? (isDark ? 'ring-2 ring-white ring-offset-1' : 'ring-2 ring-slate-800 ring-offset-1') : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Acciones principales */}
      <div className="flex flex-col gap-1 text-xs">
        <button
          onClick={handleInsertInStudy}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left font-medium ${
            isDark ? 'text-slate-200 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Insertar en cuaderno estructurado</span>
        </button>

        {/* Cuaderno Libre ocultado de momento a favor de Sketchbook */}
        {/* <button
          onClick={handleSendToFreeBook}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left font-medium ${
            isDark ? 'text-red-300 hover:text-white hover:bg-red-950/40' : 'text-red-700 hover:text-red-950 hover:bg-red-50/80'
          }`}
        >
          <PenTool className="w-4 h-4 text-[#ff3344]" />
          <span>Enviar a Cuaderno Libre (Anotar ✍️)</span>
        </button> */}

        <button
          onClick={handleSendToSketchbook}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left font-medium ${
            isDark ? 'text-[#C4BC7B] hover:text-white hover:bg-slate-800' : 'text-[#88804B] hover:text-[#5f5933] hover:bg-[#eef5f6]'
          }`}
        >
          <BookMarked className="w-4 h-4 text-[#C4BC7B]" />
          <span>Enviar a Sketchbook (Cornell 📓)</span>
        </button>

        <button
          onClick={handleSendToCanvas}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left font-medium ${
            isDark ? 'text-blue-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
          }`}
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          <span>Enviar tarjeta a la pizarra</span>
        </button>

        <button
          onClick={handleOpenLexicon}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left font-medium ${
            isDark ? 'text-purple-300 hover:text-white hover:bg-purple-950/40' : 'text-purple-700 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Estudio Léxico (Griego / Hebreo)</span>
        </button>
      </div>
    </div>
  );
};
