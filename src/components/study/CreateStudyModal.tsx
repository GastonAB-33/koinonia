import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStudyStore } from '../../store/useStudyStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Sparkles,
  X,
  Plus,
  Tag,
  BookOpen,
  FileText,
  User,
  Check
} from 'lucide-react';

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (studyId: string) => void;
}

const SUGGESTED_TAGS = [
  'Teología',
  'Cristología',
  'Exégesis',
  'Doctrina',
  'Oración',
  'Matrimonio',
  'Discipulado',
  'Pacto',
  'Soteriología',
  'Escatología'
];

export const CreateStudyModal: React.FC<CreateStudyModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { createStudy } = useStudyStore();
  const { getActiveAuthorName } = useAuthStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Personal']);
  const [tagInput, setTagInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Inmovilizar la pantalla de atrás cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Focus en el título
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

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

  if (!isOpen) return null;

  // Manejo de adición de etiquetas
  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const trimmed = raw.trim().replace(/^#+/, '');
    if (!trimmed) return;

    // Si contiene comas, separar en múltiples
    const splitted = trimmed
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setTags((prev) => {
      const set = new Set(prev);
      splitted.forEach((t) => set.add(t));
      return Array.from(set);
    });

    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || (e.key === ' ' && tagInput.trim().length > 1)) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Eliminar el último tag si el input está vacío
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Si quedó algo en el input de tags, agregarlo antes de crear
    let finalTags = [...tags];
    if (tagInput.trim()) {
      const pending = tagInput
        .split(',')
        .map((t) => t.trim().replace(/^#+/, ''))
        .filter((t) => t.length > 0);
      finalTags = Array.from(new Set([...finalTags, ...pending]));
    }

    if (finalTags.length === 0) {
      finalTags = ['Estudio'];
    }

    const newStudy = createStudy(
      title.trim(),
      finalTags,
      description.trim() || undefined
    );

    // Limpiar estado
    setTitle('');
    setDescription('');
    setTags(['Personal']);
    setTagInput('');

    if (onCreated) {
      onCreated(newStudy.id);
    }
    onClose();
  };

  const authorName = getActiveAuthorName();

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[150] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ touchAction: 'none' }}
    >
      <div
        className={`w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-lg rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 sm:border-slate-800 text-white shadow-black/90'
            : 'bg-white sm:border-slate-200 text-slate-800 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">Nuevo Estudio Bíblico</h2>
              <p className="text-[11px] text-slate-400">Crea un cuaderno de investigación y notas</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Principal con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
            {/* Título del Estudio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Título del Estudio <strong className="text-rose-500">*</strong></span>
              </label>
              <input
                ref={inputRef}
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ej. Romanos 8: Vida en el Espíritu y Victoria"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-amber-600/20'
                }`}
              />
            </div>

            {/* Descripción / Tesis del Estudio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Descripción o Propósito (Opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve resumen, tesis exegética o pasajes centrales que se investigarán..."
                rows={3}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 resize-none transition-all ${
                  isDark
                    ? 'bg-slate-950/60 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500/20'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600 focus:ring-amber-600/20'
                }`}
              />
            </div>

            {/* Sistema de Múltiples Etiquetas (Tags) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Etiquetas ({tags.length})</span>
                </label>
                <span className="text-[11px] text-slate-400">Presiona Enter o coma para agregar</span>
              </div>

              {/* Lista de tags agregados */}
              <div
                className={`p-2.5 rounded-2xl border min-h-[50px] flex flex-wrap items-center gap-1.5 transition-colors ${
                  isDark ? 'bg-slate-950/70 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs animate-in zoom-in-95 duration-100 ${
                      isDark
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-800/80'
                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded-full hover:bg-black/20 dark:hover:bg-white/20 ml-0.5"
                      title={`Eliminar etiqueta #${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Input para agregar nuevos tags */}
                <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) handleAddTag();
                    }}
                    placeholder={tags.length === 0 ? 'Escribe una etiqueta...' : '+ Añadir otra...'}
                    className={`flex-1 px-2 py-1 bg-transparent text-xs focus:outline-none ${
                      isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sugerencias Rápidas de Etiquetas */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sugerencias rápidas:
                </span>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_TAGS.filter((sug) => !tags.includes(sug)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddTag(sug)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        isDark
                          ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-2xs'
                      }`}
                    >
                      <Plus className="w-2.5 h-2.5 text-purple-400" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Autor asignado */}
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>Autor del estudio:</span>
              </div>
              <span className="font-bold text-amber-500">{authorName}</span>
            </div>
          </div>

          {/* Barra de Botones Inferior */}
          <div
            className={`px-5 py-3.5 border-t flex items-center justify-end gap-2.5 shrink-0 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Crear y Abrir Estudio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
