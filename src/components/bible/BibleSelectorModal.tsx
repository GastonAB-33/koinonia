import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBibleStore } from '../../store/useBibleStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BibleBook } from '../../types/bible';
import { getVerseCountForChapter } from '../../services/bible/mockBibleService';
import {
  BookOpen,
  ChevronRight,
  Search,
  X,
  ArrowLeft,
  Book,
  Sparkles,
  Layers
} from 'lucide-react';

interface BibleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SelectorStep = 'book' | 'chapter' | 'verse';
type TestamentFilter = 'ALL' | 'OT' | 'NT';

export const BibleSelectorModal: React.FC<BibleSelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    books,
    currentBookId,
    currentChapterNum,
    currentVersion,
    navigateToVerse
  } = useBibleStore();

  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [step, setStep] = useState<SelectorStep>('book');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [testamentFilter, setTestamentFilter] = useState<TestamentFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Al abrir el modal, sincronizar con el libro y capítulo actuales del lector
  useEffect(() => {
    if (isOpen) {
      const activeBook = books.find((b) => b.id === currentBookId) || books[0] || null;
      setSelectedBook(activeBook);
      setSelectedChapter(currentChapterNum || 1);
      setStep('book');
      setSearchQuery('');

      // Si el libro actual es del Nuevo Testamento y el filtro era OT, sincronizar
      if (activeBook && activeBook.testament === 'NT' && testamentFilter === 'OT') {
        setTestamentFilter('ALL');
      }

      // Deshabilitar scroll en el fondo mientras el modal está activo
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, books, currentBookId, currentChapterNum]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Enfocar buscador al cambiar al paso de libro
  useEffect(() => {
    if (isOpen && step === 'book') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, step]);

  // Filtrado de libros con soporte inteligente para búsqueda global
  const filteredBooks = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return books.filter((b) => {
      const matchesQuery =
        !normalizedQuery ||
        b.name.toLowerCase().includes(normalizedQuery) ||
        b.id.toLowerCase().includes(normalizedQuery);
      // Si el usuario escribe una búsqueda, busca en toda la Biblia (AT + NT)
      const matchesTestament =
        normalizedQuery.length > 0 ||
        testamentFilter === 'ALL' ||
        b.testament === testamentFilter;
      return matchesTestament && matchesQuery;
    });
  }, [books, testamentFilter, searchQuery]);

  // Libros divididos por testamento para presentación clara
  const otBooks = useMemo(() => filteredBooks.filter((b) => b.testament === 'OT'), [filteredBooks]);
  const ntBooks = useMemo(() => filteredBooks.filter((b) => b.testament === 'NT'), [filteredBooks]);

  // Total de versículos disponibles para el libro y capítulo seleccionados
  const totalVerses = useMemo(() => {
    if (!selectedBook) return 25;
    return getVerseCountForChapter(selectedBook.id, selectedChapter, currentVersion);
  }, [selectedBook, selectedChapter, currentVersion]);

  if (!isOpen) return null;

  // Acciones de navegación
  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setStep('chapter');
  };

  const handleSelectChapter = (chapterNum: number) => {
    setSelectedChapter(chapterNum);
    setStep('verse');
  };

  const handleOpenEntireChapter = async (chapterNum: number) => {
    if (!selectedBook) return;
    await navigateToVerse(selectedBook.id, chapterNum, 1);
    onClose();
  };

  const handleSelectVerse = async (verseNum: number) => {
    if (!selectedBook) return;
    await navigateToVerse(selectedBook.id, selectedChapter, verseNum);
    onClose();
  };

  const renderBookCard = (book: BibleBook) => {
    const isCurrent = book.id === currentBookId;
    const isSelected = selectedBook?.id === book.id;
    const isOT = book.testament === 'OT';

    return (
      <button
        key={book.id}
        onClick={() => handleSelectBook(book)}
        className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-150 group cursor-pointer ${
          isSelected || isCurrent
            ? isDark
              ? 'border-[#ff3344] bg-slate-800/95 shadow-[0_0_12px_rgba(255,51,68,0.25)] ring-1 ring-[#ff3344]'
              : 'border-amber-500 bg-amber-50/80 shadow-sm ring-1 ring-amber-500'
            : isDark
            ? 'border-slate-800 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800 text-slate-200'
            : 'border-slate-200/90 bg-white hover:border-amber-300 hover:bg-amber-50/40 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-1 w-full mb-1">
          <span className="font-bold text-sm sm:text-base group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            {book.name}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOT
                ? isDark
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                  : 'bg-amber-100 text-amber-800'
                : isDark
                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {book.testament}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{book.chaptersCount} caps</span>
          {(isSelected || isCurrent) && (
            <span className={`text-[10px] font-semibold ${isDark ? 'text-[#ff3344]' : 'text-amber-600'}`}>
              Activo
            </span>
          )}
        </div>
      </button>
    );
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bible-selector-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-800 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal con Breadcrumbs de Navegación */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          {/* Breadcrumbs de Navegación (Libro > Capítulo > Versículo) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm font-semibold">
            {/* Paso 1: Libro */}
            <button
              onClick={() => setStep('book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                step === 'book'
                  ? isDark
                    ? 'bg-[#ff3344] text-white shadow-[0_0_10px_rgba(255,51,68,0.5)] font-bold'
                    : 'bg-amber-600 text-white shadow-sm font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>{selectedBook ? selectedBook.name : 'Libro'}</span>
            </button>

            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />

            {/* Paso 2: Capítulo */}
            <button
              disabled={!selectedBook}
              onClick={() => setStep('chapter')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                step === 'chapter'
                  ? isDark
                    ? 'bg-[#ff3344] text-white shadow-[0_0_10px_rgba(255,51,68,0.5)] font-bold'
                    : 'bg-amber-600 text-white shadow-sm font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>Cap. {selectedChapter}</span>
            </button>

            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />

            {/* Paso 3: Versículo */}
            <button
              disabled={!selectedBook}
              onClick={() => setStep('verse')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                step === 'verse'
                  ? isDark
                    ? 'bg-[#ff3344] text-white shadow-[0_0_10px_rgba(255,51,68,0.5)] font-bold'
                    : 'bg-amber-600 text-white shadow-sm font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Versículo</span>
            </button>
          </div>

          {/* Botón de Cierre */}
          <button
            onClick={onClose}
            aria-label="Cerrar selector"
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PASO 1: SELECCIONAR LIBRO                                */}
        {/* ======================================================== */}
        {step === 'book' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Barra de Filtros y Búsqueda */}
            <div
              className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
              }`}
            >
              {/* Filtro por Testamento */}
              <div
                className={`flex items-center p-1 rounded-xl text-xs font-semibold ${
                  isDark ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <button
                  onClick={() => setTestamentFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    testamentFilter === 'ALL'
                      ? isDark
                        ? 'bg-slate-700 text-white shadow-sm font-bold'
                        : 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'hover:text-amber-500'
                  }`}
                >
                  Todos ({books.length})
                </button>
                <button
                  onClick={() => setTestamentFilter('OT')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    testamentFilter === 'OT'
                      ? isDark
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm font-bold'
                        : 'bg-white text-amber-900 shadow-sm font-bold'
                      : 'hover:text-amber-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>Antiguo Testamento ({books.filter((b) => b.testament === 'OT').length})</span>
                </button>
                <button
                  onClick={() => setTestamentFilter('NT')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    testamentFilter === 'NT'
                      ? isDark
                        ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm font-bold'
                        : 'bg-white text-blue-900 shadow-sm font-bold'
                      : 'hover:text-blue-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span>Nuevo Testamento ({books.filter((b) => b.testament === 'NT').length})</span>
                </button>
              </div>

              {/* Caja de Búsqueda */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar libro (ej. Mateo, Juan, Génesis)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-400 focus:border-[#ff3344] focus:ring-1 focus:ring-[#ff3344]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Cuadrícula de Libros con visualización estructurada por Testamento */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* CASO 1: Búsqueda activa */}
              {searchQuery.trim().length > 0 ? (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Resultados para "{searchQuery}" ({filteredBooks.length} libros encontrados en toda la Biblia):
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                    {filteredBooks.map((book) => renderBookCard(book))}
                  </div>
                </div>
              ) : (
                <>
                  {/* CASO 2: Antiguo Testamento (visible en 'ALL' y en 'OT') */}
                  {(testamentFilter === 'ALL' || testamentFilter === 'OT') && (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          <h4 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-amber-600 dark:text-amber-400">
                            Antiguo Testamento
                          </h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                            {otBooks.length} libros
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Génesis hasta Malaquías
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                        {otBooks.map((book) => renderBookCard(book))}
                      </div>
                    </div>
                  )}

                  {/* CASO 3: Nuevo Testamento (visible en 'ALL' y en 'NT') */}
                  {(testamentFilter === 'ALL' || testamentFilter === 'NT') && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-500/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <h4 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-blue-600 dark:text-blue-400">
                            Nuevo Testamento
                          </h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                            {ntBooks.length} libros
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Mateo hasta Apocalipsis
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                        {ntBooks.map((book) => renderBookCard(book))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {filteredBooks.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No se encontraron libros que coincidan con "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 2: SELECCIONAR CAPÍTULO                             */}
        {/* ======================================================== */}
        {step === 'chapter' && selectedBook && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Barra de Sub-cabecera con opciones rápidas */}
            <div
              className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('book')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Libros</span>
                </button>
                <div className="text-sm sm:text-base font-bold">
                  {selectedBook.name} <span className="text-slate-400 font-normal">({selectedBook.chaptersCount} capítulos)</span>
                </div>
              </div>

              {/* Botón rápido para abrir directamente el capítulo seleccionado */}
              <button
                onClick={() => handleOpenEntireChapter(selectedChapter)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#ff3344] hover:bg-[#e02838] text-white shadow-[0_0_12px_rgba(255,51,68,0.4)]'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Abrir Cap. {selectedChapter} completo</span>
              </button>
            </div>

            {/* Cuadrícula de Capítulos */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <p className={`text-xs mb-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Selecciona un capítulo para elegir versículo o abrirlo directamente:
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                  const isCurrent =
                    selectedBook.id === currentBookId && currentChapterNum === ch;
                  const isSelected = selectedChapter === ch;

                  return (
                    <button
                      key={ch}
                      onClick={() => handleSelectChapter(ch)}
                      className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-bold flex flex-col items-center justify-center transition-all ${
                        isSelected || isCurrent
                          ? isDark
                            ? 'bg-[#ff3344] text-white shadow-[0_0_12px_rgba(255,51,68,0.7)] font-black scale-105'
                            : 'bg-amber-500 text-white shadow-md font-black scale-105'
                          : isDark
                          ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                          : 'bg-slate-100 border border-slate-200/80 text-slate-700 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-900'
                      }`}
                    >
                      <span>{ch}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 3: SELECCIONAR VERSÍCULO                            */}
        {/* ======================================================== */}
        {step === 'verse' && selectedBook && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Barra de Sub-cabecera con opciones rápidas */}
            <div
              className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('chapter')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Capítulos</span>
                </button>
                <div className="text-sm sm:text-base font-bold">
                  {selectedBook.name} {selectedChapter} <span className="text-slate-400 font-normal">({totalVerses} versículos)</span>
                </div>
              </div>

              {/* Botón destacado: Leer capítulo completo desde el v.1 */}
              <button
                onClick={() => handleOpenEntireChapter(selectedChapter)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white'
                    : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Todo el capítulo (v. 1)</span>
              </button>
            </div>

            {/* Cuadrícula de Versículos */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <p className={`text-xs mb-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Haz clic en el número de versículo para saltar y enfocarlo de inmediato:
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
                {Array.from({ length: totalVerses }, (_, i) => i + 1).map((v) => (
                  <button
                    key={v}
                    onClick={() => handleSelectVerse(v)}
                    className={`h-11 sm:h-12 rounded-xl text-sm sm:text-base font-bold flex flex-col items-center justify-center transition-all ${
                      isDark
                        ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-[#ff3344] hover:text-white hover:border-[#ff3344] hover:shadow-[0_0_12px_rgba(255,51,68,0.6)]'
                        : 'bg-slate-100 border border-slate-200/80 text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md'
                    }`}
                  >
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};