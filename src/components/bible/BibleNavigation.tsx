import React, { useState, useRef, useEffect } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleVersion } from '../../types/bible';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Columns,
  Book,
  BookOpen,
  Camera,
  Check,
  X
} from 'lucide-react';
import { BibleSelectorModal } from './BibleSelectorModal';
import { StudyCameraModal } from '../study/StudyCameraModal';

const VERSIONS: { id: BibleVersion; label: string; name: string; desc: string }[] = [
  { id: 'RVR1960', label: 'RVR 1960', name: 'Reina-Valera 1960', desc: 'Traducción clásica y reverente' },
  { id: 'RVR1909', label: 'RVR+ (Strong)', name: 'Reina-Valera 1909 con Strong', desc: 'Con códigos hebreo/griego' },
  { id: 'LBLA', label: 'LBLA (Strong)', name: 'La Biblia de las Américas', desc: 'Alta fidelidad a los originales' },
  { id: 'NVI', label: 'NVI', name: 'Nueva Versión Internacional', desc: 'Lenguaje contemporáneo natural' },
  { id: 'DHH', label: 'DHH', name: 'Dios Habla Hoy', desc: 'Lenguaje sencillo y pastoral' },
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
    setParallelVersion,
    customBooks,
    activeCustomBookId,
    activeCustomChapterNum,
    setCustomChapter
  } = useBibleStore();

  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);

  const versionDropdownRef = useRef<HTMLDivElement>(null);
  const compareDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar menús desplegables al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        versionDropdownRef.current &&
        !versionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVersionDropdownOpen(false);
      }
      if (
        compareDropdownRef.current &&
        !compareDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompareDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeCustomBook = customBooks.find((b) => b.id === activeCustomBookId);
  const isStudyingCustomBook = Boolean(activeCustomBook);

  const currentBook = books.find((b) => b.id === currentBookId) || books[0];
  const activeVersionObj = VERSIONS.find((v) => v.id === currentVersion) || VERSIONS[0];
  const activeParallelVersionObj = VERSIONS.find((v) => v.id === parallelVersion) || VERSIONS[3];

  // Navegación entre capítulos (soporta libros canónicos y libros propios del usuario)
  const handlePrevChapter = () => {
    if (isStudyingCustomBook && activeCustomBook) {
      if (activeCustomChapterNum > 1) {
        setCustomChapter(activeCustomChapterNum - 1);
      }
      return;
    }

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
    if (isStudyingCustomBook && activeCustomBook) {
      if (activeCustomChapterNum < (activeCustomBook.chapters.length || 1)) {
        setCustomChapter(activeCustomChapterNum + 1);
      }
      return;
    }

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
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Capítulo anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsBookPickerOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium transition-all shadow-xs text-sm border group cursor-pointer ${
              isStudyingCustomBook
                ? isDark
                  ? 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-800 text-purple-200 hover:border-purple-500'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950 hover:border-purple-400'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-white hover:border-[#ff3344]/50'
                : 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/70 text-amber-950 hover:border-amber-400'
            }`}
            title={
              isStudyingCustomBook
                ? `Libro propio: ${activeCustomBook?.title} (Toca para cambiar de libro)`
                : 'Abrir selector de Libro, Capítulo y Versículo'
            }
          >
            {isStudyingCustomBook ? (
              <BookOpen
                className={`w-4 h-4 shrink-0 ${
                  isDark ? 'text-purple-400' : 'text-purple-700'
                }`}
              />
            ) : (
              <Book
                className={`w-4 h-4 shrink-0 ${
                  isDark ? 'text-[#ff3344]' : 'text-amber-700'
                }`}
              />
            )}
            <span className="font-semibold max-w-[140px] sm:max-w-[240px] truncate">
              {isStudyingCustomBook
                ? activeCustomBook?.title || 'Mi Libro'
                : currentBook?.name || 'Génesis'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                isStudyingCustomBook
                  ? isDark
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-700 text-white'
                  : isDark
                  ? 'bg-[#ff3344] text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isStudyingCustomBook ? `Cap. ${activeCustomChapterNum}` : currentChapterNum}
              {!isStudyingCustomBook && targetVerseNum ? `:${targetVerseNum}` : ''}
            </span>
          </button>

          <button
            onClick={handleNextChapter}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Capítulo siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* BOTÓN DE LA CÁMARA: Aparece ÚNICAMENTE si se está viendo un libro propio que se está estudiando */}
          {isStudyingCustomBook && activeCustomBook && (
            <button
              onClick={() => setIsCameraModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs border shadow-sm transition-all animate-in fade-in duration-200 cursor-pointer ${
                isDark
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 hover:bg-amber-900 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs'
              }`}
              title={`Tomar o subir foto para sumar el Capítulo ${(activeCustomBook.chapters.length || 0) + 1} a este libro`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="hidden sm:inline">+ Sumar Cap. {(activeCustomBook.chapters.length || 0) + 1} con Foto</span>
              <span className="sm:hidden">+ Cap. {(activeCustomBook.chapters.length || 0) + 1}</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PARTE SUPERIOR: MENÚ DESPLEGABLE DE BIBLIAS Y MENÚ DESPLEGABLE DE COMPARAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 text-xs relative">
          
          {/* 1. MENÚ DESPLEGABLE DE BIBLIAS */}
          <div className="relative" ref={versionDropdownRef}>
            <button
              onClick={() => {
                setIsVersionDropdownOpen(!isVersionDropdownOpen);
                setIsCompareDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all shadow-xs cursor-pointer ${
                isVersionDropdownOpen
                  ? isDark
                    ? 'bg-slate-700 border-amber-500 text-white ring-2 ring-amber-500/30'
                    : 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
              }`}
              title="Cambiar versión bíblica (Menú desplegable)"
            >
              <Book className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{activeVersionObj.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${
                  isVersionDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Panel Desplegable de Versiones Bíblicas */}
            {isVersionDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-64 rounded-2xl p-2 z-50 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-slate-800/98 border-2 border-slate-600 shadow-[0_16px_40px_rgba(0,0,0,0.9)] text-white'
                    : 'bg-white/98 border border-slate-200 shadow-xl text-slate-900'
                }`}
              >
                <div className={`px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'text-slate-400 border-slate-700' : 'text-slate-400 border-slate-100'
                }`}>
                  Traducciones Bíblicas
                </div>

                <div className="space-y-1">
                  {VERSIONS.map((v) => {
                    const isSelected = currentVersion === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setVersion(v.id);
                          setIsVersionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-800/70'
                              : 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                            : isDark
                            ? 'hover:bg-slate-700/70 text-slate-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{v.label}</span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {v.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. MENÚ DESPLEGABLE DESDE EL BOTÓN COMPARAR / ACOMPAÑAR */}
          <div className="relative" ref={compareDropdownRef}>
            <button
              onClick={() => {
                setIsCompareDropdownOpen(!isCompareDropdownOpen);
                setIsVersionDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold border transition-all shadow-xs cursor-pointer ${
                isParallelMode
                  ? isDark
                    ? 'bg-blue-950/80 text-blue-300 border-blue-700 shadow-sm ring-1 ring-blue-500/40'
                    : 'bg-blue-50 text-blue-800 border-blue-300 shadow-sm ring-1 ring-blue-400/40'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
              title={
                isStudyingCustomBook
                  ? 'Acompañar el estudio de este libro con la Biblia en paralelo'
                  : 'Comparar versiones bíblicas en paralelo'
              }
            >
              {isStudyingCustomBook ? (
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : (
                <Columns className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
              
              <span>
                {isStudyingCustomBook
                  ? isParallelMode
                    ? `Acompañar: ${activeParallelVersionObj.label}`
                    : 'Acompañar con Biblia'
                  : isParallelMode
                  ? `Comparar: ${activeParallelVersionObj.label}`
                  : 'Comparar'}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${
                  isCompareDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Panel Desplegable Anclado al Botón Comparar */}
            {isCompareDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-72 rounded-2xl p-2.5 z-50 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-slate-800/98 border-2 border-slate-600 shadow-[0_16px_40px_rgba(0,0,0,0.9)] text-white'
                    : 'bg-white/98 border border-slate-200 shadow-xl text-slate-900'
                }`}
              >
                <div
                  className={`px-2.5 py-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${
                    isDark ? 'text-slate-300 border-slate-700' : 'text-slate-600 border-slate-100'
                  }`}
                >
                  <span>
                    {isStudyingCustomBook
                      ? '📖 Acompañamiento Bíblico'
                      : '⚖️ Comparar en Paralelo'}
                  </span>
                  {isParallelMode && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Activo
                    </span>
                  )}
                </div>

                {/* Opción para desactivar modo paralelo si está encendido */}
                {isParallelMode && (
                  <button
                    onClick={() => {
                      toggleParallelMode();
                      setIsCompareDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 mb-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-colors ${
                      isDark
                        ? 'border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300'
                        : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800'
                    }`}
                  >
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isStudyingCustomBook
                        ? 'Ocultar acompañamiento bíblico'
                        : 'Desactivar comparación (Vista simple)'}
                    </span>
                  </button>
                )}

                <div className={`px-2.5 py-1 text-[10px] font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {isStudyingCustomBook
                    ? 'Seleccionar versión bíblica para acompañar:'
                    : 'Seleccionar versión secundaria para comparar:'}
                </div>

                <div className="space-y-1">
                  {VERSIONS.map((v) => {
                    const isSelected = isParallelMode && parallelVersion === v.id;
                    return (
                      <button
                        key={`compare-ver-${v.id}`}
                        onClick={() => {
                          setParallelVersion(v.id);
                          if (!isParallelMode) {
                            toggleParallelMode();
                          }
                          setIsCompareDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-blue-950/80 text-blue-300 font-bold border border-blue-800/70'
                              : 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : isDark
                            ? 'hover:bg-slate-700/70 text-slate-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{v.label}</span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {v.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Portaleado del selector de Libros, Capítulos y Libros Propios */}
      <BibleSelectorModal
        isOpen={isBookPickerOpen}
        onClose={() => setIsBookPickerOpen(false)}
      />

      {/* Modal de la Cámara para sumar capítulos al libro de estudio */}
      <StudyCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        targetCustomBookId={activeCustomBook?.id}
        mode="add-chapter"
      />
    </>
  );
};
