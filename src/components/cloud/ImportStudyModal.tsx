import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CloudStudyPayload } from '../../types/cloud';
import { useCloudStore } from '../../store/useCloudStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useStudyStore } from '../../store/useStudyStore';
import {
  BookOpen,
  FileText,
  Layers,
  Copy,
  Check,
  X
} from 'lucide-react';

interface ImportStudyModalProps {
  studyPayload: CloudStudyPayload | null;
  isOpen: boolean;
  onClose: () => void;
  onImported?: (newStudyId: string) => void;
}

export const ImportStudyModal: React.FC<ImportStudyModalProps> = ({
  studyPayload,
  isOpen,
  onClose,
  onImported
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const { importSharedStudy } = useCloudStore();
  const { setMobileView } = useStudyStore();

  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isOpen || !studyPayload) return null;

  const handleImport = () => {
    setIsImporting(true);
    try {
      const newId = importSharedStudy(studyPayload);
      setImported(true);
      setTimeout(() => {
        onClose();
        if (onImported) {
          onImported(newId);
        } else {
          setMobileView('study');
        }
      }, 900);
    } finally {
      setIsImporting(false);
    }
  };

  const pageCount = studyPayload.sketchbookPages?.length || 0;
  const noteCount = studyPayload.blocks?.length || 0;
  const nodeCount = studyPayload.canvasNodes?.length || 0;

  return createPortal(
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
        className={`w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/90'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-gradient-to-r from-amber-50/90 to-indigo-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                Estudio Bíblico Compartido
              </span>
              <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
                Recibido desde la Nube
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isDark ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Estudio Compartido */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Autor y Perfil de quien compartió */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              {studyPayload.ownerPicture ? (
                <img src={studyPayload.ownerPicture} alt={studyPayload.author} className="w-full h-full object-cover" />
              ) : (
                studyPayload.author.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs truncate">Compartido por {studyPayload.author}</h4>
              <p className="text-[11px] text-slate-400 truncate">
                {studyPayload.ownerEmail || 'Hermano en la fe de Koinonía'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              Amigo
            </span>
          </div>

          {/* Ficha del Estudio */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-amber-500 dark:text-amber-400 leading-snug">
              {studyPayload.title}
            </h3>

            {studyPayload.description && (
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                {studyPayload.description}
              </p>
            )}

            {/* Métricas del contenido */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>{noteCount} {noteCount === 1 ? 'nota' : 'notas'}</span>
              </span>

              {pageCount > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>{pageCount} {pageCount === 1 ? 'pág. Cornell' : 'págs. Cornell'}</span>
                </span>
              )}

              {nodeCount > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>{nodeCount} {nodeCount === 1 ? 'nodo' : 'nodos de pizarra'}</span>
                </span>
              )}
            </div>

            {/* Etiquetas */}
            {studyPayload.tags && studyPayload.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {studyPayload.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Muestra previa de los primeros versículos o párrafos */}
          {studyPayload.blocks && studyPayload.blocks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Contenido preliminar:
              </span>
              <div
                className={`p-3 rounded-xl border text-xs space-y-2 max-h-36 overflow-y-auto ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {studyPayload.blocks.slice(0, 3).map((b: any, idx: number) => (
                  <div key={idx} className="pb-1.5 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                    {b.verseRef && (
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        {b.verseRef.bookName} {b.verseRef.chapter}:{b.verseRef.verse}
                      </p>
                    )}
                    <p className="line-clamp-2 leading-relaxed">{b.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div
          className={`px-5 py-3.5 border-t flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition-colors ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting || imported}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {imported ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Guardado en tus Estudios!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Clonar y Guardar en Mis Estudios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
