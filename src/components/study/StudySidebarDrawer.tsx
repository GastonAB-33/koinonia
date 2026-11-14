import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Study } from '../../types/study';
import { CreateStudyModal } from './CreateStudyModal';
import { StudyDetailModal } from './StudyDetailModal';
import { SmartSearchModal } from '../search/SmartSearchModal';
import {
  BookOpen,
  Plus,
  Search,
  X,
  Check,
  Tag,
  Download,
  Upload,
  BookMarked,
  FileText,
  Layers,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

interface StudySidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudySidebarDrawer: React.FC<StudySidebarDrawerProps> = ({ isOpen, onClose }) => {
  const {
    studies,
    activeStudyId,
    setActiveStudyId,
    createStudy
  } = useStudyStore();

  const { getStudyData } = useSketchbookStore();
  const { canvasByStudy } = useCanvasStore();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudyForDetail, setSelectedStudyForDetail] = useState<Study | null>(null);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inmovilizar la pantalla de atrás cuando el menú está abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedStudyForDetail) {
          setSelectedStudyForDetail(null);
        } else if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, selectedStudyForDetail, isCreateModalOpen]);

  // Lista de tags únicos
  const allTags = useMemo(() => {
    const set = new Set<string>();
    studies.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [studies]);

  // Estudios filtrados
  const filteredStudies = useMemo(() => {
    return studies.filter((s) => {
      const matchesTag = selectedTag === 'ALL' || s.tags?.includes(selectedTag);
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        (s.description ? s.description.toLowerCase().includes(query) : false) ||
        s.tags.some((t) => t.toLowerCase().includes(query));
      return matchesTag && matchesQuery;
    });
  }, [studies, selectedTag, searchQuery]);

  // Si cambia el estudio en store mientras el detalle está abierto, sincronizarlo
  useEffect(() => {
    if (selectedStudyForDetail) {
      const updated = studies.find((s) => s.id === selectedStudyForDetail.id);
      if (updated) {
        setSelectedStudyForDetail(updated);
      }
    }
  }, [studies, selectedStudyForDetail]);

  if (!isOpen) return null;

  // Exportar backup completo JSON de todos los estudios
  const handleExportFullBackup = () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      studies,
      sketchbooks: localStorage.getItem('koinonia-sketchbook-store'),
      canvas: localStorage.getItem('koinonia-canvas-store')
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koinonia-estudios-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.studies && Array.isArray(json.studies)) {
          json.studies.forEach((s: Study) => {
            if (!studies.find((exist) => exist.id === s.id)) {
              createStudy(s.title, s.tags, s.description);
            }
          });
          alert('¡Copia de seguridad restaurada con éxito!');
        }
      } catch (err) {
        alert('El archivo seleccionado no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  };

  const drawerContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex animate-in fade-in duration-200"
      style={{ touchAction: 'none' }}
    >
      {/* Fondo semitransparente fijo con clic para cerrar */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />

      {/* Cajón Lateral Izquierdo */}
      <div
        className={`relative z-10 w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl border-r transition-all animate-in slide-in-from-left duration-200 ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Cabecera Principal */}
        <div
          className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={`font-serif font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Mis Estudios
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {studies.length}
                </span>
              </div>
              <span className={`text-[11px] block -mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Toca cualquier estudio para ver detalles
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors shrink-0 ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Cerrar panel de estudios"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Garantía de Autoguardado */}
        <div
          className={`px-4 py-2 text-[11px] font-medium border-b flex items-center gap-2 shrink-0 ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="truncate">
            <strong>Autoguardado en tiempo real:</strong> Tus notas y dibujos se guardan automáticamente.
          </span>
        </div>

        {/* Botón de Creación con Modal Emergente */}
        <div className={`p-3.5 border-b shrink-0 ${isDark ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100 bg-amber-50/30'}`}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Nuevo Estudio</span>
          </button>
        </div>

        {/* Buscador y Filtro Inteligente */}
        <div className={`p-3 border-b space-y-2 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título o tema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Botón de Filtro Inteligente en Modal Emergente */}
            <button
              onClick={() => setIsSmartSearchOpen(true)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
              title="Abrir buscador con filtros inteligentes por tipo, fechas o etiquetas"
            >
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px]">Filtro</span>
            </button>
          </div>

          {/* Filtro por Etiquetas */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <button
                onClick={() => setSelectedTag('ALL')}
                className={`px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedTag === 'ALL'
                    ? isDark
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-800 text-white font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Todos ({studies.length})
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? isDark
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-amber-600 text-white font-bold'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Estudios: Títulos + Iconitos de Páginas, Notas y Nodos */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-2">
          {filteredStudies.map((study) => {
            const isActive = study.id === activeStudyId;
            const sketchbookData = getStudyData(study.id);
            const canvasData = canvasByStudy[study.id];

            const pageCount = sketchbookData?.pages?.length || 1;
            const blockCount = study.blocks?.length || 0;
            const nodeCount = canvasData?.nodes?.length || 0;
            const tagCount = study.tags?.length || 0;

            return (
              <div
                key={study.id}
                onClick={() => setSelectedStudyForDetail(study)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative flex flex-col gap-2 ${
                  isActive
                    ? isDark
                      ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                      : 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500/40'
                    : isDark
                    ? 'border-slate-800/90 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 text-slate-200'
                    : 'border-slate-200/90 bg-white hover:border-amber-300 hover:bg-amber-50/30 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Cabecera de la tarjeta: Título e Indicador */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-sm leading-snug group-hover:text-amber-500 transition-colors line-clamp-2">
                      {study.title}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs flex items-center gap-1 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                        <span>Activo</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-amber-500 transition-colors">
                    <span className="text-[10px] hidden sm:inline font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver info
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Métricas e Iconitos de Contenido Solicitados */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
                  {/* Icono de Páginas en Sketchbook */}
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-amber-950/40 border-amber-900/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                    title={`${pageCount} página(s) de sketchbook estilo Cornell`}
                  >
                    <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                    <span>{pageCount} pág{pageCount > 1 ? 's' : ''}</span>
                  </span>

                  {/* Icono de Bloques de Notas */}
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                    title={`${blockCount} bloques de texto, versículos y reflexiones`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{blockCount} nota{blockCount > 1 ? 's' : ''}</span>
                  </span>

                  {/* Icono de Nodos en Pizarra */}
                  {nodeCount > 0 && (
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                        isDark ? 'bg-blue-950/40 border-blue-900/60 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                      title={`${nodeCount} nodos conceptuales en la pizarra`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>{nodeCount} nodos</span>
                    </span>
                  )}

                  {/* Icono de Etiquetas */}
                  {tagCount > 0 && (
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                        isDark ? 'bg-purple-950/40 border-purple-900/60 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-900'
                      }`}
                      title={`Etiquetas: ${study.tags.join(', ')}`}
                    >
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>{tagCount} tag{tagCount > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStudies.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron estudios con el filtro seleccionado.
            </div>
          )}
        </div>

        {/* Pie del Menú Lateral: Copia de Seguridad */}
        <div
          className={`p-3.5 border-t flex flex-col gap-2 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Copia de Seguridad</span>
            </span>
            <span className="text-[10px] text-slate-400">Exportar / Restaurar</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportFullBackup}
              className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Descargar todos tus estudios y cuadernos en un archivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>Exportar Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Restaurar estudios desde un archivo JSON"
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" />
              <span>Importar Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>
      </div>

      {/* Modal Emergente de Creación de Nuevo Estudio (con múltiples etiquetas y fondo fijo) */}
      <CreateStudyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(id) => {
          setActiveStudyId(id);
          onClose();
        }}
      />

      {/* Panel Emergente de Detalle de Estudio (con más info y botón para ver) */}
      <StudyDetailModal
        study={selectedStudyForDetail}
        isOpen={Boolean(selectedStudyForDetail)}
        onClose={() => setSelectedStudyForDetail(null)}
        onSelectAndOpen={(id) => {
          setActiveStudyId(id);
          setSelectedStudyForDetail(null);
          onClose();
        }}
      />

      {/* Modal de Búsqueda Inteligente con Filtros */}
      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
        initialTypeFilter="studies"
      />
    </div>
  );

  return createPortal(drawerContent, document.body);
};
