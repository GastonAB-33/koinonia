import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Study } from '../../types/study';
import {
  BookOpen,
  Plus,
  Search,
  X,
  Check,
  Calendar,
  Tag,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  Sparkles,
  FileText,
  BookMarked,
  Layers,
  ShieldCheck,
  ChevronRight
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
    createStudy,
    deleteStudy,
    duplicateStudy,
    updateStudyTitle,
    exportActiveStudyAsMarkdown
  } = useStudyStore();

  const { getStudyData } = useSketchbookStore();
  const { canvasByStudy } = useCanvasStore();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [deletingStudyId, setDeletingStudyId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const tags = newTag.trim() ? [newTag.trim()] : ['Estudio'];
    createStudy(newTitle.trim(), tags, newDesc.trim() || undefined);
    setNewTitle('');
    setNewDesc('');
    setNewTag('');
    setIsCreating(false);
    onClose();
  };

  const handleStartRename = (study: Study, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudyId(study.id);
    setEditTitleInput(study.title);
  };

  const handleSaveRename = (studyId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitleInput.trim()) {
      updateStudyTitle(studyId, editTitleInput.trim());
    }
    setEditingStudyId(null);
  };

  const handleDuplicate = (studyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateStudy(studyId);
  };

  const handleDelete = (studyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingStudyId === studyId) {
      deleteStudy(studyId);
      setDeletingStudyId(null);
    } else {
      setDeletingStudyId(studyId);
      setTimeout(() => {
        setDeletingStudyId((prev) => (prev === studyId ? null : prev));
      }, 4000);
    }
  };

  const handleDownloadMarkdown = (study: Study, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStudyId(study.id);
    const md = exportActiveStudyAsMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          // Reemplazar o integrar
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
      className="fixed inset-0 z-[100] flex animate-in fade-in duration-200"
    >
      {/* Fondo semitransparente con clic para cerrar */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Cajón Lateral Izquierdo */}
      <div
        className={`relative z-10 w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl border-r transition-all animate-in slide-in-from-left duration-200 ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-white shadow-black/80'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal */}
        <div
          className={`p-4 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
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
              <span className={`text-[11px] block -mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Biblioteca personal & colaborativa
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
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
          className={`px-4 py-2 text-[11px] font-medium border-b flex items-center gap-2 ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Autoguardado en tiempo real:</strong> Tus notas, versículos y dibujos se guardan automáticamente en este dispositivo.
          </span>
        </div>

        {/* Botón de Creación / Formulario */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nuevo Estudio Bíblico</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>

              <input
                type="text"
                required
                autoFocus
                placeholder="Título del estudio (ej. Romanos 8: Vida en el Espíritu)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-amber-600'
                }`}
              />

              <input
                type="text"
                placeholder="Descripción corta o propósito del estudio..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-amber-600'
                }`}
              />

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Etiqueta (ej. Soteriología, Matrimonio)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-amber-600'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Crear y Abrir
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                isDark
                  ? 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-600/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
              }`}
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>+ Crear Nuevo Estudio</span>
            </button>
          )}
        </div>

        {/* Buscador y Filtro por Etiquetas */}
        <div className={`p-3 border-b space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="relative">
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

        {/* Lista de Estudios */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredStudies.map((study) => {
            const isActive = study.id === activeStudyId;
            const isEditing = editingStudyId === study.id;
            const sketchbookData = getStudyData(study.id);
            const canvasData = canvasByStudy[study.id];

            const pageCount = sketchbookData?.pages?.length || 1;
            const blockCount = study.blocks?.length || 0;
            const nodeCount = canvasData?.nodes?.length || 0;

            return (
              <div
                key={study.id}
                onClick={() => {
                  setActiveStudyId(study.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative ${
                  isActive
                    ? isDark
                      ? 'border-amber-500 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                      : 'border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-500/40'
                    : isDark
                    ? 'border-slate-800/90 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 text-slate-200'
                    : 'border-slate-200/90 bg-white hover:border-amber-300 hover:bg-amber-50/30 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Cabecera de la tarjeta: Título e Indicador de Activo */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(study.id, e)}
                      className="flex items-center gap-1.5 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        autoFocus
                        className={`w-full px-2 py-1 text-xs rounded-lg border focus:outline-none ${
                          isDark
                            ? 'bg-slate-800 border-amber-500 text-white'
                            : 'bg-white border-amber-500 text-slate-900'
                        }`}
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-lg bg-emerald-600 text-white"
                        title="Guardar nombre"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-sm leading-snug group-hover:text-amber-500 transition-colors">
                        {study.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Activo</span>
                        </span>
                      )}
                    </div>
                  )}

                  {!isEditing && (
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-amber-500' : 'text-slate-400 opacity-60'
                      }`}
                    />
                  )}
                </div>

                {/* Descripción si la tiene */}
                {study.description && (
                  <p className={`text-xs line-clamp-2 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {study.description}
                  </p>
                )}

                {/* Métricas de Contenido Guardado */}
                <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 mb-2 flex-wrap">
                  <span className="flex items-center gap-1" title="Páginas en Sketchbook">
                    <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                    <span>{pageCount} pág{pageCount > 1 ? 's' : ''}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1" title="Bloques en Cuaderno">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{blockCount} nota{blockCount > 1 ? 's' : ''}</span>
                  </span>
                  {nodeCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1" title="Nodos en Pizarra">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        <span>{nodeCount} nodos</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Etiquetas */}
                {study.tags && study.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {study.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isDark
                            ? 'bg-slate-800 text-slate-300 border border-slate-700/80'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pie de tarjeta con Fecha y Acciones Rápidas */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{study.createdAt}</span>
                  </span>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleStartRename(study, e)}
                      className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Renombrar título"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(study.id, e)}
                      className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Duplicar estudio"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDownloadMarkdown(study, e)}
                      className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Descargar estudio como Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(study.id, e)}
                      className={`p-1 rounded-lg transition-colors ${
                        deletingStudyId === study.id
                          ? 'bg-rose-600 text-white font-bold'
                          : 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-500'
                      }`}
                      title={deletingStudyId === study.id ? 'Confirmar eliminación' : 'Eliminar estudio'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
          className={`p-3.5 border-t flex flex-col gap-2 ${
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
    </div>
  );

  return createPortal(drawerContent, document.body);
};