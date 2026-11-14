import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudyStore } from '../../store/useStudyStore';
import { useBibleStore } from '../../store/useBibleStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Search,
  X,
  Filter,
  Calendar,
  Tag,
  BookOpen,
  Layers,
  ChevronRight,
  Clock,
  ArrowUpDown,
  BookMarked
} from 'lucide-react';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTypeFilter?: 'all' | 'studies' | 'books' | 'bible';
}

type ContentTypeFilter = 'all' | 'studies' | 'books' | 'bible';
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'older';
type SortOrder = 'recent' | 'oldest' | 'az';

interface SearchResultItem {
  id: string;
  type: 'study' | 'customBook' | 'bibleBook';
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  snippet: string;
  metrics: string;
  originalItem: any;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  initialTypeFilter = 'all'
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const { studies, setActiveStudyId } = useStudyStore();
  const { customBooks, books: bibleBooks, selectCustomBook, setBookAndChapter, exitCustomBook } = useBibleStore();
  const { getStudyData } = useSketchbookStore();
  const { canvasByStudy } = useCanvasStore();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>(initialTypeFilter);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar foco y filtro inicial al abrir
  useEffect(() => {
    if (isOpen) {
      setTypeFilter(initialTypeFilter);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialTypeFilter]);

  // Atajo ESC para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Recopilar todos los tags únicos de estudios y libros
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    studies.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    customBooks.forEach((b) => b.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [studies, customBooks]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filtrado y Búsqueda Inteligente Multi-recurso
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const matchesDate = (dateStr?: string) => {
      if (dateFilter === 'all' || !dateStr) return true;
      const time = new Date(dateStr).getTime();
      const diff = now - time;
      if (dateFilter === 'today') return diff <= oneDay;
      if (dateFilter === 'week') return diff <= oneWeek;
      if (dateFilter === 'month') return diff <= oneMonth;
      if (dateFilter === 'older') return diff > oneMonth;
      return true;
    };

    const matchesTags = (itemTags: string[] = []) => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every((st) => itemTags.includes(st));
    };

    // 1. Filtrar Estudios Bíblicos
    if (typeFilter === 'all' || typeFilter === 'studies') {
      studies.forEach((s) => {
        if (!matchesDate(s.updatedAt || s.createdAt)) return;
        if (!matchesTags(s.tags)) return;

        const titleMatch = s.title.toLowerCase().includes(q);
        const descMatch = s.description ? s.description.toLowerCase().includes(q) : false;
        const tagMatch = s.tags.some((t) => t.toLowerCase().includes(q));

        // Buscar también en el contenido de los bloques de notas del estudio
        let snippetMatch = '';
        if (q && s.blocks) {
          const matchingBlock = s.blocks.find((b) => {
            const verseRefStr = b.verseRef ? `${b.verseRef.bookId} ${b.verseRef.chapter}:${b.verseRef.verse}` : '';
            return (
              (b.content && b.content.toLowerCase().includes(q)) ||
              (verseRefStr && verseRefStr.toLowerCase().includes(q))
            );
          });
          if (matchingBlock) {
            const vRefStr = matchingBlock.verseRef ? `${matchingBlock.verseRef.bookId} ${matchingBlock.verseRef.chapter}:${matchingBlock.verseRef.verse}` : '';
            snippetMatch = matchingBlock.content || vRefStr || '';
          }
        }

        if (!q || titleMatch || descMatch || tagMatch || snippetMatch) {
          const sData = getStudyData(s.id);
          const cData = canvasByStudy[s.id];
          const pageCount = sData?.pages?.length || 1;
          const blockCount = s.blocks?.length || 0;
          const nodeCount = cData?.nodes?.length || 0;

          results.push({
            id: s.id,
            type: 'study',
            title: s.title,
            subtitle: s.author ? `Por ${s.author}` : 'Estudio propio',
            date: s.updatedAt || s.createdAt,
            tags: s.tags || [],
            snippet: snippetMatch || s.description || 'Sin descripción adicional.',
            metrics: `${pageCount} págs • ${blockCount} notas • ${nodeCount} nodos`,
            originalItem: s
          });
        }
      });
    }

    // 2. Filtrar Libros y Transcripciones Propias
    if (typeFilter === 'all' || typeFilter === 'books') {
      customBooks.forEach((b) => {
        if (!matchesDate(b.updatedAt || b.createdAt)) return;
        if (!matchesTags(b.tags)) return;

        const titleMatch = b.title.toLowerCase().includes(q);
        const authorMatch = b.author ? b.author.toLowerCase().includes(q) : false;
        const descMatch = b.description ? b.description.toLowerCase().includes(q) : false;
        const tagMatch = b.tags ? b.tags.some((t) => t.toLowerCase().includes(q)) : false;

        let snippetMatch = '';
        if (q && b.chapters) {
          for (const ch of b.chapters) {
            if (ch.content && ch.content.toLowerCase().includes(q)) {
              snippetMatch = ch.content.slice(0, 160) + '...';
              break;
            }
          }
        }

        if (!q || titleMatch || authorMatch || descMatch || tagMatch || snippetMatch) {
          results.push({
            id: b.id,
            type: 'customBook',
            title: b.title,
            subtitle: b.author ? `Autor: ${b.author}` : 'Libro digitalizado con IA',
            date: b.updatedAt || b.createdAt,
            tags: b.tags || ['Libro'],
            snippet: snippetMatch || b.description || 'Libro propio disponible para lectura y análisis.',
            metrics: `${b.chapters?.length || 1} capítulos`,
            originalItem: b
          });
        }
      });
    }

    // 3. Filtrar Libros de la Biblia
    if ((typeFilter === 'all' || typeFilter === 'bible') && selectedTags.length === 0 && dateFilter === 'all') {
      bibleBooks.forEach((b) => {
        const titleMatch = b.name.toLowerCase().includes(q);
        const idMatch = b.id.toLowerCase().includes(q);

        if (!q || titleMatch || idMatch) {
          results.push({
            id: b.id,
            type: 'bibleBook',
            title: b.name,
            subtitle: b.testament === 'OT' ? 'Antiguo Testamento' : 'Nuevo Testamento',
            date: '',
            tags: [b.testament === 'OT' ? 'AT' : 'NT', 'Escritura'],
            snippet: `Libro canónico de las Sagradas Escrituras (${b.chaptersCount} capítulos).`,
            metrics: `${b.chaptersCount} capítulos`,
            originalItem: b
          });
        }
      });
    }

    // Ordenamiento
    results.sort((a, b) => {
      if (sortOrder === 'az') {
        return a.title.localeCompare(b.title);
      }
      if (sortOrder === 'oldest') {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    return results;
  }, [query, typeFilter, selectedTags, dateFilter, sortOrder, studies, customBooks, bibleBooks, getStudyData, canvasByStudy]);

  if (!isOpen) return null;

  // Al hacer clic en un resultado
  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === 'study') {
      setActiveStudyId(item.id);
    } else if (item.type === 'customBook') {
      selectCustomBook(item.id, 1);
    } else if (item.type === 'bibleBook') {
      exitCustomBook();
      setBookAndChapter(item.id, 1);
    }
    onClose();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[195] flex flex-col justify-start sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      style={{ touchAction: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-2xl rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 sm:border-slate-700 text-white shadow-black/90'
            : 'bg-white sm:border-slate-200 text-slate-800 shadow-2xl'
        }`}
        style={{ touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior de Búsqueda */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center gap-3 shrink-0 ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, versículo, tema o contenido..."
              className={`w-full pr-8 py-1.5 text-sm font-sans focus:outline-none bg-transparent ${
                isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-0 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              showFiltersPanel || selectedTags.length > 0 || dateFilter !== 'all'
                ? 'bg-amber-600 text-white border-amber-600'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
            }`}
            title="Mostrar / ocultar filtros inteligentes"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtros</span>
            {(selectedTags.length > 0 || dateFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
            title="Cerrar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Tipo de Contenido */}
        <div
          className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs ${
            isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
              typeFilter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({searchResults.length})
          </button>

          <button
            onClick={() => setTypeFilter('studies')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              typeFilter === 'studies'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Mis Estudios ({studies.length})</span>
          </button>

          <button
            onClick={() => setTypeFilter('books')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              typeFilter === 'books'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Libros Propios ({customBooks.length})</span>
          </button>

          <button
            onClick={() => setTypeFilter('bible')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              typeFilter === 'bible'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Escrituras (66)</span>
          </button>
        </div>

        {/* Panel Desplegable de Filtros Inteligentes (Etiquetas + Fechas + Orden) */}
        {showFiltersPanel && (
          <div
            className={`p-4 border-b space-y-3.5 text-xs animate-in slide-in-from-top-2 duration-150 shrink-0 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Filtro por Fechas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Fecha de Modificación:
              </span>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {(
                  [
                    { id: 'all', label: 'Cualquier fecha' },
                    { id: 'today', label: 'Hoy' },
                    { id: 'week', label: 'Últimos 7 días' },
                    { id: 'month', label: 'Este mes' },
                    { id: 'older', label: 'Más antiguos' }
                  ] as const
                ).map((df) => (
                  <button
                    key={df.id}
                    onClick={() => setDateFilter(df.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      dateFilter === df.id
                        ? 'bg-amber-600 text-white font-bold'
                        : isDark
                        ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Etiquetas */}
            {availableTags.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Filtrar por Etiquetas ({selectedTags.length ? `${selectedTags.length} activas` : 'todas'}):
                  </span>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-[11px] text-amber-500 font-bold underline cursor-pointer"
                    >
                      Limpiar etiquetas
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : isDark
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        <span>#{tag}</span>
                        {isSelected && <X className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Orden de Resultados */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
                Ordenar por:
              </span>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setSortOrder('recent')}
                  className={`px-2 py-0.5 rounded-lg ${
                    sortOrder === 'recent' ? 'font-bold text-amber-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Más recientes
                </button>
                <span>•</span>
                <button
                  onClick={() => setSortOrder('az')}
                  className={`px-2 py-0.5 rounded-lg ${
                    sortOrder === 'az' ? 'font-bold text-amber-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alfabético (A-Z)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Resultados de Búsqueda */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-2.5">
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                  isDark
                    ? 'border-slate-800/90 bg-slate-900/70 hover:border-amber-500/80 hover:bg-slate-900 text-slate-200 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Cabecera del Resultado */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">
                    {/* Badge de Tipo */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                        item.type === 'study'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.type === 'customBook'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.type === 'study' ? (
                        <>
                          <BookMarked className="w-2.5 h-2.5" />
                          Estudio
                        </>
                      ) : item.type === 'customBook' ? (
                        <>
                          <BookOpen className="w-2.5 h-2.5" />
                          Libro Propio
                        </>
                      ) : (
                        <>
                          <Layers className="w-2.5 h-2.5" />
                          Biblia
                        </>
                      )}
                    </span>

                    <h4 className="font-serif font-bold text-sm group-hover:text-amber-500 transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-slate-400 group-hover:text-amber-500 transition-colors">
                    {item.date && (
                      <span className="text-[10px] flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Fragmento o Resumen */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>

                {/* Pie con Etiquetas y Métricas */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                          isDark ? 'bg-slate-950 border border-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="font-semibold text-[10px] text-slate-400">
                    {item.metrics}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-30" />
              <p className="font-semibold text-sm">No se encontraron resultados</p>
              <p className="text-xs max-w-xs mx-auto opacity-80">
                Prueba buscando con otras palabras clave o desactiva filtros de etiquetas o fechas.
              </p>
            </div>
          )}
        </div>

        {/* Barra de Estado Inferior */}
        <div
          className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] shrink-0 text-slate-400 ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span>
            {searchResults.length} {searchResults.length === 1 ? 'coincidencia' : 'coincidencias encontradas'}
          </span>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
              ESC para salir
            </kbd>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
