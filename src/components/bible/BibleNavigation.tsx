import React, { useState } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleVersion } from '../../types/bible';
import { ChevronLeft, ChevronRight, Columns, Book } from 'lucide-react';
import { BibleSelectorModal } from './BibleSelectorModal';

const VERSIONS: { id: BibleVersion; label: string; name: string }[] = [
  { id: 'RVR1960', label: 'RVR 1960', name: 'Reina-Valera 1960' },
  { id: 'NVI', label: 'NVI', name: 'Nueva Versión Internacional' },
  { id: 'DHH', label: 'DHH', name: 'Dios Habla Hoy' },
  { id: 'LBLA', label: 'LBLA', name: 'La Biblia de las Américas' },
];

export const BibleNavigation: React.FC = () => {
  const {
    books,
    currentBookId,
    currentChapterNum,
    targetVerseNum,
    currentVersion,
    isParallelMode,
    parallelVersion,
    setBookAndChapter,
    setVersion,
    toggleParallelMode,
    setParallelVersion
  } = useBibleStore();

  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);

  const currentBook = books.find((b) => b.id === currentBookId) || books[0];

  const handlePrevChapter = () => {
    if (currentChapterNum > 1) {
      setBookAndChapter(currentBookId, currentChapterNum - 1);
    } else {
      const currentIndex = books.findIndex((b) => b.id === currentBookId);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setBookAndChapter(prevBook.id, prevBook.chaptersCount);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentBook && currentChapterNum < currentBook.chaptersCount) {
      setBookAndChapter(currentBookId, currentChapterNum + 1);
    } else {
      const currentIndex = books.findIndex((b) => b.id === currentBookId);
      if (currentIndex < books.length - 1) {
        const nextBook = books[currentIndex + 1];
        setBookAndChapter(nextBook.id, 1);
      }
    }
  };

  return (
    <>
      <div
        className={`border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white/80 backdrop-blur-sm border-slate-200/90 text-slate-800'
        }`}
      >
        {/* Selector de Libro, Capítulo y Versículo */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevChapter}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Capítulo anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsBookPickerOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm border group cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-white hover:border-[#ff3344]/50'
                : 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/70 text-amber-950 hover:border-amber-400'
            }`}
            title="Abrir selector de Libro, Capítulo y Versículo"
          >
            <Book className={`w-4 h-4 ${isDark ? 'text-[#ff3344]' : 'text-amber-700'}`} />
            <span className="font-semibold">{currentBook?.name || 'Génesis'}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isDark ? 'bg-[#ff3344] text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {currentChapterNum}
              {targetVerseNum ? `:${targetVerseNum}` : ''}
            </span>
          </button>

          <button
            onClick={handleNextChapter}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Capítulo siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selectores de Versión y Modo Comparación */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto max-w-full py-0.5">
          {/* Selector de Versión Primaria */}
          <div className={`flex items-center p-0.5 rounded-xl border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            {VERSIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVersion(v.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentVersion === v.id
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-sm font-bold'
                      : 'bg-white text-slate-900 shadow-sm font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title={v.name}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Botón Toggle de Comparación en Paralelo */}
          <button
            onClick={toggleParallelMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border transition-colors ${
              isParallelMode
                ? isDark
                  ? 'bg-blue-950/80 text-blue-300 border-blue-800 shadow-sm'
                  : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ver dos versiones en paralelo"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Comparar</span>
          </button>

          {/* Selector de Segunda Versión (visible solo en modo paralelo) */}
          {isParallelMode && (
            <select
              value={parallelVersion}
              onChange={(e) => setParallelVersion(e.target.value as BibleVersion)}
              aria-label="Seleccionar versión secundaria para comparar"
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}
            >
              {VERSIONS.map((v) => (
                <option key={v.id} value={v.id} className={isDark ? 'bg-slate-900 text-white' : ''}>
                  {v.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Modal Portaleado directamente al document.body para evitar cualquier containing-block de CSS */}
      <BibleSelectorModal
        isOpen={isBookPickerOpen}
        onClose={() => setIsBookPickerOpen(false)}
      />
    </>
  );
};