import React, { useState, useRef, useEffect } from 'react';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleVersion } from '../../types/bible';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Columns,
  Rows,
  Book,
  BookOpen,
  Camera,
  Check
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
    readingMode,
    setReadingMode,
    parallelVersion,
    setBookAndChapter,
    setVersion,
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
        className={`border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 transition-colors relative z-50 shadow-xs ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-800'
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
                style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', zIndex: 9999, opacity: 1 }}
                className={`absolute left-0 sm:left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-32px)] rounded-2xl p-2 z-[9999] shadow-2xl border-2 transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className={`px-2.5 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'
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
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/70'
                              : 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                            : isDark
                            ? 'bg-slate-900 border border-slate-800 hover:bg-slate-700/70 text-slate-200'
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
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

          {/* 2. BOTÓN SELECTOR DE LOS 3 MODOS DE LECTURA */}
          <div className="relative" ref={compareDropdownRef}>
            <button
              onClick={() => {
                setIsCompareDropdownOpen(!isCompareDropdownOpen);
                setIsVersionDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold border transition-all shadow-xs cursor-pointer ${
                readingMode !== 'single'
                  ? isDark
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700 shadow-sm ring-1 ring-amber-500/40'
                    : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm ring-1 ring-amber-400/40'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
              title="Escoger modo de lectura: Arriba y Abajo, Al Lado, o Sin Comparación"
            >
              {readingMode === 'split-vertical' ? (
                <Rows className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : readingMode === 'side-by-side' ? (
                <Columns className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              
              <span className="text-xs">
                {readingMode === 'split-vertical'
                  ? 'Arriba y abajo'
                  : readingMode === 'side-by-side'
                  ? 'Al lado'
                  : 'Sin comparación'}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${
                  isCompareDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Panel Desplegable de los 3 Modos de Lectura */}
            {isCompareDropdownOpen && (
              <div
                style={{ backgroundColor: isDark ? '#0f172a' : '#ffffff', zIndex: 9999, opacity: 1 }}
                className={`absolute right-0 top-full mt-1.5 w-80 max-w-[calc(100vw-24px)] rounded-2xl p-2.5 z-[9999] shadow-2xl border-2 transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div
                  className={`px-2.5 py-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${
                    isDark ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'
                  }`}
                >
                  <span>Modos de Lectura</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                    3 Opciones
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Modo 1: Arriba y Abajo */}
                  <button
                    onClick={() => {
                      setReadingMode('split-vertical');
                      setIsCompareDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      readingMode === 'split-vertical'
                        ? isDark
                          ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-xs'
                          : 'bg-amber-50 text-amber-950 border-amber-400 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Rows className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">1. Arriba y abajo</div>
                        <div className="text-[10px] opacity-75 leading-tight">
                          Pantalla dividida al medio (Lectura superior e inferior)
                        </div>
                      </div>
                    </div>
                    {readingMode === 'split-vertical' && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </button>

                  {/* Modo 2: Al lado (Agrega sección al menú inferior con icono naranja) */}
                  <button
                    onClick={() => {
                      setReadingMode('side-by-side');
                      setIsCompareDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      readingMode === 'side-by-side'
                        ? isDark
                          ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-xs'
                          : 'bg-amber-50 text-amber-950 border-amber-400 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Columns className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">2. Al lado (2 pantallas)</div>
                        <div className="text-[10px] opacity-75 leading-tight">
                          Pantallas completas separadas (Agrega 2 botones naranja abajo)
                        </div>
                      </div>
                    </div>
                    {readingMode === 'side-by-side' && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </button>

                  {/* Modo 3: Sin comparación */}
                  <button
                    onClick={() => {
                      setReadingMode('single');
                      setIsCompareDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      readingMode === 'single'
                        ? isDark
                          ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-xs'
                          : 'bg-amber-50 text-amber-950 border-amber-400 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">3. Sin comparación</div>
                        <div className="text-[10px] opacity-75 leading-tight">
                          Lectura única tradicional a pantalla completa
                        </div>
                      </div>
                    </div>
                    {readingMode === 'single' && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </button>
                </div>

                {/* Si no es modo simple, mostrar selector rápido de versión a comparar */}
                {readingMode !== 'single' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">
                      Versión de comparación:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {VERSIONS.map((v) => {
                        const isSelected = parallelVersion === v.id;
                        return (
                          <button
                            key={`compare-ver-${v.id}`}
                            onClick={() => {
                              setParallelVersion(v.id);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-xs'
                                  : 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                                : isDark
                                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>{v.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
