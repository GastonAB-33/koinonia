import React, { useState } from 'react';
import { VerseReference } from '../../types/study';
import { useThemeStore } from '../../store/useThemeStore';
import { Quote, BookOpen, Trash2, Edit3, Check } from 'lucide-react';

interface VerseQuoteCardProps {
  verseRef: VerseReference;
  comment?: string;
  onUpdateComment: (newComment: string) => void;
  onRemove: () => void;
}

export const VerseQuoteCard: React.FC<VerseQuoteCardProps> = ({
  verseRef,
  comment = '',
  onUpdateComment,
  onRemove
}) => {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [tempComment, setTempComment] = useState(comment);
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const handleSaveComment = () => {
    onUpdateComment(tempComment);
    setIsEditingComment(false);
  };

  return (
    <div
      className={`my-3 border-l-4 border-amber-500 rounded-r-2xl p-4 shadow-sm hover:shadow transition-all group relative ${
        isDark
          ? 'bg-slate-800/80 border-y border-r border-slate-700/60 text-white'
          : 'bg-gradient-to-r from-amber-50/70 via-stone-50/60 to-amber-50/40 text-slate-800'
      }`}
    >
      {/* Encabezado de la Cita */}
      <div
        className={`flex items-center justify-between pb-2 mb-2 border-b ${
          isDark ? 'border-slate-700' : 'border-amber-200/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className={`font-semibold text-sm font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {verseRef.bookName} {verseRef.chapter}:{verseRef.verse}
          </span>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              isDark
                ? 'text-amber-300 bg-amber-950/80 border border-amber-800/60'
                : 'text-amber-800 bg-amber-200/70'
            }`}
          >
            {verseRef.version}
          </span>
        </div>

        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar cita del estudio"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Texto bíblico citado: Blanco nítido en modo oscuro */}
      <div className="relative pl-6 pr-2 my-2">
        <Quote className="w-4 h-4 text-amber-400/80 absolute left-0 top-0 rotate-180" />
        <p
          className={`font-serif italic text-[16px] leading-relaxed ${
            isDark ? 'text-white font-normal' : 'text-slate-800'
          }`}
        >
          "{verseRef.text}"
        </p>
      </div>

      {/* Comentario / Observación personal o compartida */}
      <div className={`mt-3 pt-2 border-t ${isDark ? 'border-slate-700/60' : 'border-amber-100'}`}>
        {isEditingComment ? (
          <div className="space-y-2">
            <textarea
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              placeholder="Escribe tu reflexión o comentario sobre este versículo..."
              rows={2}
              className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-amber-300 text-slate-800'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingComment(false)}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveComment}
                className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Guardar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingComment(true)}
            className={`cursor-pointer group/comment flex items-start justify-between text-xs p-2 rounded-xl transition-colors ${
              isDark
                ? 'text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 bg-amber-100/30 hover:bg-amber-100/60'
            }`}
          >
            <p className="italic">
              {comment ? comment : 'Haz clic aquí para agregar tu nota o reflexión compartida sobre este versículo...'}
            </p>
            <Edit3
              className={`w-3 h-3 opacity-60 ml-2 shrink-0 ${
                isDark ? 'text-amber-400 group-hover/comment:text-amber-300' : 'text-slate-400 group-hover/comment:text-amber-700'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
