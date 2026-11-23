import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Study } from '../../types/study';
import { StudyVisibility } from '../../types/cloud';
import { useCloudStore } from '../../store/useCloudStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Users,
  Lock,
  Heart,
  Download,
  MessageCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ShareStudyModalProps {
  study: Study | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareStudyModal: React.FC<ShareStudyModalProps> = ({ study, isOpen, onClose }) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark' || currentTheme === 'dark-blackout';

  const { shareStudy } = useCloudStore();

  const [visibility, setVisibility] = useState<StudyVisibility>(study?.visibility || 'public');
  const [allowCopy, setAllowCopy] = useState<boolean>(study?.allowCopy ?? true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>(() => {
    if (study?.shareCode && typeof window !== 'undefined') {
      return `${window.location.origin}/?study=${study.shareCode}`;
    }
    return '';
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen || !study) return null;

  const handleGenerateOrUpdate = async () => {
    setIsGenerating(true);
    try {
      const res = await shareStudy(study, visibility, allowCopy);
      setGeneratedUrl(res.shareUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!generatedUrl) return;
    const msg = encodeURIComponent(
      `📖 Te comparto este estudio bíblico en Koinonía: "${study.title}"\n\nPuedes abrirlo aquí:\n${generatedUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(study, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.title.replace(/[/\\?%*:|"<>]/g, '-')}.kstudy`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-sm sm:text-base leading-tight truncate">Compartir Estudio Bíblico</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> Nube
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Envía tus notas, versículos y bosquejos a tus amigos o grupo
              </p>
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

        {/* Contenido Desplazable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Tarjeta del Estudio a Compartir */}
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estudio Seleccionado:</span>
            <h3 className="font-bold text-sm text-amber-500 dark:text-amber-400 leading-snug">{study.title}</h3>
            {study.description && (
              <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{study.description}</p>
            )}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Autor: <strong>{study.author}</strong></span>
              <span>·</span>
              <span>{study.blocks.length} notas / párrafos</span>
            </div>
          </div>

          {/* Selector de Nivel de Privacidad */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ¿Quién puede acceder a este estudio?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Opción 1: Público con Enlace */}
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  visibility === 'public'
                    ? isDark
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/50 shadow-xs'
                      : 'border-indigo-400 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-400/50 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-xs">Público con Enlace</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">Cualquiera con el link puede leer tu estudio.</p>
                </div>
              </button>

              {/* Opción 2: Solo Amigos */}
              <button
                type="button"
                onClick={() => setVisibility('friends')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  visibility === 'friends'
                    ? isDark
                      ? 'border-amber-500 bg-amber-950/40 text-white ring-1 ring-amber-500/50 shadow-xs'
                      : 'border-amber-400 bg-amber-50/80 text-amber-950 ring-1 ring-amber-400/50 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-xs">Solo Amigos</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">Solo los amigos que agregues a tu red Koinonía.</p>
                </div>
              </button>

              {/* Opción 3: Modo Pareja */}
              <button
                type="button"
                onClick={() => setVisibility('couple')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  visibility === 'couple'
                    ? isDark
                      ? 'border-rose-500 bg-rose-950/40 text-white ring-1 ring-rose-500/50 shadow-xs'
                      : 'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400/50 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-xs">Modo Pareja</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">Compartido íntimo para estudio con tu cónyuge.</p>
                </div>
              </button>

              {/* Opción 4: Privado */}
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  visibility === 'private'
                    ? isDark
                      ? 'border-slate-600 bg-slate-800 text-white ring-1 ring-slate-600 shadow-xs'
                      : 'border-slate-400 bg-slate-100 text-slate-950 ring-1 ring-slate-400 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-xs">Privado (Solo yo)</p>
                  <p className="text-[11px] opacity-80 leading-relaxed">Nadie más tiene acceso a este estudio.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Permiso de Copia / Clonación */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div>
              <p className="font-bold">Permitir que otros lo copien</p>
              <p className="text-[11px] text-slate-400">Tus amigos podrán clonar este estudio a su propio cuaderno.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowCopy}
                onChange={(e) => setAllowCopy(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Botón de Generar o Actualizar Enlace */}
          <button
            type="button"
            onClick={handleGenerateOrUpdate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando enlace en la nube...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>{generatedUrl ? 'Actualizar Enlace en la Nube' : 'Publicar y Generar Enlace'}</span>
              </>
            )}
          </button>

          {/* Enlace Generado y Botones Rápidos de Compartir */}
          {generatedUrl && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Enlace para enviar a tus amigos:
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono select-all focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-indigo-300' : 'bg-slate-50 border-slate-300 text-indigo-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* Botón de Enviar por WhatsApp */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Descargar archivo .kstudy de respaldo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-end shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-colors ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
