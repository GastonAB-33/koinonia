import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { BookOpen, Plus, Tag, Calendar, User, Check, X } from 'lucide-react';

interface StudyListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyListModal: React.FC<StudyListModalProps> = ({ isOpen, onClose }) => {
  const { studies, activeStudyId, setActiveStudyId, createStudy } = useStudyStore();
  const { currentTheme } = useThemeStore();
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const tags = newTag.trim() ? [newTag.trim()] : ['Estudio'];
    createStudy(newTitle.trim(), tags);
    setNewTitle('');
    setNewTag('');
    setIsCreating(false);
    onClose();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-list-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`border shadow-2xl rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-700 text-white shadow-black/80' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Mis Estudios Bíblicos
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario rápido para crear nuevo estudio */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-indigo-50/30'}`}>
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Título del nuevo estudio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. El Pacto Abrahámico y las Promesas en Gálatas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'border-indigo-200 text-slate-800'
                  }`}
                  autoFocus
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Etiqueta principal (opcional):
                </label>
                <input
                  type="text"
                  placeholder="ej. Pactos, Matrimonio, Oración"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'border-indigo-200 text-slate-800'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg shadow-sm"
                >
                  Guardar y Abrir
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className={`w-full py-2 px-3 border-2 border-dashed rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                isDark
                  ? 'border-slate-700 hover:border-amber-500 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800'
                  : 'border-indigo-300 hover:border-indigo-500 text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50/50'
              }`}
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Crear Nuevo Estudio Temático</span>
            </button>
          )}
        </div>

        {/* Lista de Estudios */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {studies.map((study) => {
            const isActive = study.id === activeStudyId;
            return (
              <div
                key={study.id}
                onClick={() => {
                  setActiveStudyId(study.id);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isActive
                    ? isDark
                      ? 'border-amber-500 bg-amber-950/40 shadow-sm text-white'
                      : 'border-indigo-400 bg-indigo-50/60 shadow-sm'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800 text-white'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{study.title}</h4>
                    {isActive && (
                      <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                        Activo
                      </span>
                    )}
                  </div>
                  {study.description && (
                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{study.description}</p>
                  )}
                  <div className={`flex items-center gap-3 pt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {study.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {study.author}
                    </span>
                  </div>
                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {study.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isDark
                            ? 'bg-slate-700 text-slate-200 border border-slate-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  {isActive ? (
                    <Check className="w-5 h-5 text-amber-500" />
                  ) : (
                    <span className={`text-xs hover:underline ${isDark ? 'text-amber-400' : 'text-indigo-600'}`}>Abrir</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
