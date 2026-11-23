import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Study } from '../../types/study';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useCloudStore } from '../../store/useCloudStore';
import {
  BookOpen,
  Calendar,
  User,
  Tag,
  BookMarked,
  FileText,
  Layers,
  Copy,
  Download,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  Quote,
  Share2
} from 'lucide-react';

interface StudyDetailModalProps {
  study: Study | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAndOpen: (studyId: string) => void;
}

export const StudyDetailModal: React.FC<StudyDetailModalProps> = ({
  study,
  isOpen,
  onClose,
  onSelectAndOpen
}) => {
  const {
    activeStudyId,
    updateStudyTitle,
    updateStudyDescription,
    addTagToStudy,
    removeTagFromStudy,
    duplicateStudy,
    deleteStudy,
    exportActiveStudyAsMarkdown
  } = useStudyStore();

  const { getStudyData } = useSketchbookStore();
  const { canvasByStudy } = useCanvasStore();
  const { currentTheme } = useThemeStore();
  const { setStudyToShare } = useCloudStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescInput, setEditDescInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Inmovilizar la pantalla de atrás cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sincronizar inputs cuando cambia el estudio
  useEffect(() => {
    if (study) {
      setEditTitleInput(study.title);
      setEditDescInput(study.description || '');
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsDeleting(false);
    }
  }, [study]);

  if (!isOpen || !study) return null;

  const isActive = study.id === activeStudyId;

  // Obtener datos de contenido asociados
  const sketchbookData = getStudyData(study.id);
  const canvasData = canvasByStudy[study.id];

  const pageCount = sketchbookData?.pages?.length || 1;
  const blockCount = study.blocks?.length || 0;
  const nodeCount = canvasData?.nodes?.length || 0;

  // Desglose de tipos de bloques
  const quoteCount = study.blocks.filter((b) => b.type === 'verse_quote').length;
  const insightCount = study.blocks.filter((b) => b.type === 'theological_insight').length;
  const reflectionCount = study.blocks.filter((b) => b.type === 'reflection').length;
  const paragraphCount = study.blocks.filter((b) => b.type === 'text' || b.type === 'heading').length;

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitleInput.trim()) {
      updateStudyTitle(study.id, editTitleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = () => {
    updateStudyDescription(study.id, editDescInput.trim());
    setIsEditingDesc(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      addTagToStudy(study.id, newTagInput.trim().replace(/^#+/, ''));
      setNewTagInput('');
    }
  };

  const handleDuplicate = () => {
    duplicateStudy(study.id);
    onClose();
  };

  const handleDelete = () => {
    if (isDeleting) {
      deleteStudy(study.id);
      setIsDeleting(false);
      onClose();
    } else {
      setIsDeleting(true);
    }
  };

  const handleDownloadMarkdown = () => {
    const md = exportActiveStudyAsMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex flex-col justify-start sm:justify-center sm:items-center sm:p-4 bg-black/95 sm:bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-xl rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 sm:border-slate-800 text-white shadow-black/90'
            : 'bg-white sm:border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Cabecera del Detalle */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Detalles del Estudio
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Estudio Activo</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Creado el {study.createdAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDark ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Detalle con Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Título del Estudio con botón de edición */}
          <div className="space-y-1">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitleInput}
                  onChange={(e) => setEditTitleInput(e.target.value)}
                  autoFocus
                  className={`flex-1 px-3 py-1.5 text-base font-bold font-serif rounded-xl border focus:outline-none ${
                    isDark ? 'bg-slate-950 border-amber-500 text-white' : 'bg-white border-amber-500 text-slate-900'
                  }`}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-3 group">
                <h1 className="font-serif font-bold text-xl sm:text-2xl leading-snug">
                  {study.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  title="Editar título"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Metadatos: Autor y Fecha */}
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Autor: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{study.author}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Última mod: {study.updatedAt}</span>
              </span>
            </div>
          </div>

          {/* Tarjeta de Métricas Rápidas (Iconitos de contenido) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Contenido del Estudio
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Páginas de Sketchbook */}
              <div
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-50/50 border-amber-200/80'
                }`}
              >
                <BookMarked className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-base font-bold">{pageCount}</span>
                <span className="text-[10px] text-slate-400">Página{pageCount > 1 ? 's' : ''} Sketch</span>
              </div>

              {/* Bloques de Estudio */}
              <div
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-emerald-50/50 border-emerald-200/80'
                }`}
              >
                <FileText className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-base font-bold">{blockCount}</span>
                <span className="text-[10px] text-slate-400">Nota{blockCount > 1 ? 's' : ''} / Bloques</span>
              </div>

              {/* Nodos de Pizarra */}
              <div
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-blue-50/50 border-blue-200/80'
                }`}
              >
                <Layers className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-base font-bold">{nodeCount}</span>
                <span className="text-[10px] text-slate-400">Nodos Pizarra</span>
              </div>
            </div>
          </div>

          {/* Descripción / Tesis del Estudio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Descripción / Resumen
              </span>
              {!isEditingDesc && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="text-[11px] text-amber-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{study.description ? 'Editar' : '+ Añadir descripción'}</span>
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-2">
                <textarea
                  value={editDescInput}
                  onChange={(e) => setEditDescInput(e.target.value)}
                  placeholder="Escribe un resumen o tesis central..."
                  rows={3}
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none ${
                    isDark ? 'bg-slate-950 border-amber-500 text-white' : 'bg-white border-amber-500 text-slate-900'
                  }`}
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingDesc(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDesc}
                    className="px-3.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {study.description || (
                  <span className="italic text-slate-400">
                    Sin descripción. Añade un breve resumen para orientar la investigación.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Desglose Detallado de Bloques */}
          {blockCount > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Estructura de Contenido
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {quoteCount > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Quote className="w-4 h-4 text-amber-500" />
                    <span><strong>{quoteCount}</strong> citas bíblicas</span>
                  </div>
                )}
                {insightCount > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span><strong>{insightCount}</strong> aportes doctrinales</span>
                  </div>
                )}
                {reflectionCount > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span><strong>{reflectionCount}</strong> reflexiones</span>
                  </div>
                )}
                {paragraphCount > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span><strong>{paragraphCount}</strong> secciones / texto</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etiquetas (Tags) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Etiquetas del Estudio
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {study.tags && study.tags.length > 0 ? (
                study.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                      isDark
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-800/80'
                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    <Tag className="w-3 h-3 text-purple-400" />
                    <span>#{tag}</span>
                    <button
                      onClick={() => removeTagFromStudy(study.id, tag)}
                      className="hover:text-red-400 ml-1 p-0.5 rounded-full"
                      title={`Quitar etiqueta #${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Sin etiquetas</span>
              )}

              {/* Input rápido para agregar tag */}
              <input
                type="text"
                placeholder="+ tag (Enter)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className={`text-xs px-2.5 py-1 border border-dashed rounded-xl focus:outline-none w-28 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-amber-400'
                    : 'border-slate-300 text-slate-800 focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Acciones de Gestión (Duplicar, Descargar, Compartir, Eliminar) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Gestión del Estudio & Nube
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setStudyToShare(study)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-indigo-950/40 border-indigo-800/80 hover:bg-indigo-900/60 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-950 shadow-2xs'
                }`}
                title="Compartir enlace en la nube con amigos o grupo"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compartir</span>
              </button>

              <button
                onClick={handleDuplicate}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
                title="Crear una copia de este estudio"
              >
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>Duplicar</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
                title="Exportar notas a archivo Markdown"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Exportar</span>
              </button>

              <button
                onClick={handleDelete}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDeleting
                    ? 'bg-rose-600 text-white border-rose-600 font-bold'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400'
                    : 'bg-white border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 shadow-2xs'
                }`}
                title="Eliminar este estudio bíblico"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? '¿Confirmar?' : 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Botones Inferior */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Volver a la lista
          </button>

          {/* BOTÓN PRINCIPAL: ABRIR / VER ESTUDIO */}
          <button
            onClick={() => onSelectAndOpen(study.id)}
            className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Abrir y Ver Estudio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
