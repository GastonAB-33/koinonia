import React, { useState, useRef } from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { useStudyStore } from '../../store/useStudyStore';
import { useSketchbookStore } from '../../store/useSketchbookStore';
import { geminiService, getGeminiApiKey, setGeminiApiKey } from '../../services/ai/geminiAIService';
import {
  Camera,
  Upload,
  FileText,
  Check,
  Copy,
  Loader2,
  Sparkles,
  X,
  Key,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface StudyCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInserted?: (text: string) => void;
}

/**
 * Redimensiona y comprime imágenes pesadas del celular antes de enviarlas a la IA
 * Convierte fotos de 15MB en JPEGs livianos de ~300KB sin perder nitidez de lectura
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

export const StudyCameraModal: React.FC<StudyCameraModalProps> = ({ isOpen, onClose, onInserted }) => {
  const { currentTheme } = useThemeStore();
  const { addTextBlockToActiveStudy, activeStudyId } = useStudyStore();
  const { addTextBlock } = useSketchbookStore();

  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(() => Boolean(getGeminiApiKey()));
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(() => getGeminiApiKey());

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setTranscription('');
    setInserted(false);

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed.base64);
      setImageFile(compressed);

      // Iniciar transcripción automática inmediata
      processImage(compressed.base64, compressed.mimeType);
    } catch (err: any) {
      setErrorMessage('No se pudo procesar la imagen seleccionada.');
    }
  };

  const processImage = async (base64: string, mime: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await geminiService.transcribeStudyImage(base64, mime);
      setTranscription(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al transcribir la imagen con Gemini.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (imageFile) {
      processImage(imageFile.base64, imageFile.mimeType);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
    setTranscription('');
    setErrorMessage(null);
    setInserted(false);
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertIntoStudy = () => {
    if (!transcription) return;

    // 1. Si hay un estudio activo en el editor estructurado, insertar como bloque de texto
    addTextBlockToActiveStudy(transcription, 'text');

    // 2. Si hay páginas en el sketchbook activo, también añadir una tarjeta
    try {
      addTextBlock(activeStudyId, transcription);
    } catch {
      // Ignorar si no hay página abierta en sketchbook
    }

    if (onInserted) {
      onInserted(transcription);
    }

    setInserted(true);
    setTimeout(() => {
      onClose();
      handleReset();
    }, 1200);
  };

  const handleSaveKey = () => {
    setGeminiApiKey(tempKey.trim());
    setHasKey(Boolean(tempKey.trim()));
    setShowKeyInput(false);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-white shadow-black/90'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Cabecera del Modal */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-gradient-to-r from-amber-50/80 to-indigo-50/80 border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base">Transcribir Estudio con Cámara</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Toma una foto de tus apuntes manuscritos o libro para digitalizarlos en texto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs ocultos para Cámara o Galería */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />

        {/* Contenido Principal con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Banner de estado de API Key */}
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
              hasKey
                ? isDark
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : isDark
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 shrink-0" />
              <span>
                {hasKey ? (
                  <>
                    <strong>Google Gemini Vision activo.</strong> Transcripción con IA multimodal de alta precisión.
                  </>
                ) : (
                  <>
                    <strong>Modo simulado activo.</strong> Ingresa tu Gemini API Key gratuita para transcribir tus fotos reales en vivo.
                  </>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[11px] font-bold underline shrink-0 cursor-pointer"
            >
              {showKeyInput ? 'Ocultar' : 'Configurar Clave'}
            </button>
          </div>

          {/* Formulario desplegable para configurar API Key */}
          {showKeyInput && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-150 ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className="font-semibold block text-[11px] text-slate-400">
                Pega tu Gemini API Key (obtenida gratis en Google AI Studio):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
                <button
                  onClick={handleSaveKey}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Pantalla 1: Selección de Imagen (si aún no se cargó ninguna) */}
          {!imagePreview && (
            <div className="py-6 space-y-4">
              <div
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                  isDark
                    ? 'border-slate-700 bg-slate-950/40 hover:border-amber-500/60'
                    : 'border-slate-300 bg-slate-50/70 hover:border-amber-500/60'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
              >
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base mb-1">Elige cómo capturar tu estudio bíblico</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  Toma una foto nítida de tu libreta, apuntes pastorales, hojas con letra a mano o pasajes de libros.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  {/* Botón para activar cámara directamente en teléfonos */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tomar Foto con Cámara</span>
                  </button>

                  {/* Botón para seleccionar de galería o archivo */}
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDark
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir de Galería / Archivo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pantalla 2: Imagen Cargada y Resultado de Transcripción */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Miniatura de la Foto */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black/40 aspect-[3/4] max-h-64 md:max-h-none flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Captura del estudio bíblico"
                      className="w-full h-full object-contain"
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="text-xs font-semibold">Gemini está analizando la imagen...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleReset}
                    className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isDark
                        ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tomar otra foto</span>
                  </button>
                </div>

                {/* Área de Transcripción generada */}
                <div className="md:col-span-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      Texto Transcrito (Editable)
                    </span>
                    {transcription && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Listo para insertar
                      </span>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">Ocurrió un problema</p>
                        <p className="text-[11px] opacity-90">{errorMessage}</p>
                        <button
                          onClick={handleRetry}
                          className="mt-2 text-[11px] font-bold underline"
                        >
                          Reintentar transcripción
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder={
                      isProcessing
                        ? 'Analizando caligrafía, versículos y contenido doctrinal...'
                        : 'El texto transcripto aparecerá aquí...'
                    }
                    rows={10}
                    disabled={isProcessing}
                    className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-none transition-colors ${
                      isDark
                        ? 'bg-slate-950/60 border-slate-700 text-slate-100 focus:border-amber-400'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones Inferior */}
        {imagePreview && (
          <div
            className={`px-5 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <button
              onClick={handleCopy}
              disabled={!transcription || isProcessing}
              className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`py-2 px-3.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isDark
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                Cancelar
              </button>

              <button
                onClick={handleInsertIntoStudy}
                disabled={!transcription || isProcessing || inserted}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-40 transition-all cursor-pointer"
              >
                {inserted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Insertado en el Estudio!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Insertar en el Estudio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
