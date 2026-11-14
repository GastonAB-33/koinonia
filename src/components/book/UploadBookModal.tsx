import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBibleStore } from '../../store/useBibleStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useThemeStore } from '../../store/useThemeStore';
import { geminiService } from '../../services/ai/geminiAIService';
import {
  BookOpen,
  Camera,
  Upload,
  Sparkles,
  Check,
  X,
  Trash2,
  Loader2,
  Tag,
  BookMarked
} from 'lucide-react';

interface UploadBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreated?: (bookId: string) => void;
}

interface PhotoPage {
  id: string;
  base64: string;
  mimeType: string;
  pageNum: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  title: string;
  transcription: string;
  errorMessage?: string;
}

/**
 * Comprime imágenes de celular para enviarlas rápido a la IA sin sobrecargar memoria
 */
const compressImage = (file: File, maxDim = 1600, quality = 0.85): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve({ base64: e.target?.result as string, mimeType: file.type || 'image/jpeg' });
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ base64: dataUrl, mimeType: 'image/jpeg' });
        } else {
          resolve({ base64: img.src, mimeType: file.type || 'image/jpeg' });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const UploadBookModal: React.FC<UploadBookModalProps> = ({ isOpen, onClose, onBookCreated }) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const { createCustomBook, selectCustomBook } = useBibleStore();
  const { createStudy } = useStudyStore();

  const [step, setStep] = useState<'details' | 'transcribing' | 'review' | 'success'>('details');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Libro', 'Estudio']);
  const [tagInput, setTagInput] = useState('');

  const [photos, setPhotos] = useState<PhotoPage[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number>(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);
  const [createdBookId, setCreatedBookId] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  // Limpiar estado al cerrar
  const handleResetAndClose = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setTags(['Libro', 'Estudio']);
    setPhotos([]);
    setStep('details');
    setCreatedBookId(null);
    onClose();
  };

  if (!isOpen) return null;

  // Agregar fotos desde archivo o cámara
  const handleAddFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newPages: PhotoPage[] = [];
    let startNum = photos.length + 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const compressed = await compressImage(file);
        newPages.push({
          id: `photo-${Date.now()}-${i}-${Math.random()}`,
          base64: compressed.base64,
          mimeType: compressed.mimeType,
          pageNum: startNum++,
          status: 'pending',
          title: `Capítulo ${startNum - 1}`,
          transcription: ''
        });
      } catch (err) {
        console.warn('Error al procesar foto:', err);
      }
    }

    setPhotos((prev) => [...prev, ...newPages]);
  };

  // Manejar etiquetas
  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Iniciar proceso de transcripción con Gemini
  const handleStartTranscription = async () => {
    if (!title.trim()) {
      alert('Por favor, ingresa un título para tu libro.');
      return;
    }
    if (photos.length === 0) {
      alert('Debes agregar al menos una foto de las páginas de tu libro.');
      return;
    }

    setStep('transcribing');

    const updated = [...photos];

    for (let i = 0; i < updated.length; i++) {
      setCurrentProcessingIndex(i);
      updated[i].status = 'processing';
      setPhotos([...updated]);

      try {
        const prompt = `Actúa como un transcriptor bíblico profesional y erudito.
Transcribe con máxima fidelidad la información de esta página de libro o cuaderno de estudio bíblico.
Conserva títulos, citas de versículos y estructura en Markdown ordenado.
Página #${i + 1} del libro "${title.trim()}".`;

        const text = await geminiService.transcribeStudyImage(
          updated[i].base64,
          updated[i].mimeType,
          prompt
        );

        updated[i].transcription = text;
        updated[i].status = 'done';
      } catch (err: any) {
        updated[i].status = 'error';
        updated[i].errorMessage = err?.message || 'Error en transcripción';
        updated[i].transcription = `*(Página ${i + 1}: No se pudo transcribir automáticamente. Puedes escribir o pegar el texto aquí manualmente).*`;
      }

      setPhotos([...updated]);
    }

    setStep('review');
    setActiveReviewIndex(0);
  };

  // Guardar el libro en el store
  const handleSaveBook = () => {
    const chaptersData = photos.map((p, idx) => ({
      title: p.title || `Capítulo ${idx + 1}`,
      content: p.transcription || 'Sin contenido transcripto.'
    }));

    const bookId = createCustomBook(
      title.trim() || 'Libro de Estudio Digitalizado',
      chaptersData,
      author.trim() || 'Notas Propias',
      description.trim() || `Libro digitalizado con IA a partir de ${photos.length} fotos.`,
      tags
    );

    setCreatedBookId(bookId);
    setStep('success');

    if (onBookCreated) {
      onBookCreated(bookId);
    }
  };

  // Abrir libro inmediatamente en el Lector Bíblico
  const handleOpenInReader = () => {
    if (createdBookId) {
      selectCustomBook(createdBookId, 1);
    }
    handleResetAndClose();
  };

  // Crear un Estudio Bíblico vinculado al libro
  const handleCreateStudyFromBook = () => {
    createStudy(
      `Estudio: ${title.trim()}`,
      [...tags, 'Libro'],
      `Estudio basado en el libro "${title.trim()}" digitalizado con IA.`
    );

    handleResetAndClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col justify-start sm:justify-center sm:items-center sm:p-4 bg-black/95 sm:bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-150"
      style={{ touchAction: 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'transcribing') handleResetAndClose();
      }}
    >
      <div
        className={`w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl rounded-none sm:rounded-3xl border-0 sm:border flex flex-col overflow-hidden shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/90'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
        style={{ touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-slate-950/90 border-slate-800'
              : 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base">Subir Libro con Fotos & IA</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini Vision OCR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Fotografía tus libros o cuadernos y compila un libro digital completo para estudiar
              </p>
            </div>
          </div>

          {step !== 'transcribing' && (
            <button
              onClick={handleResetAndClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Inputs de Carga Ocultos */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleAddFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleAddFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Contenido según el Paso Actual */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {/* PASO 1: METADATOS Y FOTOS */}
          {step === 'details' && (
            <div className="space-y-4">
              {/* Título y Autor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Título del Libro <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Comentario a Romanos..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-700 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Autor o Fuente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ej. Pastor John / Notas personales"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-700 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descripción o Resumen del Libro
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="De qué trata este libro o apuntes recopilados..."
                  rows={2}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none ${
                    isDark
                      ? 'bg-slate-950/70 border-slate-700 text-white focus:border-amber-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  }`}
                />
              </div>

              {/* Etiquetas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Etiquetas / Categorías
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Escribe y presiona Enter..."
                    className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-700 text-white focus:border-amber-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-400 cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sección de Fotos (Páginas) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Fotos de las Páginas ({photos.length})
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Puedes subir varias fotos juntas o tomar fotos en serie
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tomar Foto con Cámara</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className={`flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Fotos de Galería (Múltiples)</span>
                  </button>
                </div>

                {/* Galería de Miniaturas */}
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                    {photos.map((page, idx) => (
                      <div
                        key={page.id}
                        className={`relative rounded-2xl border p-2 flex flex-col gap-1.5 ${
                          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                          <img
                            src={page.base64}
                            alt={`Página ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/75 text-white">
                            Pág. {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== page.id))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                            title="Eliminar página"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhotos((prev) =>
                              prev.map((p) => (p.id === page.id ? { ...p, title: val } : p))
                            );
                          }}
                          placeholder={`Capítulo ${idx + 1}`}
                          className={`w-full px-2 py-1 rounded-lg border text-[11px] font-semibold text-center focus:outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-3xl p-6 text-center text-xs text-slate-400 ${
                      isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    Aún no has agregado fotos de páginas. Pulsa el botón de arriba para comenzar a fotografiar tu libro.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 2: EN PROGRESO DE TRANSCRIPCIÓN */}
          {step === 'transcribing' && (
            <div className="py-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-base">Transcribiendo y Compilando Libro</h3>
                <p className="text-xs text-slate-400">
                  Procesando página {currentProcessingIndex + 1} de {photos.length} con Gemini Vision...
                </p>
              </div>

              {/* Barra de Progreso */}
              <div className="max-w-md mx-auto w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((currentProcessingIndex + 1) / photos.length) * 100)}%`
                  }}
                />
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-lg mx-auto pt-2">
                {photos.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center flex flex-col items-center gap-1 ${
                      p.status === 'done'
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                        : p.status === 'processing'
                        ? 'bg-amber-950/40 border-amber-600 text-amber-400 animate-pulse'
                        : p.status === 'error'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {p.status === 'done' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : p.status === 'processing' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <span>Pág {idx + 1}</span>
                    )}
                    <span className="text-[9px]">Pág {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: REVISIÓN Y EDICIÓN DE CAPÍTULOS */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Revisa el Libro Generado</h3>
                  <p className="text-xs text-slate-400">
                    Puedes editar los títulos y textos de cada capítulo antes de guardarlo en tu biblioteca
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Transcripción completa
                </span>
              </div>

              {/* Selector de Capítulos / Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {photos.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeReviewIndex === idx
                        ? 'bg-amber-600 text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.title || `Capítulo ${idx + 1}`}
                  </button>
                ))}
              </div>

              {/* Editor del Capítulo Seleccionado */}
              {photos[activeReviewIndex] && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={photos[activeReviewIndex].title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhotos((prev) =>
                          prev.map((p, idx) => (idx === activeReviewIndex ? { ...p, title: val } : p))
                        );
                      }}
                      className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                      }`}
                      placeholder="Título del capítulo..."
                    />
                    <span className="text-[11px] text-slate-400 shrink-0">
                      Capítulo {activeReviewIndex + 1} de {photos.length}
                    </span>
                  </div>

                  <textarea
                    value={photos[activeReviewIndex].transcription}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhotos((prev) =>
                        prev.map((p, idx) => (idx === activeReviewIndex ? { ...p, transcription: val } : p))
                      );
                    }}
                    rows={12}
                    className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-none ${
                      isDark
                        ? 'bg-slate-950/70 border-slate-700 text-slate-100 focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                    }`}
                  />
                </div>
              )}
            </div>
          )}

          {/* PASO 4: ÉXITO Y ACCIONES */}
          {step === 'success' && (
            <div className="py-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-emerald-400">
                  ¡Libro Guardado con Éxito en tu Biblioteca!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  El libro <strong>«{title}»</strong> ha sido compilado con {photos.length} capítulos y está listo para ser leído, resaltado y estudiado.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleOpenInReader}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Leer Libro en el Lector</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateStudyFromBook}
                  className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Crear Estudio con este Libro</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones Inferior */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {step === 'details' && (
            <>
              <button
                type="button"
                onClick={handleResetAndClose}
                className={`py-2 px-4 rounded-xl border text-xs font-semibold ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleStartTranscription}
                disabled={!title.trim() || photos.length === 0}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Transcribir y Compilar ({photos.length} fotos)</span>
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                type="button"
                onClick={() => setStep('details')}
                className={`py-2 px-4 rounded-xl border text-xs font-semibold ${
                  isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                ← Volver a Fotos
              </button>

              <button
                type="button"
                onClick={handleSaveBook}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Libro en Biblioteca</span>
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
