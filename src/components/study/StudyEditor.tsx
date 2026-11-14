import React, { useState } from 'react';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { VerseQuoteCard } from './VerseQuoteCard';
import {
  FileText,
  Plus,
  Heading,
  Lightbulb,
  HelpCircle,
  Copy,
  Check,
  Tag,
  X,
  Trash2
} from 'lucide-react';

export const StudyEditor: React.FC = () => {
  const {
    getActiveStudy,
    updateStudyTitle,
    updateStudyDescription,
    addTagToStudy,
    removeTagFromStudy,
    addTextBlockToActiveStudy,
    updateBlockContent,
    removeBlock,
    exportActiveStudyAsMarkdown
  } = useStudyStore();
  const { currentTheme } = useThemeStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const study = getActiveStudy();
  const [newTagInput, setNewTagInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!study) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-400">
        No hay ningún estudio seleccionado.
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      addTagToStudy(study.id, newTagInput.trim());
      setNewTagInput('');
    }
  };

  const handleCopyMarkdown = () => {
    const md = exportActiveStudyAsMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'
      }`}
    >
      {/* Barra de herramientas superior del estudio */}
      <div
        className={`px-6 py-3 flex items-center justify-between gap-4 border-b ${
          isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200/80 bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
            <FileText className="w-4 h-4 text-emerald-500" />
            Cuaderno de Estudio
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            | {study.blocks.length} elementos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-sm ${
              isDark
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title="Copiar estudio en formato Markdown para compartir"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Área de edición con scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Encabezado del Estudio */}
        <div className={`space-y-3 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <input
            type="text"
            value={study.title}
            onChange={(e) => updateStudyTitle(study.id, e.target.value)}
            placeholder="Título del Estudio..."
            className={`w-full text-2xl font-bold font-serif focus:outline-none focus:ring-0 border-b border-transparent transition-colors pb-1 ${
              isDark
                ? 'text-white placeholder:text-slate-500 hover:border-slate-700 focus:border-amber-400'
                : 'text-slate-900 placeholder:text-slate-300 hover:border-slate-200 focus:border-amber-500'
            }`}
          />

          <input
            type="text"
            value={study.description || ''}
            onChange={(e) => updateStudyDescription(study.id, e.target.value)}
            placeholder="Añade un breve resumen o tesis central de la investigación..."
            className={`w-full text-xs focus:outline-none border-none bg-transparent ${
              isDark ? 'text-slate-400 placeholder:text-slate-600' : 'text-slate-500 placeholder:text-slate-300'
            }`}
          />

          {/* Etiquetas y Metadatos */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Etiquetas:</span>
            {study.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
                <button
                  onClick={() => removeTagFromStudy(study.id, tag)}
                  className="hover:text-red-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ Añadir tag (Enter)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className={`text-xs px-2 py-0.5 border border-dashed rounded-full focus:outline-none w-32 ${
                isDark
                  ? 'border-slate-700 bg-slate-800/60 text-white placeholder-slate-500 focus:border-amber-400'
                  : 'border-slate-300 text-slate-800 rounded-full focus:border-amber-500'
              }`}
            />
          </div>
        </div>

        {/* Bloques de Contenido */}
        <div className="space-y-4">
          {study.blocks.map((block) => {
            if (block.type === 'heading') {
              return (
                <div key={block.id} className="relative group pt-4">
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Título de la sección..."
                    className={`w-full text-lg font-bold font-serif pb-1 border-b focus:outline-none bg-transparent ${
                      isDark
                        ? 'text-white border-slate-800 focus:border-amber-400 placeholder:text-slate-500'
                        : 'text-slate-800 border-slate-200 focus:border-amber-600'
                    }`}
                  />
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="absolute right-0 top-5 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar encabezado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            if (block.type === 'verse_quote' && block.verseRef) {
              return (
                <VerseQuoteCard
                  key={block.id}
                  verseRef={block.verseRef}
                  comment={block.content}
                  onUpdateComment={(newComment) => updateBlockContent(block.id, newComment)}
                  onRemove={() => removeBlock(block.id)}
                />
              );
            }

            if (block.type === 'theological_insight') {
              return (
                <div
                  key={block.id}
                  className={`relative group rounded-xl p-3.5 text-xs space-y-1.5 border ${
                    isDark
                      ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Aporte Teológico / Doctrinal</span>
                  </div>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    rows={2}
                    className={`w-full bg-transparent border-none focus:outline-none resize-none text-xs leading-relaxed ${
                      isDark ? 'text-amber-100 placeholder:text-amber-400/50' : 'text-slate-700'
                    }`}
                  />
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            if (block.type === 'reflection') {
              return (
                <div
                  key={block.id}
                  className={`relative group rounded-xl p-3.5 text-xs space-y-1.5 border ${
                    isDark
                      ? 'bg-purple-950/40 border-purple-900/60 text-purple-200'
                      : 'bg-purple-50/70 border-purple-200 text-purple-950'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 font-semibold ${isDark ? 'text-purple-400' : 'text-purple-800'}`}>
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Pregunta de Reflexión Compartida</span>
                  </div>
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    rows={2}
                    className={`w-full bg-transparent border-none focus:outline-none resize-none text-xs leading-relaxed ${
                      isDark ? 'text-purple-100 placeholder:text-purple-400/50' : 'text-slate-700'
                    }`}
                  />
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar bloque"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            // Bloque de texto estándar
            return (
              <div key={block.id} className="relative group">
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  placeholder="Escribe tus notas, reflexiones u observaciones aquí..."
                  rows={3}
                  className={`w-full p-3 rounded-xl border focus:outline-none text-sm leading-relaxed resize-none transition-colors ${
                    isDark
                      ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 focus:border-indigo-400 text-white placeholder-slate-500'
                      : 'bg-white border-transparent hover:border-slate-200 focus:border-indigo-400 text-slate-700'
                  }`}
                />
                <button
                  onClick={() => removeBlock(block.id)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar párrafo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Barra para agregar nuevos bloques */}
        <div className={`pt-4 border-t flex flex-wrap items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className={`text-xs font-medium mr-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            Insertar:
          </span>

          <button
            onClick={() => addTextBlockToActiveStudy('', 'text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Plus className="w-3 h-3" /> Párrafo
          </button>

          <button
            onClick={() => addTextBlockToActiveStudy('', 'heading')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Heading className="w-3 h-3" /> Título de Sección
          </button>

          <button
            onClick={() => addTextBlockToActiveStudy('Nueva nota teológica...', 'theological_insight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60'
                : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900'
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-400" /> Aporte Teológico
          </button>

          <button
            onClick={() => addTextBlockToActiveStudy('¿Qué nos enseña este pasaje para nuestra vida diaria?', 'reflection')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark
                ? 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60'
                : 'bg-purple-100/70 hover:bg-purple-200 text-purple-900'
            }`}
          >
            <HelpCircle className="w-3 h-3 text-purple-400" /> Pregunta de Reflexión
          </button>
        </div>
      </div>
    </div>
  );
};
